import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const logs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:15",
    endpoint: "/api/users/123",
    method: "GET",
    status: "HIT",
    latency: 45,
    statusCode: 200,
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:31:58",
    endpoint: "/api/products",
    method: "GET",
    status: "MISS",
    latency: 320,
    statusCode: 200,
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:31:42",
    endpoint: "/api/orders/456",
    method: "POST",
    status: "HIT",
    latency: 28,
    statusCode: 201,
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:31:21",
    endpoint: "/api/auth/login",
    method: "POST",
    status: "MISS",
    latency: 180,
    statusCode: 200,
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:30:55",
    endpoint: "/api/analytics",
    method: "GET",
    status: "HIT",
    latency: 52,
    statusCode: 200,
  },
  {
    id: 6,
    timestamp: "2024-01-15 14:30:33",
    endpoint: "/api/users",
    method: "GET",
    status: "HIT",
    latency: 38,
    statusCode: 200,
  },
  {
    id: 7,
    timestamp: "2024-01-15 14:30:15",
    endpoint: "/api/products/789",
    method: "PUT",
    status: "MISS",
    latency: 425,
    statusCode: 200,
  },
  {
    id: 8,
    timestamp: "2024-01-15 14:29:58",
    endpoint: "/api/orders",
    method: "GET",
    status: "HIT",
    latency: 31,
    statusCode: 200,
  },
];

const getStatusIcon = (status: string) => {
  if (status === "HIT") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "MISS") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-warning" />;
};

const getStatusBadge = (status: string) => {
  const variants = {
    HIT: "bg-success/10 text-success border-success/20",
    MISS: "bg-destructive/10 text-destructive border-destructive/20",
    PENDING: "bg-warning/10 text-warning border-warning/20",
  };
  
  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants]}>
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

const getMethodBadge = (method: string) => {
  const colors = {
    GET: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    POST: "bg-green-500/10 text-green-600 border-green-500/20",
    PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  
  return (
    <Badge variant="outline" className={colors[method as keyof typeof colors]}>
      {method}
    </Badge>
  );
};

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesMethod = methodFilter === "all" || log.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Logs</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of all API requests
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              Filter and search through your API request logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search endpoints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="HIT">Hit</SelectItem>
                    <SelectItem value="MISS">Miss</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-gradient-card shadow-md">
          <CardHeader>
            <CardTitle>Request Logs</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Cache Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Status Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.endpoint}
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(log.method)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell>
                        <span className={log.latency < 100 ? "text-success" : log.latency < 300 ? "text-warning" : "text-destructive"}>
                          {log.latency}ms
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50">
                          {log.statusCode}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logs;