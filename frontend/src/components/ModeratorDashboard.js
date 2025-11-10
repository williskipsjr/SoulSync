import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, Phone, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ModeratorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API}/moderator/queue`);
      setQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  };

  const handleApprove = async (escalationId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/moderator/escalation/${escalationId}/approve`);
      toast.success('SMS sent to emergency contact');
      await fetchQueue();
      setSelectedEscalation(null);
    } catch (error) {
      toast.error('Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (escalationId) => {
    setLoading(true);
    try {
      await axios.post(`${API}/moderator/escalation/${escalationId}/reject`);
      toast.success('Escalation rejected');
      await fetchQueue();
      setSelectedEscalation(null);
    } catch (error) {
      toast.error('Failed to reject escalation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="text-gray-600">Review and manage escalation requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="pending-count">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{queue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Escalation Queue</CardTitle>
              <CardDescription>Click on an item to review details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {queue.length === 0 ? (
                  <div className="text-center py-12" data-testid="empty-queue">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No pending escalations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.map((item) => (
                      <button
                        key={item.id}
                        data-testid={`escalation-item-${item.id}`}
                        onClick={() => setSelectedEscalation(item)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedEscalation?.id === item.id
                            ? 'border-purple-300 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{item.user_name}</span>
                          </div>
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            Risk: {(item.risk_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.message_content}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Escalation Details</CardTitle>
              <CardDescription>Review information before taking action</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEscalation ? (
                <div className="space-y-6" data-testid="escalation-details">
                  {/* User Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedEscalation.user_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedEscalation.user_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mood Detected:</span>
                        <Badge className="bg-red-100 text-red-700">{selectedEscalation.mood_detected}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risk Score:</span>
                        <Badge className="bg-orange-100 text-orange-700">
                          {(selectedEscalation.risk_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">User Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm text-gray-800">{selectedEscalation.message_content}</p>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedEscalation.emergency_contact_name || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedEscalation.emergency_contact_phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* User Consent */}
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      User has given consent for emergency contact notification
                    </AlertDescription>
                  </Alert>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => handleApprove(selectedEscalation.id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="approve-escalation-btn"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Send SMS
                    </Button>
                    <Button 
                      onClick={() => handleReject(selectedEscalation.id)}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      data-testid="reject-escalation-btn"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12" data-testid="no-escalation-selected">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select an escalation to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ModeratorDashboard;