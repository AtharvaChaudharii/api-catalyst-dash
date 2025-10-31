import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Clock, Shield, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  return `${hh}:00`;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalRequests, setTotalRequests] = useState(0);
  const [cacheHitRatio, setCacheHitRatio] = useState(0);
  const [averageLatencySavedMs, setAverageLatencySavedMs] = useState(0);
  const [apiCallsPrevented, setApiCallsPrevented] = useState(0);
  const [series, setSeries] = useState<{ name: string; requests: number }[]>([]);

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch("/api/dashboard/summary", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to load dashboard");
        const d = json.data;
        setTotalRequests(d.totalRequests || 0);
        setCacheHitRatio(d.cacheHitRatio || 0);
        setAverageLatencySavedMs(d.averageLatencySavedMs || 0);
        setApiCallsPrevented(d.apiCallsPrevented || 0);
        const chart = (d.series || []).map((b: any) => ({ name: formatTime(b.bucketStart), requests: b.count }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setSeries(chart);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your API caching performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-card shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : `${cacheHitRatio.toFixed(1)}%`}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency Saved</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : `${Math.round(averageLatencySavedMs)}ms`}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls Prevented</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : apiCallsPrevented.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
            <CardDescription>
              24-hour overview of API requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;