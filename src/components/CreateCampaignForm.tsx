import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const campaignSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(500),
  story: z.string().min(100, 'Story must be at least 100 characters'),
  category: z.enum(['healthcare', 'education', 'business', 'emergency', 'community']),
  goal_amount: z.number().min(1000, 'Goal must be at least ₦1,000'),
  location_state: z.string().min(1, 'Please select a state'),
  location_lga: z.string().optional(),
  deadline: z.string().optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Campaign details' },
  { id: 2, title: 'Story', description: 'Tell your story' },
  { id: 3, title: 'Media', description: 'Images and videos' },
  { id: 4, title: 'Verification', description: 'Upload documents' },
];

export function CreateCampaignForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      story: '',
      category: 'healthcare',
      goal_amount: 0,
      location_state: '',
      location_lga: '',
      deadline: '',
      image_url: '',
      video_url: '',
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVerificationDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per file.`);
        return false;
      }
      return true;
    });
    setVerificationDocs(prev => [...prev, ...validFiles]);
  };

  const removeVerificationDoc = (index: number) => {
    setVerificationDocs(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async () => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('campaign-images')
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadVerificationDocs = async (campaignId: string) => {
    if (verificationDocs.length === 0 || !user) return [];

    const uploadPromises = verificationDocs.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${campaignId}/${Date.now()}-${file.name}`;

      const { error: uploadError, data } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return {
        name: file.name,
        path: fileName,
        size: file.size,
        type: file.type,
      };
    });

    return await Promise.all(uploadPromises);
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a campaign');
      return;
    }

    setUploading(true);

    try {
      // Upload image
      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          title: data.title,
          description: data.description,
          story: data.story,
          category: data.category,
          goal_amount: data.goal_amount,
          location_state: data.location_state,
          location_lga: data.location_lga,
          deadline: data.deadline || null,
          image_url: imageUrl || null,
          video_url: data.video_url || null,
          creator_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Upload verification documents
      const docs = await uploadVerificationDocs(campaign.id);
      
      if (docs.length > 0) {
        await supabase
          .from('campaigns')
          .update({ verification_documents: docs })
          .eq('id', campaign.id);
      }

      toast.success('Campaign created successfully! It will be reviewed by our team.');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setUploading(false);
    }
  };

  const nextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await form.trigger(fields as any);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepFields = (step: number): (keyof CampaignFormData)[] => {
    switch (step) {
      case 1:
        return ['title', 'description', 'category', 'goal_amount', 'location_state', 'location_lga', 'deadline'];
      case 2:
        return ['story'];
      case 3:
        return ['image_url', 'video_url'];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Help John recover from surgery" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief summary of your campaign (max 500 characters)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Amount (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="100000"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_STATES.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location_lga"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LGA (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Local Government Area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Story */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Story</FormLabel>
                        <FormControl>
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            className="bg-background"
                            modules={{
                              toolbar: [
                                [{ header: [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                ['link'],
                                ['clean'],
                              ],
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Tell your story in detail. Why do you need this support?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Media */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <FormLabel>Campaign Image</FormLabel>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                          ) : (
                            <div className="space-y-2">
                              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload campaign image (max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add a YouTube or Vimeo video link
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Verification */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <FormLabel>Verification Documents</FormLabel>
                    <FormDescription className="mb-4">
                      Upload supporting documents (IDs, medical reports, invoices, etc.)
                    </FormDescription>
                    
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      multiple
                      onChange={handleVerificationDocsChange}
                      className="hidden"
                      id="docs-upload"
                    />
                    <label htmlFor="docs-upload">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Click to upload documents (max 10MB each)
                        </p>
                      </div>
                    </label>

                    {verificationDocs.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {verificationDocs.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm truncate flex-1">{doc.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVerificationDoc(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={uploading}>
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Campaign
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
