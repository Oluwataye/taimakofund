import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Share2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  donors: number;
  verified: boolean;
  category: string;
  daysLeft: number;
}

const CampaignCard = ({
  id,
  title,
  description,
  image,
  goal,
  raised,
  donors,
  verified,
  category,
  daysLeft,
}: CampaignCardProps) => {
  const progress = (raised / goal) * 100;
  const formattedGoal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(goal);
  const formattedRaised = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(raised);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/campaign/${id}`}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {verified && (
              <Badge className="bg-trust text-trust-foreground gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
            <Badge variant="secondary">{category}</Badge>
          </div>
        </div>
      </Link>

      <div className="p-5 space-y-4">
        <Link to={`/campaign/${id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{description}</p>
        </Link>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="font-bold text-primary">{formattedRaised}</p>
              <p className="text-muted-foreground text-xs">of {formattedGoal}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{donors} donors</p>
              <p className="text-muted-foreground text-xs">{daysLeft} days left</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-colors">
            <Heart className="w-4 h-4" />
            Donate
          </button>
          <button className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
