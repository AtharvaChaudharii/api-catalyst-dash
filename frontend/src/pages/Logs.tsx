import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type LogRow = {
  timestamp: string;
  endpoint: string;
  method: string;
  cacheHit: boolean;
  latencyMs: number;
  statusCode: number;
};

const formatTimestamp = (ts: string | Date) => {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

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
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const token = getCookie("token");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (methodFilter !== "all") params.set("method", methodFilter);
        if (searchTerm) params.set("search", searchTerm);
        const res = await fetch(`/api/logs?${params.toString()}` , {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to fetch logs");
        setRows((json.data || []) as LogRow[]);
        setTotal(json.pagination?.total || 0);
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [searchTerm, statusFilter, methodFilter, page, limit]);

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
            {loading ? "Loading..." : `Showing ${rows.length} of ${total} requests`}
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
                  {rows.map((log, idx) => {
                    const status = log.cacheHit ? "HIT" : "MISS";
                    const latency = log.latencyMs ?? 0;
                    return (
                      <TableRow key={`${log.timestamp}-${idx}`}>
                        <TableCell className="font-mono text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.endpoint}
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(log.method)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(status)}
                        </TableCell>
                        <TableCell>
                          <span className={latency < 100 ? "text-success" : latency < 300 ? "text-warning" : "text-destructive"}>
                            {latency}ms
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            {log.statusCode}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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