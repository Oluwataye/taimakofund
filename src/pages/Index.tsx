import Navigation from "@/components/Navigation";
import ProverbBanner from "@/components/ProverbBanner";
import TrustIndicators from "@/components/TrustIndicators";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Heart, Search, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-community.jpg";
import educationImage from "@/assets/campaign-education.jpg";
import healthcareImage from "@/assets/campaign-healthcare.jpg";
import businessImage from "@/assets/campaign-business.jpg";

const Index = () => {
  const featuredCampaigns = [
    {
      id: "1",
      title: "Help Amina Complete Her Medical Degree",
      description: "A bright student from Kano needs support to finish her final year of medical school and serve her community.",
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
      title: "Medical Equipment for Rural Clinic in Enugu",
      description: "Our community clinic serves 5,000 people but lacks essential medical equipment. Help us save lives.",
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
      description: "Single mother of 4 needs capital to expand her successful local food business in Lagos.",
      image: businessImage,
      goal: 300000,
      raised: 178000,
      donors: 89,
      verified: false,
      category: "Business",
      daysLeft: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProverbBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-gold/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
                  Ubuntu Philosophy: I am because we are
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Together, We Rise
                <span className="block text-primary">Taimako for All</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Secure crowdfunding built for Nigeria. Support dreams, change lives, and build community one contribution at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary-light text-lg h-12">
                  <Heart className="w-5 h-5 mr-2" />
                  Start a Campaign
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-12" asChild>
                  <Link to="/discover">
                    <Search className="w-5 h-5 mr-2" />
                    Explore Campaigns
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-trust" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" />
                  <span>Fast payouts</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-strong">
                <img
                  src={heroImage}
                  alt="Community helping each other"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gold text-gold-foreground p-6 rounded-2xl shadow-lg animate-pulse-soft">
                <p className="text-3xl font-bold">₦50M+</p>
                <p className="text-sm">Raised this month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustIndicators />

      {/* Featured Campaigns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Campaigns
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support verified campaigns making real impact in Nigerian communities
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/discover">View All Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How TaimakoFund Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and built for our community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">1. Create Campaign</h3>
              <p className="text-muted-foreground">
                Share your story, set your goal, and launch your campaign in minutes
              </p>
            </div>
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">2. Share & Rally</h3>
              <p className="text-muted-foreground">
                Spread the word through WhatsApp, social media, and your community
              </p>
            </div>
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 rounded-full bg-trust/10 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-trust" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">3. Receive Funds</h3>
              <p className="text-muted-foreground">
                Get your money securely transferred to your bank account
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-bold">TaimakoFund</span>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Empowering Nigerian communities through secure, culturally-sensitive crowdfunding.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><Link to="/discover" className="hover:text-primary-foreground">Discover</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary-foreground">How It Works</Link></li>
                <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-foreground">NDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; 2025 TaimakoFund. Built with ❤️ for Nigeria.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
