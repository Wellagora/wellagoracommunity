import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Users, TrendingUp, Globe, Eye, Calendar } from "lucide-react";

interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  avgMessagesPerConversation: number;
  todayConversations: number;
}

interface ConversationWithUser {
  id: string;
  language: string;
  started_at: string;
  message_count: number;
  last_message_at: string;
  user_id: string;
  user_name?: string;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface LanguageDistribution {
  language: string;
  count: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface TopicAnalysis {
  topic: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AIAnalyticsDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ConversationStats>({
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
    avgMessagesPerConversation: 0,
    todayConversations: 0
  });
  const [languageData, setLanguageData] = useState<LanguageDistribution[]>([]);
  const [recentConversations, setRecentConversations] = useState<ConversationWithUser[]>([]);
  const [topicData, setTopicData] = useState<TopicAnalysis[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch overall stats
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('id, message_count, language, user_id, created_at');

      if (convError) throw convError;

      const { data: messages, error: msgError } = await supabase
        .from('ai_messages')
        .select('id');

      if (msgError) throw msgError;

      // Calculate stats
      const uniqueUsers = new Set(conversations?.map(c => c.user_id)).size;
      const totalMessages = messages?.length || 0;
      const totalConversations = conversations?.length || 0;
      const avgMessages = totalConversations > 0 
        ? Math.round(totalMessages / totalConversations) 
        : 0;

      // Today's conversations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayConversations = conversations?.filter(c => 
        new Date(c.created_at) >= today
      ).length || 0;

      setStats({
        totalConversations,
        totalMessages,
        activeUsers: uniqueUsers,
        avgMessagesPerConversation: avgMessages,
        todayConversations
      });

      // Time series data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dateCounts: Record<string, number> = {};
      conversations?.forEach(conv => {
        const date = new Date(conv.created_at);
        if (date >= thirtyDaysAgo) {
          const dateStr = date.toLocaleDateString('hu-HU');
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
      });

      const timeSeriesArray = Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimeSeriesData(timeSeriesArray);

      // Language distribution
      const langCounts: Record<string, number> = {};
      conversations?.forEach(conv => {
        langCounts[conv.language] = (langCounts[conv.language] || 0) + 1;
      });
      
      const langData = Object.entries(langCounts).map(([language, count]) => ({
        language: language.toUpperCase(),
        count
      }));
      setLanguageData(langData);

      // Fetch recent conversations with user profiles
      const { data: recentConvs, error: recentError } = await supabase
        .from('ai_conversations')
        .select('id, language, started_at, message_count, last_message_at, user_id')
        .order('last_message_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Fetch user profiles for recent conversations
      if (recentConvs && recentConvs.length > 0) {
        const userIds = [...new Set(recentConvs.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]));
        
        const conversationsWithUsers = recentConvs.map(conv => ({
          ...conv,
          user_name: profileMap.get(conv.user_id) || 'Ismeretlen felhasználó'
        }));
        
        setRecentConversations(conversationsWithUsers);
      } else {
        setRecentConversations([]);
      }

      // Analyze topics from messages (simplified - look for keywords)
      const { data: allMessages, error: allMsgError } = await supabase
        .from('ai_messages')
        .select('content, role')
        .eq('role', 'user');

      if (!allMsgError && allMessages) {
        const topics: Record<string, number> = {
          'Carbon/CO2': 0,
          'Energy': 0,
          'Transport': 0,
          'Waste': 0,
          'General': 0
        };

        allMessages.forEach(msg => {
          const content = msg.content.toLowerCase();
          if (content.includes('carbon') || content.includes('co2')) topics['Carbon/CO2']++;
          else if (content.includes('energy') || content.includes('electric')) topics['Energy']++;
          else if (content.includes('transport') || content.includes('car') || content.includes('bike')) topics['Transport']++;
          else if (content.includes('waste') || content.includes('recycle')) topics['Waste']++;
          else topics['General']++;
        });

        const topicArray = Object.entries(topics)
          .map(([topic, count]) => ({ topic, count }))
          .filter(t => t.count > 0);
        setTopicData(topicArray);
      }

    } catch (error) {
      // Silent failure - analytics are not critical
    } finally {
      setLoading(false);
    }
  };

  const viewConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    setLoadingMessages(true);
    
    try {
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('id, role, content, timestamp')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setConversationMessages(messages || []);
    } catch (error) {
      // Silent failure
    } finally {
      setLoadingMessages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Összes beszélgetés</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mai beszélgetések</p>
                <p className="text-2xl font-bold">{stats.todayConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Összes üzenet</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-muted rounded-lg">
                <Globe className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Átlagos üzenet/beszélgetés</p>
                <p className="text-2xl font-bold">{stats.avgMessagesPerConversation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Idősor</TabsTrigger>
          <TabsTrigger value="topics">Témák</TabsTrigger>
          <TabsTrigger value="languages">Nyelvek</TabsTrigger>
          <TabsTrigger value="conversations">Beszélgetések</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beszélgetések az idő során (utolsó 30 nap)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#0088FE" name="Beszélgetések" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beszélgetés témák</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" name="Beszélgetések" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nyelvi eloszlás</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.language}: ${((entry.count / languageData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legutóbbi beszélgetések</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {recentConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{conv.user_name}</span>
                          <Badge variant="outline">{conv.language.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{conv.message_count} üzenet</span>
                          <span>Kezdve: {new Date(conv.started_at).toLocaleString('hu-HU')}</span>
                          <span>Utolsó: {new Date(conv.last_message_at).toLocaleString('hu-HU')}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewConversation(conv.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Megtekintés
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conversation Detail Dialog */}
      <Dialog open={selectedConversation !== null} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Beszélgetés részletei</DialogTitle>
          </DialogHeader>
          
          {loadingMessages ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Betöltés...</div>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {conversationMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('hu-HU')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAnalyticsDashboard;