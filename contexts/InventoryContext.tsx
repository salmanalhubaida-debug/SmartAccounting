// Inventory Context — State management for Products, Warehouses, Stock
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  ProductFull, ProductCategory, Brand, Warehouse, StockLevel,
  StockMovement, StockTransfer, StockAdjustment, InventoryCount,
  ProductVariant, LowStockAlert, UnitOfMeasure, MovementType, DEFAULT_UNITS,
} from '../types/inventory';
import {
  DEMO_PRODUCTS, DEMO_CATEGORIES, DEMO_BRANDS, DEMO_WAREHOUSES,
  DEMO_STOCK_LEVELS, DEMO_MOVEMENTS, DEMO_TRANSFERS, DEMO_ADJUSTMENTS,
  DEMO_VARIANTS, computeLowStockAlerts, getFlatCategories,
} from '../services/inventoryData';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface InventoryContextType {
  // Products
  products: ProductFull[];
  addProduct: (data: Omit<ProductFull, 'id' | 'created_at' | 'updated_at' | 'current_stock' | 'stock_value'>) => ProductFull;
  updateProduct: (id: string, data: Partial<ProductFull>) => void;
  archiveProduct: (id: string) => void;
  getProduct: (id: string) => ProductFull | undefined;

  // Variants
  variants: ProductVariant[];
  addVariant: (data: Omit<ProductVariant, 'id' | 'created_at'>) => void;
  updateVariant: (id: string, data: Partial<ProductVariant>) => void;
  deleteVariant: (id: string) => void;
  getVariantsForProduct: (productId: string) => ProductVariant[];

  // Categories
  categories: ProductCategory[];
  flatCategories: ProductCategory[];
  addCategory: (data: Omit<ProductCategory, 'id' | 'created_at' | 'children'>) => void;
  updateCategory: (id: string, data: Partial<ProductCategory>) => void;

  // Brands
  brands: Brand[];
  addBrand: (data: Omit<Brand, 'id' | 'created_at'>) => void;
  updateBrand: (id: string, data: Partial<Brand>) => void;

  // Units
  units: UnitOfMeasure[];
  addUnit: (data: Omit<UnitOfMeasure, 'id' | 'created_at'>) => void;

  // Warehouses
  warehouses: Warehouse[];
  addWarehouse: (data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) => void;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => void;
  getWarehouse: (id: string) => Warehouse | undefined;

  // Stock
  stockLevels: StockLevel[];
  getProductStock: (productId: string) => { total: number; available: number; byWarehouse: StockLevel[] };
  getWarehouseStock: (warehouseId: string) => StockLevel[];

  // Movements
  movements: StockMovement[];
  recordMovement: (data: Omit<StockMovement, 'id' | 'created_at' | 'qty_before' | 'qty_after'>) => StockMovement;
  getMovementsForProduct: (productId: string) => StockMovement[];
  getMovementsForWarehouse: (warehouseId: string) => StockMovement[];

  // Transfers
  transfers: StockTransfer[];
  createTransfer: (data: Omit<StockTransfer, 'id' | 'created_at' | 'transfer_number'>) => StockTransfer;
  updateTransferStatus: (id: string, status: StockTransfer['status'], userId: string) => void;
  getTransfer: (id: string) => StockTransfer | undefined;

  // Adjustments
  adjustments: StockAdjustment[];
  createAdjustment: (data: Omit<StockAdjustment, 'id' | 'created_at' | 'adjustment_number'>) => StockAdjustment;
  approveAdjustment: (id: string, userId: string) => void;
  applyAdjustment: (id: string, userId: string) => void;
  rejectAdjustment: (id: string) => void;

  // Inventory Count
  counts: InventoryCount[];
  createCount: (data: Omit<InventoryCount, 'id' | 'created_at' | 'count_number'>) => InventoryCount;
  updateCountItem: (countId: string, itemId: string, countedQty: number) => void;
  completeCount: (countId: string, userId: string) => void;

  // Alerts
  lowStockAlerts: LowStockAlert[];

  // Helpers
  generateSKU: () => string;
  totalInventoryValue: number;
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductFull[]>(DEMO_PRODUCTS);
  const [variants, setVariants] = useState<ProductVariant[]>(DEMO_VARIANTS);
  const [categories, setCategories] = useState<ProductCategory[]>(DEMO_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(DEMO_BRANDS);
  const [units] = useState<UnitOfMeasure[]>(DEFAULT_UNITS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(DEMO_WAREHOUSES);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(DEMO_STOCK_LEVELS);
  const [movements, setMovements] = useState<StockMovement[]>(DEMO_MOVEMENTS);
  const [transfers, setTransfers] = useState<StockTransfer[]>(DEMO_TRANSFERS);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(DEMO_ADJUSTMENTS);
  const [counts, setCounts] = useState<InventoryCount[]>([]);

  // ── DERIVED ──────────────────────────────────────────────────────
  const flatCategories = getFlatCategories();
  const lowStockAlerts = computeLowStockAlerts();
  const totalInventoryValue = stockLevels.reduce((sum, s) => sum + s.stock_value, 0);

  // ── SKU GENERATOR ────────────────────────────────────────────────
  const generateSKU = useCallback(() => {
    const prefix = 'PRD';
    const num = products.length + 1;
    return `${prefix}-${String(num).padStart(4, '0')}`;
  }, [products.length]);

  // ── SEQUENCE GENERATORS ──────────────────────────────────────────
  const nextTransferNumber = () => {
    const max = transfers.reduce((n, t) => {
      const num = parseInt(t.transfer_number.split('-').pop() ?? '0', 10);
      return num > n ? num : n;
    }, 0);
    return `TR-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`;
  };

  const nextAdjustmentNumber = () => {
    const max = adjustments.reduce((n, a) => {
      const num = parseInt(a.adjustment_number.split('-').pop() ?? '0', 10);
      return num > n ? num : n;
    }, 0);
    return `ADJ-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`;
  };

  const nextCountNumber = () => {
    const max = counts.reduce((n, c) => {
      const num = parseInt(c.count_number.split('-').pop() ?? '0', 10);
      return num > n ? num : n;
    }, 0);
    return `CNT-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`;
  };

  // ── PRODUCTS ─────────────────────────────────────────────────────
  const addProduct = useCallback((data: Omit<ProductFull, 'id' | 'created_at' | 'updated_at' | 'current_stock' | 'stock_value'>): ProductFull => {
    const newProduct: ProductFull = {
      ...data, id: `prod-${Date.now()}`,
      current_stock: 0, stock_value: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<ProductFull>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p));
  }, []);

  const archiveProduct = useCallback((id: string) => {
    updateProduct(id, { status: 'archived', is_active: false });
  }, [updateProduct]);

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);

  // ── VARIANTS ─────────────────────────────────────────────────────
  const addVariant = useCallback((data: Omit<ProductVariant, 'id' | 'created_at'>) => {
    setVariants(prev => [...prev, { ...data, id: `var-${Date.now()}`, created_at: new Date().toISOString() }]);
    setProducts(prev => prev.map(p => p.id === data.product_id ? { ...p, has_variants: true } : p));
  }, []);

  const updateVariant = useCallback((id: string, data: Partial<ProductVariant>) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  }, []);

  const deleteVariant = useCallback((id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  }, []);

  const getVariantsForProduct = useCallback((productId: string) => variants.filter(v => v.product_id === productId), [variants]);

  // ── CATEGORIES ───────────────────────────────────────────────────
  const addCategory = useCallback((data: Omit<ProductCategory, 'id' | 'created_at' | 'children'>) => {
    const newCat: ProductCategory = { ...data, id: `cat-${Date.now()}`, created_at: new Date().toISOString() };
    if (data.parent_id) {
      setCategories(prev => prev.map(c =>
        c.id === data.parent_id ? { ...c, children: [...(c.children ?? []), newCat] } : c
      ));
    } else {
      setCategories(prev => [...prev, newCat]);
    }
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<ProductCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : {
      ...c,
      children: c.children?.map(ch => ch.id === id ? { ...ch, ...data } : ch),
    }));
  }, []);

  // ── BRANDS ───────────────────────────────────────────────────────
  const addBrand = useCallback((data: Omit<Brand, 'id' | 'created_at'>) => {
    setBrands(prev => [...prev, { ...data, id: `brand-${Date.now()}`, created_at: new Date().toISOString() }]);
  }, []);

  const updateBrand = useCallback((id: string, data: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  // ── UNITS ────────────────────────────────────────────────────────
  const addUnit = useCallback(() => {}, []); // placeholder — units managed separately

  // ── WAREHOUSES ───────────────────────────────────────────────────
  const addWarehouse = useCallback((data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) => {
    setWarehouses(prev => [...prev, { ...data, id: `wh-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
  }, []);

  const updateWarehouse = useCallback((id: string, data: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data, updated_at: new Date().toISOString() } : w));
  }, []);

  const getWarehouse = useCallback((id: string) => warehouses.find(w => w.id === id), [warehouses]);

  // ── STOCK ────────────────────────────────────────────────────────
  const getProductStock = useCallback((productId: string) => {
    const byWarehouse = stockLevels.filter(s => s.product_id === productId);
    const total = byWarehouse.reduce((sum, s) => sum + s.quantity, 0);
    const available = byWarehouse.reduce((sum, s) => sum + s.available_quantity, 0);
    return { total, available, byWarehouse };
  }, [stockLevels]);

  const getWarehouseStock = useCallback((warehouseId: string) =>
    stockLevels.filter(s => s.warehouse_id === warehouseId), [stockLevels]);

  // ── MOVEMENTS ────────────────────────────────────────────────────
  const recordMovement = useCallback((data: Omit<StockMovement, 'id' | 'created_at' | 'qty_before' | 'qty_after'>): StockMovement => {
    // Get current stock level
    const existing = stockLevels.find(s => s.product_id === data.product_id && s.warehouse_id === data.warehouse_id);
    const qtyBefore = existing?.quantity ?? 0;

    const inTypes: MovementType[] = ['purchase', 'sale_return', 'transfer_in', 'adjustment_in', 'opening_balance', 'count_adjustment'];
    const isIn = inTypes.includes(data.type);
    const qtyAfter = isIn ? qtyBefore + data.quantity : Math.max(0, qtyBefore - data.quantity);

    const newMovement: StockMovement = {
      ...data, id: `mv-${Date.now()}`,
      qty_before: qtyBefore, qty_after: qtyAfter,
      created_at: new Date().toISOString(),
    };
    setMovements(prev => [newMovement, ...prev]);

    // Update stock level
    if (existing) {
      setStockLevels(prev => prev.map(s =>
        s.product_id === data.product_id && s.warehouse_id === data.warehouse_id
          ? { ...s, quantity: qtyAfter, available_quantity: Math.max(0, qtyAfter - s.reserved_quantity), stock_value: qtyAfter * s.avg_cost, last_updated: new Date().toISOString() }
          : s
      ));
    } else {
      // Create new stock level
      setStockLevels(prev => [...prev, {
        id: `sl-${Date.now()}`,
        company_id: data.company_id, product_id: data.product_id, warehouse_id: data.warehouse_id,
        quantity: qtyAfter, reserved_quantity: 0, incoming_quantity: 0,
        avg_cost: data.unit_cost, available_quantity: qtyAfter,
        stock_value: qtyAfter * data.unit_cost, last_updated: new Date().toISOString(),
      }]);
    }

    // Update product current_stock
    const allLevels = stockLevels.filter(s => s.product_id === data.product_id);
    const newTotal = allLevels.reduce((sum, s) =>
      s.warehouse_id === data.warehouse_id ? sum + qtyAfter : sum + s.quantity, 0);
    setProducts(prev => prev.map(p =>
      p.id === data.product_id ? { ...p, current_stock: newTotal, stock_value: newTotal * data.unit_cost } : p
    ));

    return newMovement;
  }, [stockLevels]);

  const getMovementsForProduct = useCallback((productId: string) =>
    movements.filter(m => m.product_id === productId).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [movements]);

  const getMovementsForWarehouse = useCallback((warehouseId: string) =>
    movements.filter(m => m.warehouse_id === warehouseId), [movements]);

  // ── TRANSFERS ────────────────────────────────────────────────────
  const createTransfer = useCallback((data: Omit<StockTransfer, 'id' | 'created_at' | 'transfer_number'>): StockTransfer => {
    const newTransfer: StockTransfer = {
      ...data, id: `tr-${Date.now()}`, transfer_number: nextTransferNumber(),
      created_at: new Date().toISOString(),
    };
    setTransfers(prev => [newTransfer, ...prev]);
    return newTransfer;
  }, [transfers]);

  const updateTransferStatus = useCallback((id: string, status: StockTransfer['status'], userId: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updates: Partial<StockTransfer> = { status };
      if (status === 'approved') { updates.approved_by = userId; updates.approved_at = new Date().toISOString(); }
      if (status === 'completed') { updates.completed_at = new Date().toISOString(); }
      return { ...t, ...updates };
    }));
  }, []);

  const getTransfer = useCallback((id: string) => transfers.find(t => t.id === id), [transfers]);

  // ── ADJUSTMENTS ──────────────────────────────────────────────────
  const createAdjustment = useCallback((data: Omit<StockAdjustment, 'id' | 'created_at' | 'adjustment_number'>): StockAdjustment => {
    const newAdj: StockAdjustment = {
      ...data, id: `adj-${Date.now()}`, adjustment_number: nextAdjustmentNumber(),
      created_at: new Date().toISOString(),
    };
    setAdjustments(prev => [newAdj, ...prev]);
    return newAdj;
  }, [adjustments]);

  const approveAdjustment = useCallback((id: string, userId: string) => {
    setAdjustments(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'approved', approved_by: userId, approved_at: new Date().toISOString() } : a
    ));
  }, []);

  const applyAdjustment = useCallback((id: string, userId: string) => {
    const adj = adjustments.find(a => a.id === id);
    if (!adj) return;
    // Record movements for each item
    adj.items.forEach(item => {
      const type = item.difference > 0 ? 'adjustment_in' : 'adjustment_out';
      recordMovement({
        company_id: adj.company_id, product_id: item.product_id,
        warehouse_id: adj.warehouse_id, type,
        quantity: Math.abs(item.difference), unit_id: 'unit-001',
        unit_cost: item.unit_cost, total_cost: Math.abs(item.cost_impact),
        reference_type: 'adjustment', reference_id: id,
        notes: adj.reason, created_by: userId,
      });
    });
    setAdjustments(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'applied' } : a
    ));
  }, [adjustments, recordMovement]);

  const rejectAdjustment = useCallback((id: string) => {
    setAdjustments(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  }, []);

  // ── INVENTORY COUNT ──────────────────────────────────────────────
  const createCount = useCallback((data: Omit<InventoryCount, 'id' | 'created_at' | 'count_number'>): InventoryCount => {
    const newCount: InventoryCount = {
      ...data, id: `cnt-${Date.now()}`, count_number: nextCountNumber(),
      created_at: new Date().toISOString(),
    };
    setCounts(prev => [newCount, ...prev]);
    return newCount;
  }, [counts]);

  const updateCountItem = useCallback((countId: string, itemId: string, countedQty: number) => {
    setCounts(prev => prev.map(c => {
      if (c.id !== countId) return c;
      return {
        ...c,
        items: c.items.map(item => {
          if (item.id !== itemId) return item;
          const diff = countedQty - item.system_quantity;
          return { ...item, counted_quantity: countedQty, difference: diff, is_counted: true };
        }),
      };
    }));
  }, []);

  const completeCount = useCallback((countId: string, userId: string) => {
    setCounts(prev => prev.map(c =>
      c.id === countId ? { ...c, status: 'completed', approved_by: userId, completed_at: new Date().toISOString() } : c
    ));
  }, []);

  return (
    <InventoryContext.Provider value={{
      products, addProduct, updateProduct, archiveProduct, getProduct,
      variants, addVariant, updateVariant, deleteVariant, getVariantsForProduct,
      categories, flatCategories, addCategory, updateCategory,
      brands, addBrand, updateBrand,
      units, addUnit,
      warehouses, addWarehouse, updateWarehouse, getWarehouse,
      stockLevels, getProductStock, getWarehouseStock,
      movements, recordMovement, getMovementsForProduct, getMovementsForWarehouse,
      transfers, createTransfer, updateTransferStatus, getTransfer,
      adjustments, createAdjustment, approveAdjustment, applyAdjustment, rejectAdjustment,
      counts, createCount, updateCountItem, completeCount,
      lowStockAlerts, generateSKU, totalInventoryValue,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
