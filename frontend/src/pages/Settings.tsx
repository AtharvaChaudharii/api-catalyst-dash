import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2, Key, User, Settings as SettingsIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
  });
  const [cacheSettings, setCacheSettings] = useState({
    defaultTTL: 3600,
    lockStrategy: true,
    autoEviction: true,
  });


  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleCacheSettingsUpdate = () => {
    toast({
      title: "Settings Updated",
      description: "Your cache configuration has been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and cache configuration
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal and company information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleProfileUpdate}>Update Profile</Button>
          </CardContent>
        </Card>


        {/* Cache Configuration */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Cache Configuration
            </CardTitle>
            <CardDescription>
              Configure your caching behavior and performance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ttl">Default TTL (seconds)</Label>
                <Input
                  id="ttl"
                  type="number"
                  value={cacheSettings.defaultTTL}
                  onChange={(e) => setCacheSettings(prev => ({ 
                    ...prev, 
                    defaultTTL: parseInt(e.target.value) || 0 
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  How long cached items should be stored by default
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lock Strategy</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent cache stampede with distributed locking
                  </p>
                </div>
                <Switch
                  checked={cacheSettings.lockStrategy}
                  onCheckedChange={(checked) => 
                    setCacheSettings(prev => ({ ...prev, lockStrategy: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Eviction</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove expired cache entries
                  </p>
                </div>
                <Switch
                  checked={cacheSettings.autoEviction}
                  onCheckedChange={(checked) => 
                    setCacheSettings(prev => ({ ...prev, autoEviction: checked }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleCacheSettingsUpdate}>
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;