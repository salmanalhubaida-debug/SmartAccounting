// Purchases Context — State Management
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  PurchaseInvoiceFull, PurchaseOrder, GoodsReceiptNote, LandedCost,
  PurchasePaymentRecord, PurchaseReturn, SupplierCreditNote,
  PurchaseDashboardStats, PurchasePolicy,
} from '../types/purchases';
import {
  DEMO_PURCHASE_INVOICES, DEMO_PURCHASE_ORDERS, DEMO_GRNS,
  DEMO_LANDED_COSTS, DEMO_PURCHASE_STATS, DEMO_PURCHASE_POLICY,
  DEMO_PURCHASE_RETURNS, DEMO_SUPPLIER_CREDIT_NOTES,
  generatePurchaseNumber,
} from '../services/purchasesData';

interface PurchasesContextType {
  // State
  invoices: PurchaseInvoiceFull[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  landedCosts: LandedCost[];
  returns: PurchaseReturn[];
  supplierCreditNotes: SupplierCreditNote[];
  stats: PurchaseDashboardStats;
  policy: PurchasePolicy;
  loading: boolean;
  // Filters
  filterStatus: string;
  searchQuery: string;
  activeTab: string;
  setFilterStatus: (v: string) => void;
  setSearchQuery: (v: string) => void;
  setActiveTab: (v: string) => void;
  // Invoice Actions
  addInvoice: (invoice: PurchaseInvoiceFull) => void;
  updateInvoice: (id: string, updates: Partial<PurchaseInvoiceFull>) => void;
  approveInvoice: (id: string) => void;
  cancelInvoice: (id: string) => void;
  addPayment: (invoiceId: string, payment: PurchasePaymentRecord) => void;
  // PO Actions
  addPurchaseOrder: (po: PurchaseOrder) => void;
  approvePO: (id: string) => void;
  // GRN Actions
  addGRN: (grn: GoodsReceiptNote) => void;
  approveGRN: (id: string) => void;
  // Landed Cost Actions
  addLandedCost: (lc: LandedCost) => void;
  finalizeLandedCost: (id: string) => void;
  // Return Actions
  addReturn: (ret: PurchaseReturn) => void;
  addSupplierCreditNote: (cn: SupplierCreditNote) => void;
  // Computed
  getFilteredInvoices: () => PurchaseInvoiceFull[];
  getInvoiceById: (id: string) => PurchaseInvoiceFull | undefined;
  getPOById: (id: string) => PurchaseOrder | undefined;
  getLandedCostById: (id: string) => LandedCost | undefined;
  getNextInvoiceNumber: () => string;
  getNextPONumber: () => string;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<PurchaseInvoiceFull[]>(DEMO_PURCHASE_INVOICES);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(DEMO_PURCHASE_ORDERS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>(DEMO_GRNS);
  const [landedCosts, setLandedCosts] = useState<LandedCost[]>(DEMO_LANDED_COSTS);
  const [returns, setReturns] = useState<PurchaseReturn[]>(DEMO_PURCHASE_RETURNS);
  const [supplierCreditNotes, setSupplierCreditNotes] = useState<SupplierCreditNote[]>(DEMO_SUPPLIER_CREDIT_NOTES);
  const [stats] = useState<PurchaseDashboardStats>(DEMO_PURCHASE_STATS);
  const [policy] = useState<PurchasePolicy>(DEMO_PURCHASE_POLICY);
  const [loading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const addInvoice = useCallback((invoice: PurchaseInvoiceFull) => {
    setInvoices(prev => [invoice, ...prev]);
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<PurchaseInvoiceFull>) => {
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

  const addPayment = useCallback((invoiceId: string, payment: PurchasePaymentRecord) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paid_amount + payment.amount;
      const newOutstanding = inv.total - newPaid;
      const newStatus: PurchaseInvoiceFull['status'] = newOutstanding <= 0 ? 'paid' : 'partially_paid';
      return {
        ...inv,
        paid_amount: newPaid,
        outstanding: Math.max(0, newOutstanding),
        status: newStatus,
        payments: [...inv.payments, payment],
      };
    }));
  }, []);

  const addPurchaseOrder = useCallback((po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
  }, []);

  const approvePO = useCallback((id: string) => {
    setPurchaseOrders(prev => prev.map(po =>
      po.id === id ? { ...po, status: 'confirmed', approved_at: new Date().toISOString() } : po
    ));
  }, []);

  const addGRN = useCallback((grn: GoodsReceiptNote) => {
    setGoodsReceipts(prev => [grn, ...prev]);
  }, []);

  const approveGRN = useCallback((id: string) => {
    setGoodsReceipts(prev => prev.map(g =>
      g.id === id ? { ...g, status: 'approved', approved_at: new Date().toISOString() } : g
    ));
  }, []);

  const addLandedCost = useCallback((lc: LandedCost) => {
    setLandedCosts(prev => [lc, ...prev]);
  }, []);

  const finalizeLandedCost = useCallback((id: string) => {
    setLandedCosts(prev => prev.map(lc =>
      lc.id === id ? { ...lc, status: 'finalized', finalized_at: new Date().toISOString() } : lc
    ));
  }, []);

  const addReturn = useCallback((ret: PurchaseReturn) => {
    setReturns(prev => [ret, ...prev]);
    if (ret.status === 'completed') {
      setInvoices(prev => prev.map(inv =>
        inv.id === ret.original_invoice_id ? { ...inv, status: 'returned' } : inv
      ));
    }
  }, []);

  const addSupplierCreditNote = useCallback((cn: SupplierCreditNote) => {
    setSupplierCreditNotes(prev => [cn, ...prev]);
  }, []);

  const getFilteredInvoices = useCallback(() => {
    return invoices.filter(inv => {
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.supplier_name.toLowerCase().includes(q) ||
        (inv.supplier_name_ar ?? '').includes(searchQuery) ||
        (inv.supplier_invoice_number ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [invoices, filterStatus, searchQuery]);

  const getInvoiceById = useCallback((id: string) => invoices.find(i => i.id === id), [invoices]);
  const getPOById = useCallback((id: string) => purchaseOrders.find(p => p.id === id), [purchaseOrders]);
  const getLandedCostById = useCallback((id: string) => landedCosts.find(l => l.id === id), [landedCosts]);

  const getNextInvoiceNumber = useCallback(() =>
    generatePurchaseNumber(policy.invoice_prefix, policy.invoice_next_number), [policy]);
  const getNextPONumber = useCallback(() =>
    generatePurchaseNumber(policy.po_prefix, policy.po_next_number), [policy]);

  return (
    <PurchasesContext.Provider value={{
      invoices, purchaseOrders, goodsReceipts, landedCosts, returns, supplierCreditNotes,
      stats, policy, loading,
      filterStatus, searchQuery, activeTab,
      setFilterStatus, setSearchQuery, setActiveTab,
      addInvoice, updateInvoice, approveInvoice, cancelInvoice, addPayment,
      addPurchaseOrder, approvePO,
      addGRN, approveGRN,
      addLandedCost, finalizeLandedCost,
      addReturn, addSupplierCreditNote,
      getFilteredInvoices, getInvoiceById, getPOById, getLandedCostById,
      getNextInvoiceNumber, getNextPONumber,
    }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within PurchasesProvider');
  return ctx;
}
