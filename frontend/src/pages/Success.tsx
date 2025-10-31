import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Zap, Terminal, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Success = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const token = getCookie("token");
        if (!token) throw new Error("No auth token");
        const res = await fetch("/api/auth/one-time-api-key", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch API key");
        }
        setApiKey(data.apiKey || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied!",
      description: "Your API key has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">API Catalyst</h1>
          </div>
        </div>

        <Card className="border-white/20 bg-white/10 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <CardTitle className="text-white text-2xl">Welcome to API Catalyst!</CardTitle>
            <CardDescription className="text-white/70">
              Your account has been created successfully. Here's your API key to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Your API Key</h3>
              <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-white/20">
                <code className="flex-1 text-white font-mono text-sm">
                  {loading ? "Fetching your API key..." : (apiKey ?? "Already retrieved or unavailable")}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyApiKey}
                  className="text-white hover:bg-white/10"
                  disabled={!apiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-white/60 text-sm">
                Keep this key secure! You'll need it to authenticate your API requests.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Quick Start
              </h3>
              <div className="bg-black/20 rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-3">Install the SDK:</p>
                <code className="block text-white font-mono text-sm bg-black/30 p-2 rounded">
                  npm install api-catalyst
                </code>
                <p className="text-white/70 text-sm mt-3 mb-2">Initialize in your code:</p>
                <code className="block text-white font-mono text-sm bg-black/30 p-2 rounded">
                  {`const catalyst = new APICatalyst('${apiKey}');`}
                </code>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 bg-white text-primary hover:bg-white/90">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <a href="" target="_blank" rel="noopener noreferrer">
                  View Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/80 hover:text-white underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;