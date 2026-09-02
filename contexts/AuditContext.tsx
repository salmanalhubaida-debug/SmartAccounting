// Audit Log Context — Tracks all user actions across the platform
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuditLog } from '../types/database';
import { useAuth } from '../hooks/useAuth';

interface AuditContextType {
  logs: AuditLog[];
  log: (params: LogParams) => void;
  getLogsForModule: (module: string) => AuditLog[];
  getLogsForRecord: (recordId: string) => AuditLog[];
  clearLogs: () => void;
}

interface LogParams {
  action: AuditLog['action'];
  module: string;
  record_id?: string;
  record_type?: string;
  previous_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  company_id?: string;
  branch_id?: string;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Seed with some demo audit entries
const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    company_id: 'company-001',
    user_id: 'user-002',
    user_name: 'Ahmad Al-Watan',
    action: 'login',
    module: 'auth',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log-002',
    company_id: 'company-001',
    branch_id: 'branch-001',
    user_id: 'user-003',
    user_name: 'Sara Al-Rashidi',
    action: 'create',
    module: 'sales',
    record_id: 'inv-001',
    record_type: 'sale_invoice',
    new_data: { invoice_number: 'INV-2024-0234', total: 250.000 },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log-003',
    company_id: 'company-001',
    branch_id: 'branch-001',
    user_id: 'user-003',
    user_name: 'Sara Al-Rashidi',
    action: 'approve',
    module: 'expenses',
    record_id: 'exp-001',
    record_type: 'expense',
    new_data: { status: 'approved', amount: 1800.000 },
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'log-004',
    company_id: 'company-001',
    user_id: 'user-002',
    user_name: 'Ahmad Al-Watan',
    action: 'create',
    module: 'users',
    record_id: 'user-003',
    record_type: 'user',
    new_data: { email: 'sara@company.com', role: 'accountant' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'log-005',
    company_id: 'company-001',
    user_id: 'user-002',
    user_name: 'Ahmad Al-Watan',
    action: 'update',
    module: 'settings',
    record_type: 'company_settings',
    previous_data: { currency: 'USD' },
    new_data: { currency: 'KWD' },
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);

  const log = useCallback((params: LogParams) => {
    if (!user) return;
    const entry: AuditLog = {
      id: `log-${Date.now()}`,
      user_id: user.id,
      user_name: user.full_name,
      company_id: params.company_id ?? user.company_id,
      branch_id: params.branch_id,
      action: params.action,
      module: params.module,
      record_id: params.record_id,
      record_type: params.record_type,
      previous_data: params.previous_data,
      new_data: params.new_data,
      created_at: new Date().toISOString(),
    };
    setLogs(prev => [entry, ...prev]);
  }, [user]);

  const getLogsForModule = useCallback((module: string) =>
    logs.filter(l => l.module === module), [logs]);

  const getLogsForRecord = useCallback((recordId: string) =>
    logs.filter(l => l.record_id === recordId), [logs]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <AuditContext.Provider value={{ logs, log, getLogsForModule, getLogsForRecord, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
