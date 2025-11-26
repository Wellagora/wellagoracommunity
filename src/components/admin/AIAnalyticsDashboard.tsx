import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Cell
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Users, TrendingUp, Globe } from "lucide-react";

interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  avgMessagesPerConversation: number;
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
    avgMessagesPerConversation: 0
  });
  const [languageData, setLanguageData] = useState<LanguageDistribution[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [topicData, setTopicData] = useState<TopicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch overall stats
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('id, message_count, language, user_id');

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

      setStats({
        totalConversations,
        totalMessages,
        activeUsers: uniqueUsers,
        avgMessagesPerConversation: avgMessages
      });

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

      // Fetch recent conversations with messages
      const { data: recentConvs, error: recentError } = await supabase
        .from('ai_conversations')
        .select('id, language, started_at, message_count, last_message_at')
        .order('last_message_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      setRecentConversations(recentConvs || []);

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
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
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
                <p className="text-sm text-muted-foreground">Avg Messages/Chat</p>
                <p className="text-2xl font-bold">{stats.avgMessagesPerConversation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="conversations">Recent Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
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
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{conv.language.toUpperCase()}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(conv.last_message_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {conv.message_count} messages
                        </p>
                      </div>
                      <Badge variant="secondary">{conv.message_count} msgs</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;