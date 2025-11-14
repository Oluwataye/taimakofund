import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

const donationSchema = z.object({
  amount: z.number().min(100, "Minimum donation is ₦100"),
  email: z.string().email("Invalid email address"),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
  isAnonymous: z.boolean(),
});

interface DonateDialogProps {
  campaignId: string;
  campaignTitle: string;
}

export default function DonateDialog({ campaignId, campaignTitle }: DonateDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDonate = async () => {
    try {
      setIsLoading(true);

      // Validate form
      const formData = donationSchema.parse({
        amount: parseFloat(amount),
        email: email || user?.email || "",
        message,
        isAnonymous,
      });

      // Call initialize-payment edge function
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: {
          campaignId,
          amount: formData.amount,
          email: formData.email,
          metadata: {
            donor_id: user?.id || null,
            is_anonymous: formData.isAnonymous,
            message: formData.message || null,
          },
        },
      });

      if (error) throw error;

      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Donation Failed",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="lg">
          <Heart className="w-5 h-5" />
          Donate Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Support This Campaign</DialogTitle>
          <DialogDescription>
            Make a donation to "{campaignTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ₦{preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              defaultValue={user?.email || ""}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Share words of encouragement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm font-normal cursor-pointer"
            >
              Make this donation anonymous
            </Label>
          </div>

          {/* Donate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleDonate}
            disabled={isLoading || !amount || !email}
          >
            {isLoading ? "Processing..." : `Donate ₦${amount ? parseFloat(amount).toLocaleString() : "0"}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to Paystack to complete your payment securely.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
