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

const hitMissData = [
  { time: "00:00", hits: 3200, misses: 800 },
  { time: "04:00", hits: 2400, misses: 600 },
  { time: "08:00", hits: 6400, misses: 1600 },
  { time: "12:00", hits: 9600, misses: 2400 },
  { time: "16:00", hits: 7200, misses: 1800 },
  { time: "20:00", hits: 4800, misses: 1200 },
];

const responseTimeData = [
  { endpoint: "/api/users", saved: 320 },
  { endpoint: "/api/products", saved: 280 },
  { endpoint: "/api/orders", saved: 450 },
  { endpoint: "/api/auth", saved: 180 },
  { endpoint: "/api/analytics", saved: 380 },
];

const rateLimitData = [
  { name: "Available", value: 85, color: "hsl(var(--success))" },
  { name: "Used", value: 15, color: "hsl(var(--warning))" },
];

const topEndpoints = [
  { endpoint: "/api/users", requests: 15420, cacheHit: "94.2%" },
  { endpoint: "/api/products", requests: 12380, cacheHit: "91.8%" },
  { endpoint: "/api/orders", requests: 8950, cacheHit: "96.1%" },
  { endpoint: "/api/auth", requests: 7640, cacheHit: "88.3%" },
  { endpoint: "/api/analytics", requests: 5280, cacheHit: "92.7%" },
];

const Analytics = () => {
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
                      <TableCell className="text-success font-medium">{endpoint.cacheHit}</TableCell>
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