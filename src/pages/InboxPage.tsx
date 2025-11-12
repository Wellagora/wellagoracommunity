import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, MailOpen, Inbox, Send, User, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import Navigation from '@/components/Navigation';

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  message: string;
  message_type: 'general' | 'partner_contact';
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  read_at: string | null;
}

const InboxPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadMessages();
  }, [user, navigate]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni az üzeneteket',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast({
        title: 'Hiányzó adatok',
        description: 'Kérlek írj egy üzenetet',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSendingReply(true);

      // Send general contact email as reply
      const { error } = await supabase.functions.invoke('send-general-contact', {
        body: {
          senderName: user?.email || 'Felhasználó',
          senderEmail: user?.email || '',
          subject: replySubject || `Re: ${selectedMessage.subject || 'Üzenet'}`,
          message: `Válasz a következő üzenetre:\n\n"${selectedMessage.message}"\n\n---\n\n${replyText}`
        }
      });

      if (error) throw error;

      toast({
        title: 'Válasz elküldve',
        description: 'Az üzeneted sikeresen elküldtük'
      });

      setReplyText('');
      setReplySubject('');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Hiba',
        description: error.message || 'Nem sikerült elküldeni az üzenetet',
        variant: 'destructive'
      });
    } finally {
      setSendingReply(false);
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Üzenetek betöltése...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a Dashboardra
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Inbox className="w-8 h-8" />
                Bejövő üzenetek
              </h1>
              <p className="text-muted-foreground mt-2">
                {unreadCount > 0 ? `${unreadCount} olvasatlan üzenet` : 'Nincs olvasatlan üzenet'}
              </p>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nincs üzeneted</h3>
              <p className="text-muted-foreground">
                Az ide érkező üzenetek itt fognak megjelenni
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-3">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                  } ${message.status === 'unread' ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {message.status === 'unread' ? (
                            <Badge variant="default">
                              <Mail className="w-3 h-3 mr-1" />
                              Új
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <MailOpen className="w-3 h-3 mr-1" />
                              Olvasott
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base truncate">
                          <User className="w-4 h-4 inline mr-1" />
                          {message.sender_name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {message.sender_email}
                        </CardDescription>
                        {message.subject && (
                          <p className="text-sm font-medium mt-1 truncate">{message.subject}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(message.created_at), 'MMM dd', { locale: hu })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {message.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Üzenet részletei</CardTitle>
                    <CardDescription>
                      {format(new Date(selectedMessage.created_at), 'yyyy. MMMM dd. HH:mm', { locale: hu })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Feladó</label>
                      <p className="text-sm mt-1">{selectedMessage.sender_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.sender_email}</p>
                    </div>

                    {selectedMessage.subject && (
                      <div>
                        <label className="text-sm font-medium">Tárgy</label>
                        <p className="text-sm mt-1">{selectedMessage.subject}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium">Üzenet</label>
                      <p className="text-sm whitespace-pre-wrap mt-2 p-3 bg-muted rounded-md">
                        {selectedMessage.message}
                      </p>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Válasz küldése
                      </h4>
                      <div className="space-y-2">
                        <Input
                          placeholder="Tárgy"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Írd meg a válaszodat..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={sendReply} 
                        disabled={sendingReply || !replyText.trim()}
                        className="w-full"
                      >
                        {sendingReply ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Küldés...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Válasz küldése
                          </>
                        )}
                      </Button>
                    </div>

                    {selectedMessage.read_at && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Olvasva: {format(new Date(selectedMessage.read_at), 'yyyy. MMMM dd. HH:mm', { locale: hu })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Válassz egy üzenetet a részletek megtekintéséhez
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
