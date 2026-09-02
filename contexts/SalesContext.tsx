// Sales Context — State Management for Sales Module
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  SaleInvoiceFull, SalesDashboardStats, SalesPolicy, SalePaymentRecord,
  SalesReturn, CreditNote,
} from '../types/sales';
import {
  DEMO_INVOICES, DEMO_SALES_STATS, DEMO_SALES_POLICY,
  DEMO_CREDIT_NOTES, DEMO_RETURNS, generateInvoiceNumber,
} from '../services/salesData';

interface SalesContextType {
  // State
  invoices: SaleInvoiceFull[];
  stats: SalesDashboardStats;
  policy: SalesPolicy;
  creditNotes: CreditNote[];
  returns: SalesReturn[];
  loading: boolean;
  // Filters
  filterStatus: string;
  filterPeriod: string;
  searchQuery: string;
  setFilterStatus: (v: string) => void;
  setFilterPeriod: (v: string) => void;
  setSearchQuery: (v: string) => void;
  // Actions
  addInvoice: (invoice: SaleInvoiceFull) => void;
  updateInvoice: (id: string, updates: Partial<SaleInvoiceFull>) => void;
  approveInvoice: (id: string) => void;
  cancelInvoice: (id: string) => void;
  addPayment: (invoiceId: string, payment: SalePaymentRecord) => void;
  addReturn: (ret: SalesReturn) => void;
  addCreditNote: (cn: CreditNote) => void;
  // Computed
  getFilteredInvoices: () => SaleInvoiceFull[];
  getInvoiceById: (id: string) => SaleInvoiceFull | undefined;
  getNextInvoiceNumber: () => string;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<SaleInvoiceFull[]>(DEMO_INVOICES);
  const [stats] = useState<SalesDashboardStats>(DEMO_SALES_STATS);
  const [policy] = useState<SalesPolicy>(DEMO_SALES_POLICY);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(DEMO_CREDIT_NOTES);
  const [returns, setReturns] = useState<SalesReturn[]>(DEMO_RETURNS);
  const [loading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  const addInvoice = useCallback((invoice: SaleInvoiceFull) => {
    setInvoices(prev => [invoice, ...prev]);
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<SaleInvoiceFull>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  }, []);

  const approveInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'approved', approved_at: new Date().toISOString() } : inv
    ));
  }, []);

  const cancelInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'cancelled' } : inv
    ));
  }, []);

  const addPayment = useCallback((invoiceId: string, payment: SalePaymentRecord) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paid_amount + payment.amount;
      const newOutstanding = inv.total - newPaid;
      const newStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';
      return {
        ...inv,
        paid_amount: newPaid,
        outstanding: Math.max(0, newOutstanding),
        status: newStatus,
        payments: [...inv.payments, payment],
      };
    }));
  }, []);

  const addReturn = useCallback((ret: SalesReturn) => {
    setReturns(prev => [ret, ...prev]);
    if (ret.status === 'completed') {
      setInvoices(prev => prev.map(inv =>
        inv.id === ret.original_invoice_id ? { ...inv, status: 'returned' } : inv
      ));
    }
  }, []);

  const addCreditNote = useCallback((cn: CreditNote) => {
    setCreditNotes(prev => [cn, ...prev]);
  }, []);

  const getFilteredInvoices = useCallback(() => {
    return invoices.filter(inv => {
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchSearch = !searchQuery ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customer_name_ar ?? '').includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [invoices, filterStatus, searchQuery]);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  const getNextInvoiceNumber = useCallback(() => {
    return generateInvoiceNumber(policy.invoice_prefix, policy.invoice_next_number);
  }, [policy]);

  return (
    <SalesContext.Provider value={{
      invoices, stats, policy, creditNotes, returns, loading,
      filterStatus, filterPeriod, searchQuery,
      setFilterStatus, setFilterPeriod, setSearchQuery,
      addInvoice, updateInvoice, approveInvoice, cancelInvoice,
      addPayment, addReturn, addCreditNote,
      getFilteredInvoices, getInvoiceById, getNextInvoiceNumber,
    }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
