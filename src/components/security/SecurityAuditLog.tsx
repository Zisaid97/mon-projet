
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export function SecurityAuditLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Mock data for demonstration - in a real app, this would come from your backend
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        userId: user?.id || '',
        action: 'LOGIN',
        resource: 'auth',
        details: { method: 'email', success: true },
        severity: 'low',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000),
        userId: user?.id || '',
        action: 'DATA_EXPORT',
        resource: 'marketing_data',
        details: { recordCount: 150, format: 'csv' },
        severity: 'medium',
        ipAddress: '192.168.1.1'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000),
        userId: 'unknown',
        action: 'FAILED_LOGIN',
        resource: 'auth',
        details: { attempts: 5, email: 'attacker@example.com' },
        severity: 'high',
        ipAddress: '10.0.0.1'
      }
    ];
    
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, [user]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, severityFilter, actionFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User ID', 'Action', 'Resource', 'Severity', 'IP Address', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userId,
        log.action,
        log.resource,
        log.severity,
        log.ipAddress || '',
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Journal d'Audit de Sécurité</span>
          </CardTitle>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sévérités</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Ressource</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>Adresse IP</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {log.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {log.action}
                    </code>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity)}>
                      {log.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ipAddress || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <details className="cursor-pointer">
                      <summary className="text-sm text-blue-600 hover:text-blue-800">
                        Voir détails
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun log trouvé avec les filtres actuels
          </div>
        )}
      </CardContent>
    </Card>
  );
}
