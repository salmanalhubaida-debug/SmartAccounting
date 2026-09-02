// Company Context — Multi-tenant company & branch management
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Company, Branch } from '../types/database';
import {
  DEMO_COMPANIES, DEMO_BRANCHES,
  getMockUsersForCompany, getMockBranchesForCompany,
} from '../services/mockData';

interface CompanyContextType {
  // Active context
  activeCompany: Company | null;
  activeBranch: Branch | null;
  // Available
  companies: Company[];
  branches: Branch[];
  // Actions
  switchCompany: (companyId: string) => void;
  switchBranch: (branchId: string | null) => void;
  refreshBranches: () => void;
  // Branch CRUD
  addBranch: (branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  toggleBranchStatus: (id: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES);
  const [branches, setBranches] = useState<Branch[]>(DEMO_BRANCHES);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);

  // When user changes, resolve their company
  useEffect(() => {
    if (!user) {
      setActiveCompany(null);
      setActiveBranch(null);
      return;
    }

    if (user.role === 'super_admin') {
      // Super admin selects company manually
      return;
    }

    if (user.company_id) {
      const company = DEMO_COMPANIES.find(c => c.id === user.company_id) ?? null;
      setActiveCompany(company);

      // Load branches for this company
      const compBranches = DEMO_BRANCHES.filter(b => b.company_id === user.company_id);
      setBranches(compBranches);

      // If user is restricted to a branch, set it
      if (user.branch_id) {
        const branch = compBranches.find(b => b.id === user.branch_id) ?? null;
        setActiveBranch(branch);
      } else {
        // Default to main branch
        const main = compBranches.find(b => b.is_main) ?? compBranches[0] ?? null;
        setActiveBranch(main);
      }
    }
  }, [user]);

  const switchCompany = useCallback((companyId: string) => {
    const company = companies.find(c => c.id === companyId) ?? null;
    setActiveCompany(company);
    if (company) {
      const compBranches = DEMO_BRANCHES.filter(b => b.company_id === companyId);
      setBranches(compBranches);
      const main = compBranches.find(b => b.is_main) ?? compBranches[0] ?? null;
      setActiveBranch(main);
    }
  }, [companies]);

  const switchBranch = useCallback((branchId: string | null) => {
    if (!branchId) {
      setActiveBranch(null);
      return;
    }
    const branch = branches.find(b => b.id === branchId) ?? null;
    setActiveBranch(branch);
  }, [branches]);

  const refreshBranches = useCallback(() => {
    if (activeCompany) {
      const compBranches = DEMO_BRANCHES.filter(b => b.company_id === activeCompany.id);
      setBranches(compBranches);
    }
  }, [activeCompany]);

  const addBranch = useCallback((branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBranches(prev => [...prev, newBranch]);
  }, []);

  const updateBranch = useCallback((id: string, updates: Partial<Branch>) => {
    setBranches(prev => prev.map(b =>
      b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
    ));
  }, []);

  const toggleBranchStatus = useCallback((id: string) => {
    setBranches(prev => prev.map(b =>
      b.id === id
        ? { ...b, status: b.status === 'active' ? 'inactive' : 'active', updated_at: new Date().toISOString() }
        : b
    ));
  }, []);

  return (
    <CompanyContext.Provider value={{
      activeCompany, activeBranch,
      companies, branches,
      switchCompany, switchBranch, refreshBranches,
      addBranch, updateBranch, toggleBranchStatus,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
