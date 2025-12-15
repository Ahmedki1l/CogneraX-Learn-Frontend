import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Settings, Palette, Globe, Plug, ToggleLeft, ToggleRight, Save, RefreshCw, Upload, Download, Eye, Edit, Trash2, Plus, Link, Shield, Zap, Bell, Mail, DollarSign, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

const mockIntegrations = [
  { id: 1, name: 'Google Analytics', description: 'Web analytics and reporting', status: 'connected', category: 'Analytics', lastSync: '2024-01-15 14:30' },
  { id: 2, name: 'Stripe', description: 'Payment processing', status: 'connected', category: 'Payment', lastSync: '2024-01-15 14:25' },
  { id: 3, name: 'SendGrid', description: 'Email delivery service', status: 'connected', category: 'Communication', lastSync: '2024-01-15 14:20' },
  { id: 4, name: 'Zoom', description: 'Video conferencing', status: 'disconnected', category: 'Communication', lastSync: 'Never' },
  { id: 5, name: 'Slack', description: 'Team communication', status: 'pending', category: 'Communication', lastSync: 'Never' }
];

const featureFlags = [
  { id: 'ai_content_analysis', name: 'AI Content Analysis', description: 'Enable AI-powered content analysis and recommendations', enabled: true, category: 'AI Features' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Access to detailed analytics and reporting', enabled: true, category: 'Analytics' },
  { id: 'live_streaming', name: 'Live Streaming', description: 'Enable live streaming capabilities for courses', enabled: false, category: 'Media' },
  { id: 'gamification', name: 'Gamification', description: 'Enable badges, points, and leaderboards', enabled: true, category: 'Engagement' },
  { id: 'mobile_app', name: 'Mobile App Access', description: 'Allow access through mobile applications', enabled: true, category: 'Platform' },
  { id: 'api_access', name: 'API Access', description: 'Enable third-party API integrations', enabled: false, category: 'Development' },
  { id: 'white_label', name: 'White Label Mode', description: 'Hide CogneraX branding for custom branding', enabled: false, category: 'Branding' },
  { id: 'sso_integration', name: 'SSO Integration', description: 'Single sign-on capabilities', enabled: true, category: 'Security' }
];

const brandingOptions = {
  primaryColor: '#2DD4BF',
  secondaryColor: '#8B5CF6',
  logo: null,
  favicon: null,
  organizationName: 'CogneraX Learn',
  tagline: 'AI-Powered Learning Platform',
  customCSS: '',
  customFooter: '',
  hideDefaultBranding: false
};

export function PlatformConfiguration() {
  const { t, isRTL } = useLanguage();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [brandingSettings, setBrandingSettings] = useState<any>(brandingOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIntegration, setActiveIntegration] = useState<any>(null);
  const [editingBranding, setEditingBranding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch configuration data
  useEffect(() => {
    const fetchConfigurationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [integrationsResponse, flagsResponse, brandingResponse] = await Promise.allSettled([
          api.system.getIntegrations(),
          api.system.getFeatureFlags(),
          api.system.getBrandingSettings()
        ]);

        // Process integrations
        if (integrationsResponse.status === 'fulfilled' && integrationsResponse.value && Array.isArray(integrationsResponse.value)) {
          setIntegrations(integrationsResponse.value);
        } else {
          setIntegrations(mockIntegrations);
        }

        // Process feature flags
        if (flagsResponse.status === 'fulfilled' && flagsResponse.value && Array.isArray(flagsResponse.value)) {
          setFeatureFlags(flagsResponse.value);
        } else {
          setFeatureFlags(featureFlags);
        }

        // Process branding settings
        if (brandingResponse.status === 'fulfilled' && brandingResponse.value) {
          setBrandingSettings(brandingResponse.value);
        } else {
          setBrandingSettings(brandingOptions);
        }

      } catch (error) {
        console.error('Failed to fetch configuration data:', error);
        setError('Failed to load configuration data. Using cached data.');
        // Fallback to mock data
        setIntegrations(mockIntegrations);
        setFeatureFlags(featureFlags);
        setBrandingSettings(brandingOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigurationData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Analytics': return 'bg-blue-100 text-blue-800';
      case 'Payment': return 'bg-green-100 text-green-800';
      case 'Communication': return 'bg-purple-100 text-purple-800';
      case 'AI Features': return 'bg-teal-100 text-teal-800';
      case 'Media': return 'bg-orange-100 text-orange-800';
      case 'Engagement': return 'bg-pink-100 text-pink-800';
      case 'Platform': return 'bg-indigo-100 text-indigo-800';
      case 'Development': return 'bg-gray-100 text-gray-800';
      case 'Branding': return 'bg-red-100 text-red-800';
      case 'Security': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFeatureToggle = async (featureId: string) => {
    try {
      const feature = featureFlags.find((f: any) => f.id === featureId);
      if (!feature) return;

      const response = await api.system.updateFeatureFlag(featureId, !feature.enabled);
      if (response) {
        toast.success('Feature flag updated successfully');
        // Update local state
        setFeatureFlags((prev: any[]) => 
          prev.map((f: any) => f.id === featureId ? { ...f, enabled: !f.enabled } : f)
        );
      } else {
        toast.error('Failed to update feature flag');
      }
    } catch (error: any) {
      console.error('Feature toggle failed:', error);
      toast.error('Failed to update feature flag');
    }
  };

  const handleIntegrationUpdate = async (integrationId: string, config: any) => {
    try {
      const response = await api.system.updateIntegration(integrationId, config);
      if (response) {
        toast.success('Integration updated successfully');
        // Update local state
        setIntegrations((prev: any[]) => 
          prev.map((i: any) => i.id === integrationId ? { ...i, ...config } : i)
        );
      } else {
        toast.error('Failed to update integration');
      }
    } catch (error: any) {
      console.error('Integration update failed:', error);
      toast.error('Failed to update integration');
    }
  };

  const handleBrandingUpdate = async () => {
    try {
      setSaving(true);
      const response = await api.system.updateBrandingSettings(brandingSettings);
      if (response) {
        toast.success('Branding settings updated successfully');
        setEditingBranding(false);
      } else {
        toast.error('Failed to update branding settings');
      }
    } catch (error) {
      console.error('Branding update failed:', error);
      toast.error('Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('admin.platformConfiguration', 'Platform Configuration')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.platformConfigDesc', 'Customize platform appearance, features, and integrations')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('platformConfig.exportConfig')}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {t('platformConfig.importConfig')}
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            {t('platformConfig.saveAllChanges')}
          </Button>
        </div>
      </div>

      {/* Configuration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('platformConfig.activeFeatures')}</p>
                <p className="text-2xl font-bold">{featureFlags.filter(f => f.enabled).length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('platformConfig.integrations')}</p>
                <p className="text-2xl font-bold">{(integrations.length > 0 ? integrations : mockIntegrations).filter(i => i.status === 'connected').length}</p>
              </div>
              <Plug className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('platformConfig.whiteLabel')}</p>
                <p className="text-2xl font-bold">{brandingSettings.hideDefaultBranding ? 'ON' : 'OFF'}</p>
              </div>
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('platformConfig.languages')}</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">{t('platformConfig.featureFlags')}</TabsTrigger>
          <TabsTrigger value="branding">{t('platformConfig.whiteLabeling')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('platformConfig.integrationsTab')}</TabsTrigger>
          <TabsTrigger value="general">{t('platformConfig.generalSettings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Feature Management
              </CardTitle>
              <CardDescription>
                Enable or disable platform features and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(
                  featureFlags.reduce((groups: any, feature: any) => {
                    const category = feature.category;
                    if (!groups[category]) groups[category] = [];
                    groups[category].push(feature);
                    return groups;
                  }, {})
                ).map((categoryFeatures: any, categoryIndex: number) => (
                  <div key={categoryIndex} className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <Badge className={getCategoryColor(categoryFeatures[0].category)}>
                        {categoryFeatures[0].category}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryFeatures.map((feature: any) => (
                        <div key={feature.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.enabled ? (
                                  <Badge className="bg-green-100 text-green-800" variant="outline">
                                    Enabled
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Disabled</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                            </div>
                            <Switch 
                              checked={feature.enabled}
                              onCheckedChange={() => handleFeatureToggle(feature.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Identity
                </CardTitle>
                <CardDescription>
                  Customize your platform's visual identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input 
                    value={brandingSettings.organizationName}
                    onChange={(e) => setBrandingSettings({...brandingSettings, organizationName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tagline</label>
                  <Input 
                    value={brandingSettings.tagline}
                    onChange={(e) => setBrandingSettings({...brandingSettings, tagline: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logo Upload</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Upload your logo (PNG, JPG, SVG)</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Favicon</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Upload favicon (ICO, PNG 32x32)</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hide CogneraX Branding</span>
                  <Switch 
                    checked={brandingSettings.hideDefaultBranding}
                    onCheckedChange={(checked: boolean) => setBrandingSettings({...brandingSettings, hideDefaultBranding: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Customization</CardTitle>
                <CardDescription>
                  Custom CSS and footer content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom CSS</label>
                  <Textarea 
                    placeholder="/* Add your custom CSS here */"
                    className="font-mono text-sm h-32"
                    value={brandingSettings.customCSS}
                    onChange={(e) => setBrandingSettings({...brandingSettings, customCSS: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Footer HTML</label>
                  <Textarea 
                    placeholder="<p>© 2024 Your Organization. All rights reserved.</p>"
                    className="font-mono text-sm h-24"
                    value={brandingSettings.customFooter}
                    onChange={(e) => setBrandingSettings({...brandingSettings, customFooter: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleBrandingUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Apply Branding Changes'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Branding Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Branding Preview</CardTitle>
              <CardDescription>
                Preview how your branding will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6" style={{
                borderColor: brandingSettings.primaryColor,
                background: `linear-gradient(135deg, ${brandingSettings.primaryColor}15, ${brandingSettings.secondaryColor}15)`
              }}>
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: brandingSettings.primaryColor }}
                  >
                    <span className="text-white font-bold">L</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: brandingSettings.primaryColor }}>
                      {brandingSettings.organizationName}
                    </h3>
                    <p className="text-sm text-gray-600">{brandingSettings.tagline}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button style={{ backgroundColor: brandingSettings.primaryColor }}>
                    Primary Action
                  </Button>
                  <Button variant="outline" style={{ borderColor: brandingSettings.secondaryColor, color: brandingSettings.secondaryColor }}>
                    Secondary Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Integration Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Plug className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h3 className="font-medium">Connected</h3>
                <p className="text-2xl font-bold text-blue-600">{(integrations.length > 0 ? integrations : mockIntegrations).filter(i => i.status === 'connected').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <RefreshCw className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <h3 className="font-medium">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{(integrations.length > 0 ? integrations : mockIntegrations).filter(i => i.status === 'pending').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Link className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <h3 className="font-medium">Available</h3>
                <p className="text-2xl font-bold text-red-600">{(integrations.length > 0 ? integrations : mockIntegrations).filter(i => i.status === 'disconnected').length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Integrations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Third-Party Integrations
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </CardTitle>
              <CardDescription>
                Manage connections to external services and platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(integrations.length > 0 ? integrations : mockIntegrations).map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {integration.category === 'Analytics' && <ToggleLeft className="h-6 w-6 text-blue-600" />}
                        {integration.category === 'Payment' && <DollarSign className="h-6 w-6 text-green-600" />}
                        {integration.category === 'Communication' && <Mail className="h-6 w-6 text-purple-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{integration.name}</h4>
                          <Badge className={getCategoryColor(integration.category)} variant="outline">
                            {integration.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Last sync: {integration.lastSync}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setActiveIntegration(integration as any)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Configure {integration.name}</DialogTitle>
                            <DialogDescription>
                              Manage integration settings and authentication
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">API Key</label>
                              <Input type="password" placeholder="Enter API key" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Webhook URL</label>
                              <Input placeholder="https://your-webhook-url.com" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Enable automatic sync</span>
                              <Switch defaultChecked={integration.status === 'connected'} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Test Connection</Button>
                              <Button onClick={() => handleIntegrationUpdate(integration.id, {})} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Settings'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {integration.status === 'connected' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect Integration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to disconnect {integration.name}? This will stop all data synchronization.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  General platform configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Name</label>
                  <Input defaultValue="CogneraX Learn" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="aed">AED (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance Mode</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Registration</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Notifications</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Platform security and privacy configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input type="number" defaultValue="120" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password Policy</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (8+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="high">High (12+ chars, numbers, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Failed Login Attempts</label>
                  <Input type="number" defaultValue="5" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Two-Factor Authentication</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IP Whitelisting</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">HTTPS Only</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Allowed File Types</label>
                  <Textarea 
                    placeholder="pdf, doc, docx, ppt, pptx, jpg, png, mp4, mp3"
                    className="h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">User Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Welcome emails</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course enrollment</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assignment reminders</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grade notifications</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Instructor Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New enrollments</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assignment submissions</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Discussion posts</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System updates</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Admin Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System alerts</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security events</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup status</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Performance alerts</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}