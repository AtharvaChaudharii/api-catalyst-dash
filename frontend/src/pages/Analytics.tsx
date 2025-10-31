import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  return `${hh}:00`;
};

type HitMissPoint = { time: string; hits: number; misses: number };
type TopEndpointRow = { endpoint: string; requests: number; cacheHitRatio: number };
type LatencySavedRow = { endpoint: string; saved: number };

const responseTimeDataStatic: LatencySavedRow[] = [];

const rateLimitData = [
  { name: "Available", value: 85, color: "hsl(var(--success))" },
  { name: "Used", value: 15, color: "hsl(var(--warning))" },
];

const topEndpointsStatic: TopEndpointRow[] = [];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [hitMissData, setHitMissData] = useState<HitMissPoint[]>([]);
  const [topEndpoints, setTopEndpoints] = useState<TopEndpointRow[]>(topEndpointsStatic);
  const [responseTimeData, setResponseTimeData] = useState<LatencySavedRow[]>(responseTimeDataStatic);

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = getCookie("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const [hitMissRes, topRes, latencyRes] = await Promise.all([
          fetch("/api/analytics/hit-miss-series", { headers }),
          fetch("/api/analytics/top-endpoints", { headers }),
          fetch("/api/analytics/latency-saved", { headers })
        ]);

        const [hitMissJson, topJson, latencyJson] = await Promise.all([
          hitMissRes.json(), topRes.json(), latencyRes.json()
        ]);

        if (hitMissRes.ok && hitMissJson?.success) {
          const arr = (hitMissJson.data || [])
            .map((p: any) => ({ time: formatTime(p.bucketStart), hits: p.hits, misses: p.misses }))
            .sort((a: HitMissPoint, b: HitMissPoint) => a.time.localeCompare(b.time));
          setHitMissData(arr);
        }

        if (topRes.ok && topJson?.success) {
          const arr: TopEndpointRow[] = (topJson.data || []).map((r: any) => ({
            endpoint: r.endpoint,
            requests: r.requests,
            cacheHitRatio: r.cacheHitRatio || 0
          }));
          setTopEndpoints(arr);
        }

        if (latencyRes.ok && latencyJson?.success) {
          const arr: LatencySavedRow[] = (latencyJson.data || []).map((r: any) => ({
            endpoint: r.endpoint,
            saved: r.saved || 0
          }));
          setResponseTimeData(arr);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed performance metrics and insights
          </p>
        </div>

        {/* Hit vs Miss Chart */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle>Cache Hit vs Miss Over Time</CardTitle>
            <CardDescription>
              24-hour comparison of cache performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hitMissData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hits" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Cache Hits"
                />
                <Line 
                  type="monotone" 
                  dataKey="misses" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Cache Misses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Endpoints Table */}
          <Card className="bg-gradient-card shadow-md">
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>Most requested API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Hit Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topEndpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                      <TableCell>{endpoint.requests.toLocaleString()}</TableCell>
                      <TableCell className="text-success font-medium">{`${endpoint.cacheHitRatio.toFixed(1)}%`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Rate Limit Usage */}
          <Card className="bg-gradient-card shadow-md">
            <CardHeader>
              <CardTitle>Rate Limit Usage</CardTitle>
              <CardDescription>Current rate limit consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={rateLimitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {rateLimitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {rateLimitData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.name}: {entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Time Saved */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle>Response Time Saved by Endpoint</CardTitle>
            <CardDescription>
              Average latency reduction per endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, "Time Saved"]} />
                <Bar 
                  dataKey="saved" 
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;