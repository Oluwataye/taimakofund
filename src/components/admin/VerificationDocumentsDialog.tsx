import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, FileText, ExternalLink, MapPin, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  profiles: {
    full_name: string;
    phone_number: string | null;
  } | null;
};

interface VerificationDocumentsDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function VerificationDocumentsDialog({
  campaign,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: VerificationDocumentsDialogProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const documents = Array.isArray(campaign.verification_documents)
    ? campaign.verification_documents
    : [];

  const handleImageError = (url: string) => {
    setImageErrors((prev) => ({ ...prev, [url]: true }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Campaign Review</DialogTitle>
          <DialogDescription>
            Review campaign details and verification documents
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Campaign Info */}
            <div>
              <h3 className="font-semibold mb-3">Campaign Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{campaign.title}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{campaign.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline">{campaign.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Goal Amount</p>
                    <p className="font-medium">{formatCurrency(Number(campaign.goal_amount))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </p>
                    <p className="text-sm">
                      {campaign.location_lga ? `${campaign.location_lga}, ` : ''}{campaign.location_state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Deadline
                    </p>
                    <p className="text-sm">
                      {campaign.deadline
                        ? new Date(campaign.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Creator Info */}
            <div>
              <h3 className="font-semibold mb-3">Creator Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{campaign.profiles?.full_name || 'Unknown'}</p>
                </div>
                {campaign.profiles?.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{campaign.profiles.phone_number}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Story */}
            <div>
              <h3 className="font-semibold mb-3">Campaign Story</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm whitespace-pre-wrap">{campaign.story}</p>
              </div>
            </div>

            <Separator />

            {/* Bank Details */}
            {campaign.bank_details && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Bank Details</h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    {typeof campaign.bank_details === 'object' && campaign.bank_details !== null && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{(campaign.bank_details as any).bank_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">{(campaign.bank_details as any).account_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="font-medium">{(campaign.bank_details as any).account_name}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Verification Documents */}
            <div>
              <h3 className="font-semibold mb-3">Verification Documents</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {documents.map((doc: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      {doc.url && !imageErrors[doc.url] ? (
                        <img
                          src={doc.url}
                          alt={doc.name || `Document ${index + 1}`}
                          className="w-full h-48 object-cover rounded"
                          onError={() => handleImageError(doc.url)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium truncate">
                        {doc.name || `Document ${index + 1}`}
                      </p>
                      {doc.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Image */}
            {campaign.image_url && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Campaign Image</h3>
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {campaign.status === 'pending' && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={onReject}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Campaign
            </Button>
            <Button
              onClick={onApprove}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Campaign
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
