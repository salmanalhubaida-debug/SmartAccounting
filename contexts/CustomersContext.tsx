// Customers Context — State management for Customers module
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomerFull, SupplierFull, CustomerGroup, Contact } from '../types/customers';
import {
  DEMO_CUSTOMERS, DEMO_SUPPLIERS, DEMO_CUSTOMER_GROUPS, DEMO_CONTACTS,
} from '../services/customersData';
import { useAuth } from '../hooks/useAuth';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CustomersContextType {
  // Customers
  customers: CustomerFull[];
  addCustomer: (data: Omit<CustomerFull, 'id' | 'created_at' | 'updated_at' | 'code' | 'total_sales' | 'total_paid' | 'total_returns' | 'balance'>) => CustomerFull;
  updateCustomer: (id: string, data: Partial<CustomerFull>) => void;
  deleteCustomer: (id: string) => boolean; // returns false if has transactions
  archiveCustomer: (id: string) => void;
  getCustomer: (id: string) => CustomerFull | undefined;

  // Suppliers
  suppliers: SupplierFull[];
  addSupplier: (data: Omit<SupplierFull, 'id' | 'created_at' | 'updated_at' | 'code' | 'total_purchases' | 'total_paid' | 'total_returns' | 'balance'>) => SupplierFull;
  updateSupplier: (id: string, data: Partial<SupplierFull>) => void;
  archiveSupplier: (id: string) => void;
  getSupplier: (id: string) => SupplierFull | undefined;

  // Groups
  groups: CustomerGroup[];
  addGroup: (data: Omit<CustomerGroup, 'id' | 'created_at'>) => void;

  // Contacts
  contacts: Contact[];
  addContact: (data: Omit<Contact, 'id' | 'created_at'>) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactsFor: (entityType: 'customer' | 'supplier', entityId: string) => Contact[];

  // Helpers
  checkCreditLimit: (customerId: string, amount: number) => 'ok' | 'warning' | 'exceeded' | 'blocked';
  generateCustomerCode: () => string;
  generateSupplierCode: () => string;
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<CustomerFull[]>(DEMO_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<SupplierFull[]>(DEMO_SUPPLIERS);
  const [groups, setGroups] = useState<CustomerGroup[]>(DEMO_CUSTOMER_GROUPS);
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);

  // ── Code Generators ──────────────────────────────────────────────
  const generateCustomerCode = () => {
    const max = customers.reduce((acc, c) => {
      const num = parseInt(c.code.replace('CUST-', ''), 10);
      return num > acc ? num : acc;
    }, 0);
    return `CUST-${String(max + 1).padStart(4, '0')}`;
  };

  const generateSupplierCode = () => {
    const max = suppliers.reduce((acc, s) => {
      const num = parseInt(s.code.replace('SUPP-', ''), 10);
      return num > acc ? num : acc;
    }, 0);
    return `SUPP-${String(max + 1).padStart(4, '0')}`;
  };

  // ── Credit Check ─────────────────────────────────────────────────
  const checkCreditLimit = (customerId: string, amount: number): 'ok' | 'warning' | 'exceeded' | 'blocked' => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 'ok';
    if (customer.credit_limit === 0) return 'ok'; // 0 = unlimited
    const newBalance = customer.balance + amount;
    const ratio = newBalance / customer.credit_limit;
    if (customer.status === 'blocked') return 'blocked';
    if (newBalance > customer.credit_limit) {
      if (customer.credit_limit_behavior === 'block') return 'blocked';
      return 'exceeded';
    }
    if (ratio >= 0.85) return 'warning';
    return 'ok';
  };

  // ── Customer CRUD ─────────────────────────────────────────────────
  const addCustomer = (data: Omit<CustomerFull, 'id' | 'created_at' | 'updated_at' | 'code' | 'total_sales' | 'total_paid' | 'total_returns' | 'balance'>): CustomerFull => {
    const newCustomer: CustomerFull = {
      ...data,
      id: `cust-${Date.now()}`,
      code: generateCustomerCode(),
      total_sales: 0,
      total_paid: 0,
      total_returns: 0,
      balance: data.opening_balance ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<CustomerFull>) => {
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
    ));
  };

  const deleteCustomer = (id: string): boolean => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return false;
    // Prevent delete if has transactions
    if (customer.total_sales > 0 || customer.total_paid > 0) return false;
    setCustomers(prev => prev.filter(c => c.id !== id));
    return true;
  };

  const archiveCustomer = (id: string) => {
    updateCustomer(id, { status: 'inactive', is_active: false });
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  // ── Supplier CRUD ─────────────────────────────────────────────────
  const addSupplier = (data: Omit<SupplierFull, 'id' | 'created_at' | 'updated_at' | 'code' | 'total_purchases' | 'total_paid' | 'total_returns' | 'balance'>): SupplierFull => {
    const newSupplier: SupplierFull = {
      ...data,
      id: `supp-${Date.now()}`,
      code: generateSupplierCode(),
      total_purchases: 0,
      total_paid: 0,
      total_returns: 0,
      balance: data.opening_balance ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, data: Partial<SupplierFull>) => {
    setSuppliers(prev => prev.map(s =>
      s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
    ));
  };

  const archiveSupplier = (id: string) => {
    updateSupplier(id, { status: 'inactive', is_active: false });
  };

  const getSupplier = (id: string) => suppliers.find(s => s.id === id);

  // ── Groups ────────────────────────────────────────────────────────
  const addGroup = (data: Omit<CustomerGroup, 'id' | 'created_at'>) => {
    setGroups(prev => [...prev, {
      ...data,
      id: `grp-${Date.now()}`,
      created_at: new Date().toISOString(),
    }]);
  };

  // ── Contacts ──────────────────────────────────────────────────────
  const addContact = (data: Omit<Contact, 'id' | 'created_at'>) => {
    setContacts(prev => [...prev, {
      ...data,
      id: `cont-${Date.now()}`,
      created_at: new Date().toISOString(),
    }]);
  };

  const updateContact = (id: string, data: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const getContactsFor = (entityType: 'customer' | 'supplier', entityId: string) =>
    contacts.filter(c => c.entity_type === entityType && c.entity_id === entityId);

  return (
    <CustomersContext.Provider value={{
      customers, addCustomer, updateCustomer, deleteCustomer, archiveCustomer, getCustomer,
      suppliers, addSupplier, updateSupplier, archiveSupplier, getSupplier,
      groups, addGroup,
      contacts, addContact, updateContact, deleteContact, getContactsFor,
      checkCreditLimit, generateCustomerCode, generateSupplierCode,
    }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomers must be used within CustomersProvider');
  return ctx;
}
