import { ShieldCheck, Users, TrendingUp, Award } from "lucide-react";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Secure Transactions",
      color: "text-trust",
    },
    {
      icon: Users,
      value: "50K+",
      label: "Active Donors",
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      value: "₦50M+",
      label: "Funds Raised",
      color: "text-gold",
    },
    {
      icon: Award,
      value: "70%",
      label: "Success Rate",
      color: "text-orange",
    },
  ];

  return (
    <div className="bg-secondary/50 py-12 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {indicators.map((item, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="flex justify-center">
                <div className={`w-12 h-12 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
