import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Zap } from "lucide-react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const setCookie = (name: string, value: string, days: number) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Signup failed");
      }
      if (data?.token) {
        setCookie("token", data.token, 7);
      }
      navigate("/success");
    } catch (err) {
      // Optionally surface error to user; keeping it minimal for now
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">API Catalyst</h1>
          </div>
          <p className="text-white/80">Create your account and start caching</p>
        </div>

        <Card className="border-white/20 bg-white/10 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Get started</CardTitle>
            <CardDescription className="text-white/70">
              Join thousands of developers already using API Catalyst
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90">
                Create Account
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-white/80">
                Already have an account?{" "}
                <Link to="/login" className="text-white hover:underline font-medium">
                  Sign in
                </Link>
              </p>
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

export default Signup;