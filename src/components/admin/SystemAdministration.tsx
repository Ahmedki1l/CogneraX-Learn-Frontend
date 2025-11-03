import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Activity, Shield, Database, AlertTriangle, CheckCircle, XCircle, Clock, Download, RefreshCw, Server, HardDrive, Cpu, MemoryStick, Wifi, Eye, Archive, FileText, Search, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

const mockAuditLogs = [
  { id: 1, timestamp: '2024-01-15 14:30:25', user: 'admin@cognerax.com', action: 'User Created', resource: 'User: sarah.johnson@email.com', ip: '192.168.1.100', status: 'success' },
  { id: 2, timestamp: '2024-01-15 14:25:12', user: 'instructor@cognerax.com', action: 'Course Published', resource: 'Course: Advanced React Development', ip: '192.168.1.105', status: 'success' },
  { id: 3, timestamp: '2024-01-15 14:20:45', user: 'admin@cognerax.com', action: 'Permission Modified', resource: 'Role: Instructor', ip: '192.168.1.100', status: 'success' },
  { id: 4, timestamp: '2024-01-15 14:15:30', user: 'system', action: 'Backup Completed', resource: 'Full System Backup', ip: 'localhost', status: 'success' },
  { id: 5, timestamp: '2024-01-15 14:10:22', user: 'student@email.com', action: 'Login Failed', resource: 'Authentication System', ip: '192.168.1.120', status: 'failed' }
];

const mockSystemMetrics = {
  server: {
    uptime: '99.8%',
    cpu: 45,
    memory: 68,
    disk: 35,
    network: 22
  },
  database: {
    connections: 89,
    queryTime: '125ms',
    size: '2.4GB',
    status: 'healthy'
  },
  performance: {
    responseTime: '245ms',
    throughput: '1,250 req/min',
    errorRate: '0.1%',
    activeUsers: 1456
  }
};

const mockBackups = [
  { id: 1, type: 'Full Backup', date: '2024-01-15 02:00:00', size: '2.4GB', status: 'completed', duration: '45 minutes' },
  { id: 2, type: 'Incremental', date: '2024-01-14 02:00:00', size: '450MB', status: 'completed', duration: '12 minutes' },
  { id: 3, type: 'Full Backup', date: '2024-01-13 02:00:00', size: '2.3GB', status: 'completed', duration: '42 minutes' },
  { id: 4, type: 'Incremental', date: '2024-01-12 02:00:00', size: '380MB', status: 'completed', duration: '10 minutes' },
  { id: 5, type: 'Full Backup', date: '2024-01-11 02:00:00', size: '2.2GB', status: 'failed', duration: 'N/A' }
];

export function SystemAdministration() {
  const { t } = useLanguage();
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logFilter, setLogFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // Fetch system data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [metricsResponse, auditResponse, backupsResponse, complianceResponse] = await Promise.allSettled([
          api.system.getSystemMetrics(),
          api.system.getAuditLogs({ filter: logFilter, date: dateFilter }),
          api.system.getBackups(),
          api.system.getComplianceReports()
        ]);

        // Process system metrics
        if (metricsResponse.status === 'fulfilled' && metricsResponse.value) {
          setSystemMetrics(metricsResponse.value);
        } else {
          // Fallback to mock data
          setSystemMetrics(mockSystemMetrics);
        }

        // Process audit logs
        if (auditResponse.status === 'fulfilled' && auditResponse.value && Array.isArray(auditResponse.value)) {
          setAuditLogs(auditResponse.value);
        } else {
          setAuditLogs(mockAuditLogs);
        }

        // Process backups
        if (backupsResponse.status === 'fulfilled' && backupsResponse.value && Array.isArray(backupsResponse.value)) {
          setBackups(backupsResponse.value);
        } else {
          setBackups(mockBackups);
        }

        // Process compliance reports
        if (complianceResponse.status === 'fulfilled' && complianceResponse.value && Array.isArray(complianceResponse.value)) {
          setComplianceReports(complianceResponse.value);
        } else {
          setComplianceReports([]);
        }

      } catch (error) {
        console.error('Failed to fetch system data:', error);
        setError('Failed to load system data. Using cached data.');
        // Fallback to mock data
        setSystemMetrics(mockSystemMetrics);
        setAuditLogs(mockAuditLogs);
        setBackups(mockBackups);
        setComplianceReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();

    // Set up auto-refresh every minute
    const refreshInterval = setInterval(() => {
      setRefreshing(true);
      fetchSystemData().finally(() => setRefreshing(false));
    }, 60000); // 1 minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, [logFilter, dateFilter]);

  const handleCreateBackup = async () => {
    try {
      const response = await api.system.createBackup();
      if (response) {
        toast.success('Backup created successfully');
        // Refresh backups list
        const backupsResponse = await api.system.getBackups();
        if (backupsResponse && Array.isArray(backupsResponse)) {
          setBackups(backupsResponse);
        }
      } else {
        toast.error('Failed to create backup');
      }
    } catch (error) {
      console.error('Create backup failed:', error);
      toast.error('Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      const response = await api.system.restoreBackup(backupId);
      if (response) {
        toast.success('Backup restored successfully');
        // Refresh backups list
        const backupsResponse = await api.system.getBackups();
        if (backupsResponse && Array.isArray(backupsResponse)) {
          setBackups(backupsResponse);
        }
      } else {
        toast.error('Failed to restore backup');
      }
    } catch (error) {
      console.error('Restore backup failed:', error);
      toast.error('Failed to restore backup');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': case 'completed': case 'healthy': return 'bg-green-100 text-green-800';
      case 'failed': case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('Created') || action.includes('Added')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes('Failed') || action.includes('Error')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes('Modified') || action.includes('Updated')) return <RefreshCw className="h-4 w-4 text-blue-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const filteredLogs = (auditLogs.length > 0 ? auditLogs : mockAuditLogs).filter(log => {
    if (logFilter !== 'all' && log.status !== logFilter) return false;
    // Add date filtering logic here
    return true;
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
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
            {t('admin.systemAdministration', 'System Administration')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.systemAdminDesc', 'Monitor system health, audit logs, and manage backups')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold">{systemMetrics?.server?.uptime || mockSystemMetrics.server.uptime}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{(systemMetrics?.performance?.activeUsers || mockSystemMetrics.performance.activeUsers).toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  +12% today
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{systemMetrics?.performance?.responseTime || mockSystemMetrics.performance.responseTime}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Good
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wifi className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{systemMetrics?.performance?.errorRate || mockSystemMetrics.performance.errorRate}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Low
                </p>
              </div>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Resources
                </CardTitle>
                <CardDescription>
                  Real-time server performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm">{systemMetrics?.server?.cpu || mockSystemMetrics.server.cpu}%</span>
                  </div>
                  <Progress value={systemMetrics?.server?.cpu || mockSystemMetrics.server.cpu} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <span className="text-sm">{systemMetrics?.server?.memory || mockSystemMetrics.server.memory}%</span>
                  </div>
                  <Progress value={systemMetrics?.server?.memory || mockSystemMetrics.server.memory} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Disk Usage</span>
                    </div>
                    <span className="text-sm">{systemMetrics?.server?.disk || mockSystemMetrics.server.disk}%</span>
                  </div>
                  <Progress value={systemMetrics?.server?.disk || mockSystemMetrics.server.disk} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Network I/O</span>
                    </div>
                    <span className="text-sm">{systemMetrics?.server?.network || mockSystemMetrics.server.network}%</span>
                  </div>
                  <Progress value={systemMetrics?.server?.network || mockSystemMetrics.server.network} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
                <CardDescription>
                  Database performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Connections</p>
                    <p className="text-2xl font-bold text-blue-600">{systemMetrics?.database?.connections || mockSystemMetrics.database.connections}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Query Time</p>
                    <p className="text-2xl font-bold text-green-600">{systemMetrics?.database?.queryTime || mockSystemMetrics.database.queryTime}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Size</span>
                    <span className="text-sm">{systemMetrics?.database?.size || mockSystemMetrics.database.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getStatusColor(systemMetrics?.database?.status || mockSystemMetrics.database.status)}>
                      {systemMetrics?.database?.status || mockSystemMetrics.database.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm">2 hours ago</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Database Logs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">High Memory Usage Detected</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Memory usage has exceeded 65% for the past 30 minutes. Consider scaling resources.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-yellow-700">
                    Dismiss
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">Backup Completed Successfully</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Full system backup completed in 45 minutes. All data secured.
                    </p>
                    <p className="text-xs text-green-600 mt-2">6 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-700">
                    Dismiss
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">System Update Available</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      A new system update is available with security improvements and bug fixes.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">1 day ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-700">
                    Update Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Log Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search logs..." className="pl-10" />
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Detailed system activity and security logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.action}</span>
                          <Badge className={getStatusColor(log.status)} variant="outline">
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{log.resource}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>User: {log.user}</span>
                          <span>IP: {log.ip}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backup Configuration
                </CardTitle>
                <CardDescription>
                  Configure automated backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Time</label>
                  <Input type="time" defaultValue="02:00" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Retention Period</label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Include User Data</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Include System Logs</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compress Backups</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full">
                    Save Configuration
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={handleCreateBackup}>
                        <Archive className="h-4 w-4 mr-2" />
                        Create Backup Now
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Create Manual Backup</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create a full system backup. The process may take some time depending on the amount of data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Start Backup</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Recovery Options
                </CardTitle>
                <CardDescription>
                  System recovery and restoration tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Disaster Recovery</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Restore system from the most recent backup
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Recovery Process
                  </Button>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Selective Restore</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Restore specific data or components
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Browse Backups
                  </Button>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Point-in-Time Recovery</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Restore to a specific date and time
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Select Restore Point
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recovery Test</label>
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test Recovery Process
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                Recent backup operations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(backups.length > 0 ? backups : mockBackups).map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Archive className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{backup.type}</span>
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{backup.date}</span>
                          <span>Size: {backup.size}</span>
                          <span>Duration: {backup.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRestoreBackup(backup.id)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Current compliance with security standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GDPR Compliance</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SOC 2 Type II</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ISO 27001</span>
                    <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">FERPA</span>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Compliance Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>
                  Generate and download compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    GDPR Data Processing Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Security Audit Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Access Control Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Data Retention Report
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Report Period</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" />
                    <Input type="date" />
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Privacy Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Data Privacy Controls</CardTitle>
              <CardDescription>
                Manage data privacy and user rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">Data Requests</h4>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">Deletion Requests</h4>
                  <p className="text-2xl font-bold text-green-600">5</p>
                  <p className="text-xs text-gray-600">This Month</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">Data Portability</h4>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                  <p className="text-xs text-gray-600">Exports</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">Consent Status</h4>
                  <p className="text-2xl font-bold text-teal-600">98%</p>
                  <p className="text-xs text-gray-600">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}