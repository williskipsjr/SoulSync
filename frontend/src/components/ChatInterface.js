import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Plus, LogOut, User, AlertTriangle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const moodConfig = {
  anxious: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Anxious', icon: '😰' },
  depressed: { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Depressed', icon: '😔' },
  positive: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Positive', icon: '😊' },
  neutral: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Neutral', icon: '😐' },
  risk: { color: 'text-red-600', bg: 'bg-red-50', label: 'At Risk', icon: '⚠️' }
};

function ChatInterface({ token, user, onLogout }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalationAlert, setEscalationAlert] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      if (response.data.length > 0 && !currentConversation) {
        setCurrentConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post(`${API}/conversations`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations([response.data, ...conversations]);
      setCurrentConversation(response.data);
      setMessages([]);
      toast.success('New conversation started');
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation) return;

    setLoading(true);
    const userMessage = input;
    setInput('');

    try {
      const response = await axios.post(
        `${API}/conversations/${currentConversation.id}/messages`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add messages to UI
      setMessages([...messages, response.data.user_message, response.data.assistant_message]);

      // Show escalation alert if triggered
      if (response.data.escalation_triggered) {
        setEscalationAlert({
          conversationId: currentConversation.id,
          mood: response.data.mood,
          riskScore: response.data.risk_score
        });
      }

      // Update conversations list
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const giveEscalationConsent = async () => {
    if (!escalationAlert) return;

    try {
      await axios.post(
        `${API}/escalation/consent?conversation_id=${escalationAlert.conversationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Your emergency contact will be notified after moderator review.');
      setEscalationAlert(null);
    } catch (error) {
      toast.error('Failed to process consent');
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">CareCompanion</h2>
              <p className="text-xs text-gray-600">Your safe space</p>
            </div>
          </div>
          <Button 
            onClick={createNewConversation} 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            data-testid="new-conversation-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                data-testid={`conversation-${convo.id}`}
                onClick={() => setCurrentConversation(convo)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentConversation?.id === convo.id
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{convo.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(convo.last_message_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate('/profile')}
              data-testid="profile-btn"
            >
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
        {currentConversation ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12" data-testid="empty-chat">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                    <p className="text-gray-600">Share how you're feeling. I'm here to listen and support you.</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div key={msg.id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} slide-in`}>
                    <div className={`max-w-2xl ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-3xl rounded-br-sm' 
                        : 'bg-white border border-gray-200 rounded-3xl rounded-bl-sm shadow-sm'
                    } p-4`}
                    data-testid={`message-${msg.role}`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.mood && msg.role === 'user' && (
                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          moodConfig[msg.mood]?.bg || 'bg-gray-100'
                        } ${moodConfig[msg.mood]?.color || 'text-gray-700'}`}
                        data-testid={`mood-indicator-${msg.mood}`}
                        >
                          <span>{moodConfig[msg.mood]?.icon}</span>
                          <span>{moodConfig[msg.mood]?.label || msg.mood}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Escalation Alert */}
            {escalationAlert && (
              <div className="px-6 py-3 bg-white border-t border-b">
                <Alert className="border-red-200 bg-red-50" data-testid="escalation-alert">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <p className="font-semibold mb-2">I'm really concerned about you.</p>
                    <p className="mb-3">Can I contact {user.emergency_contact_name || 'your emergency contact'} to ask them to check on you?</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={giveEscalationConsent}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="escalation-consent-yes"
                      >
                        Yes, please contact them
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEscalationAlert(null)}
                        data-testid="escalation-consent-no"
                      >
                        Not right now
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Input */}
            <div className="p-6">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
                <div className="flex gap-3 bg-white rounded-full shadow-lg border border-gray-200 p-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share how you're feeling..."
                    className="flex-1 border-0 focus-visible:ring-0 px-4"
                    disabled={loading}
                    data-testid="message-input"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-6"
                    data-testid="send-message-btn"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" data-testid="no-conversation-selected">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Conversation Selected</h3>
              <p className="text-gray-500">Start a new conversation to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;