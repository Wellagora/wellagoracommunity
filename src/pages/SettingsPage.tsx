import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Target, Palette, Globe, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    username: "alexj_green",
    bio: "Passionate about sustainable living and making a positive environmental impact.",
    location: "San Francisco, CA",
    role: "citizen" as const
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    timezone: "America/Los_Angeles",
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    challengeReminders: true,
    communityUpdates: false,
    achievementAlerts: true
  });

  const [goals, setGoals] = useState({
    carbonReduction: 50,
    challengesPerMonth: 4,
    communityParticipation: "active",
    focusAreas: ["energy", "transport", "food"]
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  const handleExportData = () => {
    toast.info("Preparing your data export...");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires confirmation via email.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 xl:py-12 mt-14 sm:mt-16">
        <div className="max-w-4xl xl:max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8 xl:mb-10">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('settings.title')}
            </h1>
            <p className="text-sm sm:text-base xl:text-lg text-muted-foreground mt-2">
              {t('settings.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('settings.profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('settings.notifications')}</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('settings.goals')}</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('settings.preferences')}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('settings.privacy')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and public profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" className="mb-2">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio"
                      className="w-full p-3 border rounded-md bg-background resize-none"
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about your sustainability journey..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select value={profile.role} onValueChange={(value: any) => setProfile({...profile, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => handleSave("Profile")} className="w-full">
                    Save Profile Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you'd like to receive updates and reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch 
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser and mobile notifications</p>
                      </div>
                      <Switch 
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => setPreferences({...preferences, pushNotifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
                      </div>
                      <Switch 
                        checked={preferences.weeklyDigest}
                        onCheckedChange={(checked) => setPreferences({...preferences, weeklyDigest: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Challenge Reminders</Label>
                        <p className="text-sm text-muted-foreground">Gentle reminders about active challenges</p>
                      </div>
                      <Switch 
                        checked={preferences.challengeReminders}
                        onCheckedChange={(checked) => setPreferences({...preferences, challengeReminders: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Community Updates</Label>
                        <p className="text-sm text-muted-foreground">New forum posts and community events</p>
                      </div>
                      <Switch 
                        checked={preferences.communityUpdates}
                        onCheckedChange={(checked) => setPreferences({...preferences, communityUpdates: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Achievement Alerts</Label>
                        <p className="text-sm text-muted-foreground">Celebrate your sustainability milestones</p>
                      </div>
                      <Switch 
                        checked={preferences.achievementAlerts}
                        onCheckedChange={(checked) => setPreferences({...preferences, achievementAlerts: checked})}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("Notifications")} className="w-full">
                    Save Notification Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Goals</CardTitle>
                  <CardDescription>
                    Set your personal targets for environmental impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="carbon">Carbon Reduction Goal (% per year)</Label>
                      <Input 
                        id="carbon"
                        type="number"
                        value={goals.carbonReduction}
                        onChange={(e) => setGoals({...goals, carbonReduction: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="challenges">Challenges Per Month</Label>
                      <Input 
                        id="challenges"
                        type="number"
                        value={goals.challengesPerMonth}
                        onChange={(e) => setGoals({...goals, challengesPerMonth: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Community Participation Level</Label>
                      <Select value={goals.communityParticipation} onValueChange={(value) => setGoals({...goals, communityParticipation: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="observer">Observer</SelectItem>
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="active">Active Member</SelectItem>
                          <SelectItem value="leader">Community Leader</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Focus Areas</Label>
                      <div className="flex flex-wrap gap-2">
                        {["energy", "transport", "food", "waste", "community"].map((area) => (
                          <Badge 
                            key={area}
                            variant={goals.focusAreas.includes(area) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => {
                              const newAreas = goals.focusAreas.includes(area)
                                ? goals.focusAreas.filter(a => a !== area)
                                : [...goals.focusAreas, area];
                              setGoals({...goals, focusAreas: newAreas});
                            }}
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("Goals")} className="w-full">
                    Save Goals
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Timezone</Label>
                      <Select value={preferences.timezone} onValueChange={(value) => setPreferences({...preferences, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                          <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("Preferences")} className="w-full">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Data</CardTitle>
                  <CardDescription>
                    Manage your data and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" onClick={handleExportData} className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount} 
                        className="w-full justify-start"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;