import { Button } from "@/components/ui/button";
import { Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  campaignId: string;
  title: string;
  description: string;
  url?: string;
}

export function SocialShare({ campaignId, title, description, url }: SocialShareProps) {
  const shareUrl = url || `${window.location.origin}/campaign/${campaignId}?ref=share`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const handleShare = (platform: string, shareLink: string) => {
    // Track the share event
    trackShare(platform, campaignId);
    window.open(shareLink, "_blank", "width=600,height=400");
  };

  const trackShare = async (platform: string, campaignId: string) => {
    try {
      // You can log this to your database or analytics service
      console.log(`Shared on ${platform} - Campaign: ${campaignId}`);
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Share this campaign</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("WhatsApp", shareLinks.whatsapp)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("Twitter", shareLinks.twitter)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("Facebook", shareLinks.facebook)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>

        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Copy Link
        </Button>
      </div>
    </div>
  );
}
