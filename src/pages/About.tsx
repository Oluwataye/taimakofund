import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Target, Globe, Zap } from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Campaigns Funded', value: '500+' },
    { label: 'Total Raised', value: '₦50M+' },
    { label: 'Active Donors', value: '10,000+' },
    { label: 'States Reached', value: '36' },
  ];

  const values = [
    { icon: Heart, title: 'Compassion', description: 'We believe in the power of community support and collective giving.' },
    { icon: Shield, title: 'Transparency', description: 'Every naira is tracked and accounted for with full transparency.' },
    { icon: Target, title: 'Impact', description: 'We focus on measurable outcomes that change lives.' },
    { icon: Globe, title: 'Accessibility', description: 'Making fundraising accessible to everyone across Nigeria.' },
  ];

  const team = [
    { name: 'Amina Ibrahim', role: 'Founder & CEO', bio: 'Passionate about social impact and community development.' },
    { name: 'Emeka Okonkwo', role: 'Head of Operations', bio: 'Expert in logistics and campaign management.' },
    { name: 'Fatima Yusuf', role: 'Community Manager', bio: 'Building bridges between donors and campaign creators.' },
    { name: 'Chidi Nwachukwu', role: 'Technical Lead', bio: 'Ensuring a seamless and secure platform experience.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Communities Through <span className="text-primary">Collective Giving</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            TaimakoFund connects those in need with generous hearts across Nigeria, 
            making it easy to create, share, and fund campaigns that matter.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To democratize fundraising in Nigeria by providing a trusted, transparent, and 
              accessible platform where individuals and organizations can raise funds for causes 
              that improve lives and strengthen communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-muted-foreground mb-4">
                TaimakoFund was born from a simple observation: Nigerians are incredibly generous, 
                but traditional fundraising methods often fail to connect those who want to help 
                with those who need it most.
              </p>
              <p className="text-muted-foreground mb-4">
                Founded in 2024, we set out to build a platform that combines the communal spirit 
                of "Taimako" (help in Hausa) with modern technology. Our goal is to make every 
                Nigerian's ability to give—and receive—support as easy as possible.
              </p>
              <p className="text-muted-foreground">
                Today, we're proud to have helped thousands of campaigns reach their goals, 
                from medical emergencies to educational scholarships, small business support 
                to community development projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Whether you want to start a campaign or support one, TaimakoFund makes it simple 
            to be part of something bigger than yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/public/discover" className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors">
              Explore Campaigns
            </a>
            <a href="/user/create-campaign" className="inline-flex items-center justify-center px-6 py-3 border border-primary-foreground/20 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors">
              Start a Campaign
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
