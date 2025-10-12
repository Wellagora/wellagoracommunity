import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Zap,
  Target,
  Users,
  Award,
  Settings,
  Smartphone,
  Globe
} from "lucide-react";

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Book,
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' on the homepage, choose your account type (Individual, Business, Government, or NGO), and complete the registration form. You'll receive a confirmation email to verify your account."
        },
        {
          question: "What types of challenges are available?",
          answer: "We offer challenges in 5 main categories: Energy (reducing electricity usage), Transport (sustainable commuting), Food (sustainable eating), Waste (reducing and recycling), and Community (group activities and local initiatives)."
        },
        {
          question: "How do I join a challenge?",
          answer: "Browse challenges on the Dashboard or Challenges page, read the details, and click 'Join Challenge'. You can track your progress and see community leaderboards once you've joined."
        },
        {
          question: "Are the challenges suitable for beginners?",
          answer: "Absolutely! Challenges are categorized by difficulty: Beginner (simple daily actions), Intermediate (weekly commitments), and Advanced (lifestyle changes). Start with beginner challenges and work your way up."
        }
      ]
    },
    {
      id: "challenges-rewards",
      title: "Challenges & Rewards",
      icon: Target,
      faqs: [
        {
          question: "How does the points system work?",
          answer: "You earn points for completing challenge milestones, participating in community discussions, and achieving sustainability goals. Points contribute to your level and unlock new badges and features."
        },
        {
          question: "What are badges and how do I earn them?",
          answer: "Badges are achievements that recognize your progress in different areas. You can earn them by completing challenge streaks, reaching milestones, helping community members, or achieving specific sustainability goals."
        },
        {
          question: "Can I create my own challenges?",
          answer: "Yes! Once you reach Level 5, you can create custom challenges for your community. These can be reviewed and potentially featured platform-wide if they meet our quality guidelines."
        },
        {
          question: "How is environmental impact calculated?",
          answer: "We use peer-reviewed research and established calculation methods to estimate CO2 savings, energy reductions, and other environmental benefits. Sources include EPA guidelines and academic sustainability research."
        }
      ]
    },
    {
      id: "community",
      title: "Community Features", 
      icon: Users,
      faqs: [
        {
          question: "How do I connect with other users?",
          answer: "Visit the Community page to find local groups, join forums by interest, and participate in group challenges. You can also follow other users and share your achievements."
        },
        {
          question: "What are community groups?",
          answer: "Groups are collections of users focused on specific topics (local sustainability, workplace initiatives, etc.) or geographic areas. You can join existing groups or create your own."
        },
        {
          question: "How do I report inappropriate content?",
          answer: "Use the flag icon on any post or message to report inappropriate content. Our moderation team reviews all reports within 24 hours and takes appropriate action."
        },
        {
          question: "Can I organize local events through the platform?",
          answer: "Yes! Community leaders can create local events and meetups. These appear in your area's community feed and can include cleanup drives, workshops, or sustainability fairs."
        }
      ]
    },
    {
      id: "account-settings",
      title: "Account & Settings",
      icon: Settings,
      faqs: [
        {
          question: "How do I change my sustainability goals?",
          answer: "Go to Settings > Goals to update your carbon reduction targets, challenge frequency, and focus areas. Changes take effect immediately and update your personalized recommendations."
        },
        {
          question: "Can I switch between account types?",
          answer: "Yes, you can upgrade from Individual to Business/Organization accounts in Settings > Profile. Note that some features and data may need to be migrated when switching types."
        },
        {
          question: "How do I manage notifications?",
          answer: "Visit Settings > Notifications to customize email alerts, push notifications, and frequency preferences. You can turn off specific types while keeping others enabled."
        },
        {
          question: "Is my data secure and private?",
          answer: "Yes, we use industry-standard encryption and never sell your data. You can review our privacy policy and export or delete your data at any time from Settings > Privacy."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: Smartphone,
      faqs: [
        {
          question: "Which browsers are supported?",
          answer: "We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your preferred browser."
        },
        {
          question: "Is there a mobile app?",
          answer: "Currently we offer a web-based platform optimized for mobile browsers. Native iOS and Android apps are in development and will be available in 2024."
        },
        {
          question: "What should I do if I encounter a bug?",
          answer: "Please report bugs through the 'Contact Support' form below, including your browser type, device info, and steps to reproduce the issue. Screenshots are also helpful!"
        },
        {
          question: "How do I sync data across devices?",
          answer: "Your account data automatically syncs across all devices when you're logged in. Progress, challenges, and community activity are available wherever you access the platform."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@sustainhub.com",
      responseTime: "Within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available 9 AM - 6 PM PST",
      responseTime: "Within minutes"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team directly",
      contact: "+1 (555) 123-4567",
      responseTime: "Mon-Fri, 9 AM - 6 PM PST"
    }
  ];

  const quickLinks = [
    { title: "Platform Overview", url: "/about", icon: Globe },
    { title: "Getting Started Guide", url: "#getting-started", icon: Book },
    { title: "Challenge Categories", url: "#challenges-rewards", icon: Target },
    { title: "Community Guidelines", url: "#community", icon: Users },
    { title: "Account Settings", url: "/settings", icon: Settings },
    { title: "Privacy Policy", url: "#privacy", icon: AlertCircle }
  ];

  const filteredFaqs = searchQuery
    ? faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0)
    : faqCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <main className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-secondary text-secondary-foreground py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 opacity-80" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
              How Can We Help You?
            </h1>
            <p className="text-sm sm:text-base md:text-xl max-w-2xl mx-auto opacity-90 mb-6 sm:mb-8 px-4">
              Find answers, get support, and learn how to make the most of your sustainability journey
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 py-4 sm:py-6 text-sm sm:text-base lg:text-lg bg-background text-foreground"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 sm:py-12">
          {/* Quick Links */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Quick Links</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {quickLinks.map((link, index) => (
                <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <link.icon className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">{link.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Tabs defaultValue="faq" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
              <TabsTrigger value="guides" className="text-xs sm:text-sm">Guides</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
            </TabsList>

            {/* FAQ Section */}
            <TabsContent value="faq" className="space-y-6">
              {searchQuery && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Showing results for "{searchQuery}" • {filteredFaqs.reduce((total, cat) => total + cat.faqs.length, 0)} found
                  </p>
                </div>
              )}

              <div className="grid gap-6">
                {filteredFaqs.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <category.icon className="w-6 h-6 text-primary" />
                        <CardTitle>{category.title}</CardTitle>
                        <Badge variant="secondary">{category.faqs.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Guides Section */}
            <TabsContent value="guides" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <Book className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>Getting Started Guide</CardTitle>
                    <CardDescription>Complete walkthrough for new users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Setting up your profile and goals
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Joining your first challenge
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Understanding the points system
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Connecting with the community
                      </div>
                    </div>
                    <Button className="mt-4 w-full">View Complete Guide</Button>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary">
                  <CardHeader>
                    <Target className="w-8 h-8 text-secondary mb-2" />
                    <CardTitle>Challenge Mastery</CardTitle>
                    <CardDescription>Advanced tips for sustainability challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Choosing the right difficulty level
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Building sustainable habits
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Tracking and measuring impact
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Creating custom challenges
                      </div>
                    </div>
                    <Button variant="secondary" className="mt-4 w-full">Learn More</Button>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent">
                  <CardHeader>
                    <Users className="w-8 h-8 text-accent mb-2" />
                    <CardTitle>Community Building</CardTitle>
                    <CardDescription>Growing and leading sustainable communities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Starting local sustainability groups
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Organizing community events
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Engaging and motivating members
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Measuring group impact
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 w-full">Explore Guide</Button>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-muted">
                  <CardHeader>
                    <Award className="w-8 h-8 text-muted-foreground mb-2" />
                    <CardTitle>Business Integration</CardTitle>
                    <CardDescription>Implementing sustainability in organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Employee engagement strategies
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        Corporate challenge programs
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-success" />
                        ROI measurement and reporting
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Integration with existing systems
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 w-full">Download Guide</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Section */}
            <TabsContent value="contact" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you succeed on your sustainability journey.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <method.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-2">{method.contact}</p>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {method.responseTime}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="What's this about?" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="w-full p-3 border rounded-md bg-background resize-none"
                      rows={5}
                      placeholder="Please describe your question or issue in detail..."
                    />
                  </div>
                  
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;