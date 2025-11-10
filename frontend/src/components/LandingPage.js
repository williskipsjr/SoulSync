import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Shield, MessageCircle, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LandingPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    consent_given: false,
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Disclaimer Banner */}
          <Alert className="mb-8 border-orange-200 bg-orange-50" data-testid="disclaimer-banner">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800 font-medium">
              CareCompanion is not a substitute for professional care. If you are in immediate danger, call local emergency services (911) or the National Suicide Prevention Lifeline at 988.
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Privacy-First Mental Health Support
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Safe Space for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600"> Mental Wellness</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                CareCompanion is your empathetic companion for mental health support. Get mood detection, personalized coping strategies, and opt-in emergency support — all with complete privacy.
              </p>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100">
                  <MessageCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Support</h3>
                    <p className="text-sm text-gray-600">Empathetic responses with mood detection</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100">
                  <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                    <p className="text-sm text-gray-600">Your data stays encrypted and secure</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100">
                  <Users className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Emergency Support</h3>
                    <p className="text-sm text-gray-600">Opt-in contact notification with consent</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-emerald-100">
                  <Heart className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Personalized Care</h3>
                    <p className="text-sm text-gray-600">Memory of your journey for better support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Auth Form */}
            <div className="slide-in">
              <Card className="border-emerald-200 shadow-2xl" data-testid="auth-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Get Started</CardTitle>
                  <CardDescription>Create an account or sign in to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
                      <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            data-testid="login-email-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            data-testid="login-password-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading} data-testid="login-submit-btn">
                          {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            data-testid="signup-name-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            data-testid="signup-email-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            data-testid="signup-password-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                        </div>

                        {/* Emergency Contact Opt-in */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="consent" className="text-sm font-medium">
                              Enable Emergency Contact (Optional)
                            </Label>
                            <Switch
                              id="consent"
                              data-testid="consent-switch"
                              checked={formData.consent_given}
                              onCheckedChange={(checked) => setFormData({ ...formData, consent_given: checked })}
                            />
                          </div>
                          <p className="text-xs text-gray-600">
                            If you opt in, we can contact a trusted person if we detect you may be in distress. This requires your explicit consent each time.
                          </p>

                          {formData.consent_given && (
                            <div className="space-y-3 mt-3">
                              <div>
                                <Label htmlFor="contact-name" className="text-sm">Emergency Contact Name</Label>
                                <Input
                                  id="contact-name"
                                  data-testid="emergency-contact-name-input"
                                  value={formData.emergency_contact_name}
                                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="contact-phone" className="text-sm">Emergency Contact Phone</Label>
                                <Input
                                  id="contact-phone"
                                  data-testid="emergency-contact-phone-input"
                                  value={formData.emergency_contact_phone}
                                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading} data-testid="signup-submit-btn">
                          {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2024 CareCompanion. Built with empathy for your mental wellness.</p>
          <p className="mt-2">Crisis Resources: National Suicide Prevention Lifeline (988) | Crisis Text Line (Text HOME to 741741)</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;