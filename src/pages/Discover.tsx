import Navigation from "@/components/Navigation";
import ProverbBanner from "@/components/ProverbBanner";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import educationImage from "@/assets/campaign-education.jpg";
import healthcareImage from "@/assets/campaign-healthcare.jpg";
import businessImage from "@/assets/campaign-business.jpg";

const Discover = () => {
  const campaigns = [
    {
      id: "1",
      title: "Help Amina Complete Her Medical Degree",
      description: "A bright student from Kano needs support to finish her final year of medical school.",
      image: educationImage,
      goal: 500000,
      raised: 342000,
      donors: 156,
      verified: true,
      category: "Education",
      daysLeft: 12,
    },
    {
      id: "2",
      title: "Medical Equipment for Rural Clinic",
      description: "Community clinic in Enugu needs essential medical equipment.",
      image: healthcareImage,
      goal: 1200000,
      raised: 890000,
      donors: 234,
      verified: true,
      category: "Healthcare",
      daysLeft: 8,
    },
    {
      id: "3",
      title: "Empower Mama Ngozi's Food Business",
      description: "Single mother needs capital to expand her local food business.",
      image: businessImage,
      goal: 300000,
      raised: 178000,
      donors: 89,
      verified: false,
      category: "Business",
      daysLeft: 15,
    },
    {
      id: "4",
      title: "School Library for Abuja Community",
      description: "Building a library to give 500+ children access to books.",
      image: educationImage,
      goal: 800000,
      raised: 245000,
      donors: 67,
      verified: true,
      category: "Education",
      daysLeft: 20,
    },
    {
      id: "5",
      title: "Clean Water Project for Kaduna Village",
      description: "Installing water pumps for a community of 2,000 people.",
      image: healthcareImage,
      goal: 1500000,
      raised: 623000,
      donors: 178,
      verified: true,
      category: "Community",
      daysLeft: 18,
    },
    {
      id: "6",
      title: "Youth Tech Training Center",
      description: "Equipping young Nigerians with coding and digital skills.",
      image: businessImage,
      goal: 950000,
      raised: 412000,
      donors: 134,
      verified: false,
      category: "Education",
      daysLeft: 25,
    },
  ];

  const categories = ["All", "Education", "Healthcare", "Business", "Community", "Emergency"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProverbBanner />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Discover Campaigns
          </h1>
          <p className="text-lg text-muted-foreground">
            Support meaningful causes and make a real impact in Nigerian communities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={category === "All" ? "bg-primary" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Campaign Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Campaigns
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Discover;
