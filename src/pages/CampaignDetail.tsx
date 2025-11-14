import Navigation from "@/components/Navigation";
import ProverbBanner from "@/components/ProverbBanner";
import DonateDialog from "@/components/DonateDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, ShieldCheck, Clock, Users, MapPin, MessageCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import educationImage from "@/assets/campaign-education.jpg";

const CampaignDetail = () => {
  const { id } = useParams();

  // Mock data - will be replaced with real data
  const campaign = {
    title: "Help Amina Complete Her Medical Degree",
    description: "A bright student from Kano needs support to finish her final year of medical school and serve her community.",
    story: `My name is Amina Hassan, and I'm in my final year of medical school at Bayero University Kano. I've worked incredibly hard to get to this point, maintaining a first-class average while balancing part-time work to support my education.

Unfortunately, my family has faced unexpected financial difficulties this year. My father's business was affected by the economic downturn, and we're struggling to pay my final year tuition fees of ₦500,000.

I'm just months away from becoming a doctor and serving my community in Kano, where healthcare professionals are desperately needed. I've already secured a placement at a rural clinic where I'll work after graduation.

Your support will help me complete my education and begin my journey of serving those who need medical care the most. Every contribution, no matter how small, brings me closer to achieving my dream of being a doctor.`,
    image: educationImage,
    goal: 500000,
    raised: 342000,
    donors: 156,
    verified: true,
    category: "Education",
    daysLeft: 12,
    location: "Kano, Nigeria",
    createdAt: "January 15, 2025",
    organizer: "Amina Hassan",
  };

  const progress = (campaign.raised / campaign.goal) * 100;
  const formattedGoal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(campaign.goal);
  const formattedRaised = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(campaign.raised);

  const recentDonations = [
    { name: "Ibrahim M.", amount: 10000, time: "2 hours ago", message: "May Allah bless your studies!" },
    { name: "Sarah O.", amount: 5000, time: "5 hours ago", message: "Keep pushing! You'll make a great doctor." },
    { name: "Anonymous", amount: 20000, time: "1 day ago", message: "Education is the key to our future." },
    { name: "David A.", amount: 15000, time: "1 day ago", message: "Proud to support future healthcare workers!" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProverbBanner />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full aspect-video object-cover"
              />
              {campaign.verified && (
                <Badge className="absolute top-4 right-4 bg-trust text-trust-foreground gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Campaign
                </Badge>
              )}
            </div>

            {/* Campaign Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{campaign.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {campaign.location}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {campaign.title}
              </h1>
              <p className="text-lg text-muted-foreground">{campaign.description}</p>
            </div>

            {/* Campaign Story */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Campaign Story</h2>
              <div className="prose max-w-none text-foreground">
                {campaign.story.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-foreground">{paragraph}</p>
                ))}
              </div>
            </Card>

            {/* Organizer */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Organizer</h2>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {campaign.organizer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{campaign.organizer}</p>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                  <p className="text-sm text-muted-foreground">Created on {campaign.createdAt}</p>
                </div>
              </div>
            </Card>

            {/* Recent Donations */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Recent Donations</h2>
              <div className="space-y-4">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Avatar>
                      <AvatarFallback className="bg-secondary">
                        {donation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{donation.name}</p>
                        <p className="font-bold text-primary">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(donation.amount)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{donation.time}</p>
                      {donation.message && (
                        <p className="text-sm text-foreground flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {donation.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 space-y-6">
              {/* Progress */}
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{formattedRaised}</p>
                  <p className="text-muted-foreground">raised of {formattedGoal} goal</p>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.donors}
                    </p>
                    <p className="text-muted-foreground">donors</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {campaign.daysLeft}
                    </p>
                    <p className="text-muted-foreground">days left</p>
                  </div>
                </div>
              </div>

              {/* Donate Button */}
              <DonateDialog 
                campaignId={id || ""} 
                campaignTitle={campaign.title} 
              />

              {/* Share Button */}
              <Button variant="outline" className="w-full h-12">
                <Share2 className="w-5 h-5 mr-2" />
                Share Campaign
              </Button>

              {/* Trust Info */}
              <div className="pt-4 border-t space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-trust flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Secure Donations</p>
                    <p className="text-muted-foreground">All transactions are encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-trust flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Verified Campaign</p>
                    <p className="text-muted-foreground">This campaign has been verified by our team</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
