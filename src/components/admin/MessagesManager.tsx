import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MailOpen, Archive, MessageSquare, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  recipient_user_id: string | null;
  subject: string | null;
  message: string;
  message_type: 'general' | 'partner_contact';
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  read_at: string | null;
  admin_notes: string | null;
}

const MessagesManager = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
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
      toast({
        title: 'Üzenet olvasottnak jelölve',
      });
    } catch (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült frissíteni az üzenetet',
        variant: 'destructive'
      });
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'archived' })
        .eq('id', messageId);

      if (error) throw error;
      
      loadMessages();
      setSelectedMessage(null);
      toast({
        title: 'Üzenet archiválva',
      });
    } catch (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült archiválni az üzenetet',
        variant: 'destructive'
      });
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedMessage) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ admin_notes: adminNotes })
        .eq('id', selectedMessage.id);

      if (error) throw error;
      
      toast({
        title: 'Jegyzetek mentve',
      });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült menteni a jegyzeteket',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="default"><Mail className="w-3 h-3 mr-1" />Olvasatlan</Badge>;
      case 'read':
        return <Badge variant="secondary"><MailOpen className="w-3 h-3 mr-1" />Olvasott</Badge>;
      case 'archived':
        return <Badge variant="outline"><Archive className="w-3 h-3 mr-1" />Archivált</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'general':
        return <Badge variant="outline">Általános</Badge>;
      case 'partner_contact':
        return <Badge variant="outline">Partner kapcsolat</Badge>;
      default:
        return null;
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Üzenetek betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Üzenetek</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} olvasatlan üzenet` : 'Nincs olvasatlan üzenet'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Összes
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            Olvasatlan
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => setFilter('read')}
            size="sm"
          >
            Olvasott
          </Button>
          <Button
            variant={filter === 'archived' ? 'default' : 'outline'}
            onClick={() => setFilter('archived')}
            size="sm"
          >
            Archivált
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-3">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nincsenek üzenetek</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                } ${message.status === 'unread' ? 'bg-primary/5' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  setAdminNotes(message.admin_notes || '');
                  if (message.status === 'unread') {
                    markAsRead(message.id);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(message.status)}
                        {getTypeBadge(message.message_type)}
                      </div>
                      <CardTitle className="text-base truncate">
                        <User className="w-4 h-4 inline mr-1" />
                        {message.sender_name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {message.sender_email}
                      </CardDescription>
                      {message.subject && (
                        <p className="text-sm font-medium mt-1">{message.subject}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(message.created_at), 'MMM dd, HH:mm', { locale: hu })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {message.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:sticky lg:top-6">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Üzenet részletei</CardTitle>
                    <CardDescription>
                      {format(new Date(selectedMessage.created_at), 'yyyy. MMMM dd. HH:mm', { locale: hu })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedMessage.status !== 'archived' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveMessage(selectedMessage.id)}
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Archiválás
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Feladó</label>
                  <p className="text-sm">{selectedMessage.sender_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.sender_email}</p>
                </div>

                {selectedMessage.subject && (
                  <div>
                    <label className="text-sm font-medium">Tárgy</label>
                    <p className="text-sm">{selectedMessage.subject}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Típus</label>
                  <div className="mt-1">{getTypeBadge(selectedMessage.message_type)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Státusz</label>
                  <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Üzenet</label>
                  <p className="text-sm whitespace-pre-wrap mt-2 p-3 bg-muted rounded-md">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin jegyzetek</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adj hozzá jegyzeteket ehhez az üzenethez..."
                    rows={4}
                  />
                  <Button onClick={saveAdminNotes} size="sm">
                    Jegyzetek mentése
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
    </div>
  );
};

export default MessagesManager;
