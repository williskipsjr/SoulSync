import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Trash2, ArrowLeft, AlertCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfileSettings({ token, user, onLogout, onUserUpdate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    consent_given: user.consent_given || false,
    emergency_contact_name: user.emergency_contact_name || '',
    emergency_contact_phone: user.emergency_contact_phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateEmergencyContact = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API}/profile/emergency-contact`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Emergency contact updated successfully');
      
      // Fetch updated user data
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserUpdate(response.data);
    } catch (error) {
      toast.error('Failed to update emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllConversations = async () => {
    if (!window.confirm('Are you sure you want to delete all your conversations? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API}/profile/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('All conversations deleted');
    } catch (error) {
      toast.error('Failed to delete conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/chat')}
            className="mb-4"
            data-testid="back-to-chat-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account and privacy settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* User Info */}
        <Card data-testid="user-info-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Name</Label>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm text-gray-600">Member Since</Label>
              <p className="font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card data-testid="emergency-contact-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emergency Contact Settings
            </CardTitle>
            <CardDescription>
              Configure who we can contact if we detect you may be in distress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Heart className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Your emergency contact will only be notified with your explicit consent and after moderator review. You maintain full control.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="consent-toggle" className="text-base font-medium">
                  Enable Emergency Contact Feature
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow us to contact someone you trust if you're in crisis
                </p>
              </div>
              <Switch
                id="consent-toggle"
                data-testid="emergency-consent-switch"
                checked={formData.consent_given}
                onCheckedChange={(checked) => setFormData({ ...formData, consent_given: checked })}
              />
            </div>

            {formData.consent_given && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="contact-name">Emergency Contact Name</Label>
                  <Input
                    id="contact-name"
                    data-testid="emergency-name-input"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Emergency Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    data-testid="emergency-phone-input"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleUpdateEmergencyContact}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              data-testid="save-emergency-contact-btn"
            >
              {loading ? 'Saving...' : 'Save Emergency Contact'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card data-testid="data-management-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your conversation history and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                Deleting your conversations is permanent and cannot be undone. Your mood history will also be removed.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleDeleteAllConversations}
              disabled={loading}
              variant="destructive"
              className="w-full"
              data-testid="delete-conversations-btn"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Conversations
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold mb-2">Important Reminder</p>
            <p>CareCompanion is not a substitute for professional mental health care. If you are in immediate danger, please call emergency services (911) or contact the National Suicide Prevention Lifeline at 988.</p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default ProfileSettings;