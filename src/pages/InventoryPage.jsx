import { useMemo, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { currencyFormat } from "../utils/currencyFormat.js";

const INITIAL_INVENTORY = [
  {
    id: "INV-1001",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=iPhone+14",
    name: "iPhone 14 Pro Max",
    category: "Mobile Phones",
    brand: "Apple",
    sku: "APL-IP14PM-256-BLK",
    purchasePrice: 320000,
    sellingPrice: 385000,
    currentStock: 8,
    minStockLevel: 4,
    monthlySales: 21,
    lastUpdated: "2026-03-10",
  },
  {
    id: "INV-1002",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Galaxy+A55",
    name: "Samsung Galaxy A55",
    category: "Mobile Phones",
    brand: "Samsung",
    sku: "SMS-A55-128-BLU",
    purchasePrice: 108000,
    sellingPrice: 124000,
    currentStock: 15,
    minStockLevel: 6,
    monthlySales: 18,
    lastUpdated: "2026-03-10",
  },
  {
    id: "INV-1003",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Redmi+13",
    name: "Redmi Note 13",
    category: "Mobile Phones",
    brand: "Xiaomi",
    sku: "XIA-RN13-256-BLK",
    purchasePrice: 69000,
    sellingPrice: 79900,
    currentStock: 11,
    minStockLevel: 5,
    monthlySales: 16,
    lastUpdated: "2026-03-09",
  },
  {
    id: "INV-1004",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Back+Cover",
    name: "Silicon Back Cover",
    category: "Accessories",
    brand: "Baseus",
    sku: "BAS-COV-SIL-IPH",
    purchasePrice: 650,
    sellingPrice: 1800,
    currentStock: 42,
    minStockLevel: 18,
    monthlySales: 66,
    lastUpdated: "2026-03-09",
  },
  {
    id: "INV-1005",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Charger",
    name: "Anker 30W Fast Charger",
    category: "Accessories",
    brand: "Anker",
    sku: "ANK-CHR-30W-WHT",
    purchasePrice: 6200,
    sellingPrice: 9500,
    currentStock: 3,
    minStockLevel: 8,
    monthlySales: 23,
    lastUpdated: "2026-03-10",
  },
  {
    id: "INV-1006",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Type-C+Cable",
    name: "Type-C Cable 1m",
    category: "Accessories",
    brand: "Ugreen",
    sku: "UGR-CBL-TYPEC-1M",
    purchasePrice: 850,
    sellingPrice: 1800,
    currentStock: 0,
    minStockLevel: 12,
    monthlySales: 31,
    lastUpdated: "2026-03-08",
  },
  {
    id: "INV-1007",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Tempered",
    name: "Tempered Glass iPhone",
    category: "Accessories",
    brand: "Gorilla",
    sku: "GOR-TGL-IPH14",
    purchasePrice: 380,
    sellingPrice: 1200,
    currentStock: 10,
    minStockLevel: 10,
    monthlySales: 44,
    lastUpdated: "2026-03-10",
  },
  {
    id: "INV-1008",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Headphone",
    name: "Sony WH-CH520",
    category: "Electronic Items",
    brand: "Sony",
    sku: "SNY-HP-CH520-BLK",
    purchasePrice: 14900,
    sellingPrice: 21900,
    currentStock: 16,
    minStockLevel: 6,
    monthlySales: 9,
    lastUpdated: "2026-03-07",
  },
  {
    id: "INV-1009",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Speaker",
    name: "JBL Flip 6",
    category: "Electronic Items",
    brand: "JBL",
    sku: "JBL-SPK-FLIP6",
    purchasePrice: 28900,
    sellingPrice: 38900,
    currentStock: 5,
    minStockLevel: 5,
    monthlySales: 6,
    lastUpdated: "2026-03-10",
  },
  {
    id: "INV-1010",
    image: "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Subwoofer",
    name: "Pioneer TS-WX130EA",
    category: "Electronic Items",
    brand: "Pioneer",
    sku: "PNR-SUB-130EA",
    purchasePrice: 35000,
    sellingPrice: 45500,
    currentStock: 2,
    minStockLevel: 4,
    monthlySales: 3,
    lastUpdated: "2026-03-09",
  },
];

const INITIAL_MOVEMENTS = [
  {
    id: "MOV-001",
    date: "2026-03-10 11:40",
    productId: "INV-1005",
    productName: "Anker 30W Fast Charger",
    qtyAdded: 12,
    qtyRemoved: 0,
    reason: "purchase",
    user: "Owner",
  },
  {
    id: "MOV-002",
    date: "2026-03-10 10:12",
    productId: "INV-1006",
    productName: "Type-C Cable 1m",
    qtyAdded: 0,
    qtyRemoved: 7,
    reason: "sales",
    user: "Cashier 01",
  },
  {
    id: "MOV-003",
    date: "2026-03-09 17:30",
    productId: "INV-1001",
    productName: "iPhone 14 Pro Max",
    qtyAdded: 0,
    qtyRemoved: 1,
    reason: "sales",
    user: "Cashier 02",
  },
  {
    id: "MOV-004",
    date: "2026-03-09 14:10",
    productId: "INV-1004",
    productName: "Silicon Back Cover",
    qtyAdded: 20,
    qtyRemoved: 0,
    reason: "purchase",
    user: "Owner",
  },
  {
    id: "MOV-005",
    date: "2026-03-08 12:45",
    productId: "INV-1006",
    productName: "Type-C Cable 1m",
    qtyAdded: 0,
    qtyRemoved: 14,
    reason: "damage",
    user: "Store Keeper",
  },
];

const STOCK_STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "In Stock", value: "in" },
  { label: "Low Stock", value: "low" },
  { label: "Out of Stock", value: "out" },
];

const ADJUSTMENT_REASONS = [
  "purchase",
  "damage",
  "correction",
  "sales",
  "return",
  "transfer",
];

const DEFAULT_EDIT_FORM = {
  name: "",
  category: "",
  brand: "",
  sku: "",
  purchasePrice: "",
  sellingPrice: "",
  minStockLevel: "",
};

const DEFAULT_RESTOCK_FORM = {
  productId: "",
  supplierName: "",
  purchaseQuantity: "",
  purchasePrice: "",
  invoiceNumber: "",
  user: "Owner",
};

const toDateLabel = () => new Date().toISOString().slice(0, 10);

const toDateTimeLabel = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const getStockStatus = (item) => {
  if (item.currentStock <= 0) return "Out of Stock";
  if (item.currentStock <= item.minStockLevel) return "Low Stock";
  return "In Stock";
};

const getStockStatusClass = (status) => {
  if (status === "In Stock") return "bg-emerald-100 text-emerald-700";
  if (status === "Low Stock") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
};

const getRestockRecommendation = (item) => {
  if (item.currentStock <= 0) {
    return item.minStockLevel + 5;
  }

  return Math.max(item.minStockLevel - item.currentStock + 3, 1);
};

function InventoryPage() {
  const importInputRef = useRef(null);

  const [inventoryItems, setInventoryItems] = useState(INITIAL_INVENTORY);
  const [movementHistory, setMovementHistory] = useState(INITIAL_MOVEMENTS);

  const [searchName, setSearchName] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [adjustItemId, setAdjustItemId] = useState(null);
  const [adjustType, setAdjustType] = useState("increase");
  const [adjustQuantity, setAdjustQuantity] = useState("1");
  const [adjustReason, setAdjustReason] = useState("correction");
  const [adjustUser, setAdjustUser] = useState("Owner");

  const [isRestockOpen, setRestockOpen] = useState(false);
  const [restockForm, setRestockForm] = useState(DEFAULT_RESTOCK_FORM);

  const [editItemId, setEditItemId] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);

  const [detailsItemId, setDetailsItemId] = useState(null);

  const [bulkMode, setBulkMode] = useState("increase");
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkReason, setBulkReason] = useState("correction");

  const debouncedName = useDebounce(searchName, 250);
  const debouncedBarcode = useDebounce(searchBarcode, 250);

  const categories = useMemo(
    () =>
      Array.from(new Set(inventoryItems.map((item) => item.category))).sort(),
    [inventoryItems],
  );

  const brands = useMemo(
    () => Array.from(new Set(inventoryItems.map((item) => item.brand))).sort(),
    [inventoryItems],
  );

  const overview = useMemo(() => {
    const totalProducts = inventoryItems.length;
    const totalStockQuantity = inventoryItems.reduce(
      (sum, item) => sum + item.currentStock,
      0,
    );
    const lowStockItems = inventoryItems.filter(
      (item) => getStockStatus(item) === "Low Stock",
    ).length;
    const outOfStockItems = inventoryItems.filter(
      (item) => getStockStatus(item) === "Out of Stock",
    ).length;
    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.currentStock * item.purchasePrice,
      0,
    );

    return {
      totalProducts,
      totalStockQuantity,
      lowStockItems,
      outOfStockItems,
      inventoryValue,
    };
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    const nameTerm = debouncedName.trim().toLowerCase();
    const barcodeTerm = debouncedBarcode.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      const status = getStockStatus(item);

      const matchesName =
        nameTerm.length === 0 || item.name.toLowerCase().includes(nameTerm);
      const matchesBarcode =
        barcodeTerm.length === 0 ||
        item.sku.toLowerCase().includes(barcodeTerm);
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesBrand = brandFilter === "all" || item.brand === brandFilter;
      const matchesStatus =
        stockStatusFilter === "all" ||
        (stockStatusFilter === "in" && status === "In Stock") ||
        (stockStatusFilter === "low" && status === "Low Stock") ||
        (stockStatusFilter === "out" && status === "Out of Stock");
      const matchesLowStockOnly = !lowStockOnly || status === "Low Stock";

      return (
        matchesName &&
        matchesBarcode &&
        matchesCategory &&
        matchesBrand &&
        matchesStatus &&
        matchesLowStockOnly
      );
    });
  }, [
    inventoryItems,
    debouncedName,
    debouncedBarcode,
    categoryFilter,
    brandFilter,
    stockStatusFilter,
    lowStockOnly,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const allVisibleSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selectedIds.includes(item.id));

  const lowStockItemsList = useMemo(
    () =>
      inventoryItems
        .filter((item) =>
          ["Low Stock", "Out of Stock"].includes(getStockStatus(item)),
        )
        .sort((a, b) => a.currentStock - b.currentStock),
    [inventoryItems],
  );

  const fastMovingItems = useMemo(
    () =>
      [...inventoryItems]
        .sort((a, b) => b.monthlySales - a.monthlySales)
        .slice(0, 5),
    [inventoryItems],
  );

  const slowMovingItems = useMemo(
    () =>
      [...inventoryItems]
        .sort((a, b) => a.monthlySales - b.monthlySales)
        .slice(0, 5),
    [inventoryItems],
  );

  const detailsItem =
    inventoryItems.find((item) => item.id === detailsItemId) || null;

  const detailsMovements = useMemo(
    () =>
      movementHistory
        .filter((movement) => movement.productId === detailsItemId)
        .slice(0, 12),
    [movementHistory, detailsItemId],
  );

  const setPageToFirst = () => setCurrentPage(1);

  const createMovementEntry = ({
    product,
    qtyAdded,
    qtyRemoved,
    reason,
    user,
  }) => ({
    id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: toDateTimeLabel(),
    productId: product.id,
    productName: product.name,
    qtyAdded,
    qtyRemoved,
    reason,
    user,
  });

  const onToggleSelect = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const onToggleSelectAllVisible = () => {
    const visibleIds = paginatedItems.map((item) => item.id);

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const onOpenAdjust = (item) => {
    setAdjustItemId(item.id);
    setAdjustType("increase");
    setAdjustQuantity("1");
    setAdjustReason("correction");
    setAdjustUser("Owner");
  };

  const onSubmitAdjustment = (event) => {
    event.preventDefault();

    const product = inventoryItems.find((item) => item.id === adjustItemId);
    if (!product) {
      setFeedbackMessage("Stock adjustment product not found.");
      return;
    }

    const rawQuantity = Number(adjustQuantity);
    if (!Number.isFinite(rawQuantity) || rawQuantity < 0) {
      setFeedbackMessage("Enter a valid stock quantity.");
      return;
    }

    if (adjustType !== "correction" && rawQuantity === 0) {
      setFeedbackMessage("Quantity must be greater than zero.");
      return;
    }

    let qtyAdded = 0;
    let qtyRemoved = 0;
    let nextStock = product.currentStock;

    if (adjustType === "increase") {
      qtyAdded = Math.round(rawQuantity);
      nextStock = product.currentStock + qtyAdded;
    }

    if (adjustType === "decrease") {
      qtyRemoved = Math.min(product.currentStock, Math.round(rawQuantity));
      nextStock = product.currentStock - qtyRemoved;
    }

    if (adjustType === "correction") {
      const targetStock = Math.max(0, Math.round(rawQuantity));
      const diff = targetStock - product.currentStock;
      nextStock = targetStock;
      qtyAdded = diff > 0 ? diff : 0;
      qtyRemoved = diff < 0 ? Math.abs(diff) : 0;
    }

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, currentStock: nextStock, lastUpdated: toDateLabel() }
          : item,
      ),
    );

    setMovementHistory((prev) => [
      createMovementEntry({
        product,
        qtyAdded,
        qtyRemoved,
        reason: adjustReason,
        user: adjustUser || "Owner",
      }),
      ...prev,
    ]);

    setFeedbackMessage("Stock adjusted successfully.");
    setAdjustItemId(null);
  };

  const onOpenEdit = (item) => {
    setEditItemId(item.id);
    setEditForm({
      name: item.name,
      category: item.category,
      brand: item.brand,
      sku: item.sku,
      purchasePrice: String(item.purchasePrice),
      sellingPrice: String(item.sellingPrice),
      minStockLevel: String(item.minStockLevel),
    });
  };

  const onSaveEdit = (event) => {
    event.preventDefault();

    const purchasePrice = Number(editForm.purchasePrice);
    const sellingPrice = Number(editForm.sellingPrice);
    const minStockLevel = Number(editForm.minStockLevel);

    if (
      !editForm.name.trim() ||
      !editForm.sku.trim() ||
      !Number.isFinite(purchasePrice) ||
      !Number.isFinite(sellingPrice) ||
      !Number.isFinite(minStockLevel)
    ) {
      setFeedbackMessage("Please enter valid product details in edit form.");
      return;
    }

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === editItemId
          ? {
              ...item,
              name: editForm.name.trim(),
              category: editForm.category.trim(),
              brand: editForm.brand.trim(),
              sku: editForm.sku.trim(),
              purchasePrice,
              sellingPrice,
              minStockLevel: Math.max(0, minStockLevel),
              lastUpdated: toDateLabel(),
            }
          : item,
      ),
    );

    setFeedbackMessage("Inventory item updated.");
    setEditItemId(null);
    setEditForm(DEFAULT_EDIT_FORM);
  };

  const onDeleteSelected = () => {
    if (selectedIds.length === 0) {
      setFeedbackMessage("Select items before bulk delete.");
      return;
    }

    const selectedSet = new Set(selectedIds);

    setInventoryItems((prev) =>
      prev.filter((item) => !selectedSet.has(item.id)),
    );
    setMovementHistory((prev) =>
      prev.filter((movement) => !selectedSet.has(movement.productId)),
    );
    setSelectedIds([]);

    if (detailsItemId && selectedSet.has(detailsItemId)) {
      setDetailsItemId(null);
    }

    setFeedbackMessage("Selected inventory items deleted.");
  };

  const onOpenRestock = () => {
    setRestockForm({
      ...DEFAULT_RESTOCK_FORM,
      productId: inventoryItems[0]?.id || "",
    });
    setRestockOpen(true);
  };

  const onRestockFormChange = (event) => {
    const { name, value } = event.target;
    setRestockForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitRestock = (event) => {
    event.preventDefault();

    const product = inventoryItems.find(
      (item) => item.id === restockForm.productId,
    );
    if (!product) {
      setFeedbackMessage("Select a product for restock.");
      return;
    }

    const quantity = Number(restockForm.purchaseQuantity);
    const purchasePrice = Number(restockForm.purchasePrice);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedbackMessage("Enter a valid purchase quantity.");
      return;
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      setFeedbackMessage("Enter a valid purchase price.");
      return;
    }

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              currentStock: item.currentStock + Math.round(quantity),
              purchasePrice,
              lastUpdated: toDateLabel(),
            }
          : item,
      ),
    );

    setMovementHistory((prev) => [
      createMovementEntry({
        product,
        qtyAdded: Math.round(quantity),
        qtyRemoved: 0,
        reason: `purchase (${restockForm.supplierName || "supplier"})`,
        user: restockForm.user || "Owner",
      }),
      ...prev,
    ]);

    setFeedbackMessage(
      `Restock added for ${product.name}. Invoice: ${restockForm.invoiceNumber || "N/A"}`,
    );
    setRestockOpen(false);
    setRestockForm(DEFAULT_RESTOCK_FORM);
  };

  const onBulkStockUpdate = () => {
    const qty = Number(bulkQuantity);

    if (selectedIds.length === 0) {
      setFeedbackMessage("Select items before bulk stock update.");
      return;
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      setFeedbackMessage("Enter a valid bulk stock quantity.");
      return;
    }

    const selectedSet = new Set(selectedIds);

    const movementEntries = [];

    setInventoryItems((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;

        const roundedQty = Math.round(qty);
        const qtyAdded = bulkMode === "increase" ? roundedQty : 0;
        const qtyRemoved =
          bulkMode === "decrease" ? Math.min(item.currentStock, roundedQty) : 0;
        const nextStock =
          bulkMode === "increase"
            ? item.currentStock + roundedQty
            : item.currentStock - qtyRemoved;

        movementEntries.push(
          createMovementEntry({
            product: item,
            qtyAdded,
            qtyRemoved,
            reason: `bulk-${bulkReason}`,
            user: "Owner",
          }),
        );

        return {
          ...item,
          currentStock: nextStock,
          lastUpdated: toDateLabel(),
        };
      }),
    );

    if (movementEntries.length > 0) {
      setMovementHistory((prev) => [...movementEntries, ...prev]);
    }

    setBulkQuantity("");
    setFeedbackMessage("Bulk stock update completed.");
  };

  const onExportInventory = () => {
    const rows =
      selectedIds.length > 0
        ? inventoryItems.filter((item) => selectedIds.includes(item.id))
        : filteredItems;

    if (rows.length === 0) {
      setFeedbackMessage("No inventory rows available to export.");
      return;
    }

    const headers = [
      "name",
      "category",
      "brand",
      "sku",
      "purchasePrice",
      "sellingPrice",
      "currentStock",
      "minStockLevel",
      "stockStatus",
      "lastUpdated",
      "monthlySales",
    ];

    const csvRows = rows.map((item) =>
      [
        item.name,
        item.category,
        item.brand,
        item.sku,
        item.purchasePrice,
        item.sellingPrice,
        item.currentStock,
        item.minStockLevel,
        getStockStatus(item),
        item.lastUpdated,
        item.monthlySales,
      ].join(","),
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-export.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Inventory list exported to CSV.");
  };

  const onImportInventory = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result || "").trim();
      if (!text) {
        setFeedbackMessage("CSV file is empty.");
        return;
      }

      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        setFeedbackMessage("CSV has no inventory rows to import.");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase());
      const getValue = (values, key) => {
        const index = headers.indexOf(key);
        return index >= 0 ? String(values[index] || "").trim() : "";
      };

      const importedItems = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((value) => value.trim());

        return {
          id: `INV-IMP-${Date.now()}-${index}`,
          image:
            getValue(values, "image") ||
            "https://dummyimage.com/120x120/e2e8f0/0f172a&text=Item",
          name: getValue(values, "name") || `Imported Product ${index + 1}`,
          category: getValue(values, "category") || "Accessories",
          brand: getValue(values, "brand") || "Generic",
          sku: getValue(values, "sku") || `SKU-IMP-${index + 1}`,
          purchasePrice: Number(getValue(values, "purchaseprice") || 0),
          sellingPrice: Number(getValue(values, "sellingprice") || 0),
          currentStock: Number(getValue(values, "currentstock") || 0),
          minStockLevel: Number(getValue(values, "minstocklevel") || 5),
          monthlySales: Number(getValue(values, "monthlysales") || 0),
          lastUpdated: getValue(values, "lastupdated") || toDateLabel(),
        };
      });

      setInventoryItems((prev) => [...importedItems, ...prev]);
      setFeedbackMessage(`${importedItems.length} inventory rows imported.`);
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Inventory Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Monitor inventory health, adjust stock, restock products, and
              control stock movement across your mobile shop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenRestock}
              className="h-10 rounded-lg border border-(--color-border) px-4 text-sm font-medium"
            >
              Add Stock Purchase
            </button>
            <button
              type="button"
              onClick={onExportInventory}
              className="h-10 rounded-lg border border-(--color-border) px-4 text-sm font-medium"
            >
              Export Inventory
            </button>
          </div>
        </div>
      </section>

      {feedbackMessage && (
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-main-text)">
          <div className="flex items-center justify-between gap-3">
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage("")}
              className="text-xs font-medium text-(--color-muted-text) hover:underline"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {overview.totalProducts}
          </p>
        </article>

        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Stock Quantity
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {overview.totalStockQuantity}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-amber-700">
            Low Stock Items
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {overview.lowStockItems}
          </p>
        </article>

        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-rose-700">
            Out of Stock Items
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">
            {overview.outOfStockItems}
          </p>
        </article>

        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-muted-text)">
            Inventory Value
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {currencyFormat(overview.inventoryValue)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Search & Filters
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Product Name
            <input
              value={searchName}
              onChange={(event) => {
                setSearchName(event.target.value);
                setPageToFirst();
              }}
              placeholder="Search name"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Barcode / SKU
            <input
              value={searchBarcode}
              onChange={(event) => {
                setSearchBarcode(event.target.value);
                setPageToFirst();
              }}
              placeholder="Search barcode"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Category
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPageToFirst();
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Brand
            <select
              value={brandFilter}
              onChange={(event) => {
                setBrandFilter(event.target.value);
                setPageToFirst();
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Stock Status
            <select
              value={stockStatusFilter}
              onChange={(event) => {
                setStockStatusFilter(event.target.value);
                setPageToFirst();
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end gap-2 pb-2 text-sm font-medium text-(--color-main-text)">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => {
                setLowStockOnly(event.target.checked);
                setPageToFirst();
              }}
            />
            <span>Filter Low Stock Items</span>
          </label>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4 min-w-0">
          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Bulk Inventory Actions
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
              >
                Import Inventory CSV
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onImportInventory}
              />

              <button
                type="button"
                onClick={onExportInventory}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
              >
                Export Inventory List
              </button>

              <button
                type="button"
                onClick={onDeleteSelected}
                className="h-9 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700"
              >
                Bulk Delete Products
              </button>

              <span className="text-xs text-(--color-muted-text)">
                Selected: {selectedIds.length}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-(--color-border) p-3">
              <p className="text-sm font-medium text-(--color-main-text)">
                Bulk Stock Update
              </p>

              <select
                value={bulkMode}
                onChange={(event) => setBulkMode(event.target.value)}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>

              <input
                value={bulkQuantity}
                onChange={(event) => setBulkQuantity(event.target.value)}
                placeholder="Qty"
                className="h-9 w-24 rounded-lg border border-(--color-border) px-3 text-sm"
              />

              <select
                value={bulkReason}
                onChange={(event) => setBulkReason(event.target.value)}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
              >
                {ADJUSTMENT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onBulkStockUpdate}
                className="h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
              >
                Apply
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-7xl text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    <th className="pb-3 pr-2">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={onToggleSelectAllVisible}
                      />
                    </th>
                    <th className="pb-3">Product Image</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Brand</th>
                    <th className="pb-3">SKU / Barcode</th>
                    <th className="pb-3">Purchase Price</th>
                    <th className="pb-3">Selling Price</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Minimum Stock</th>
                    <th className="pb-3">Stock Status</th>
                    <th className="pb-3">Last Updated</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.map((item) => {
                    const status = getStockStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-3 pr-2 align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => onToggleSelect(item.id)}
                          />
                        </td>

                        <td className="py-3 align-top">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg border border-(--color-border) object-cover"
                          />
                        </td>

                        <td className="py-3 align-top">
                          <button
                            type="button"
                            onClick={() => setDetailsItemId(item.id)}
                            className="text-left font-medium text-(--color-main-text) hover:underline"
                          >
                            {item.name}
                          </button>
                        </td>

                        <td className="py-3 align-top">{item.category}</td>
                        <td className="py-3 align-top">{item.brand}</td>
                        <td className="py-3 align-top font-mono text-xs">
                          {item.sku}
                        </td>
                        <td className="py-3 align-top">
                          {currencyFormat(item.purchasePrice)}
                        </td>
                        <td className="py-3 align-top">
                          {currencyFormat(item.sellingPrice)}
                        </td>
                        <td className="py-3 align-top font-medium">
                          {item.currentStock}
                        </td>
                        <td className="py-3 align-top">{item.minStockLevel}</td>
                        <td className="py-3 align-top">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStockStatusClass(
                                status,
                              )}`}
                            >
                              {status}
                            </span>

                            {status !== "In Stock" && (
                              <p className="text-xs text-(--color-muted-text)">
                                Restock recommended:{" "}
                                {getRestockRecommendation(item)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 align-top">{item.lastUpdated}</td>
                        <td className="py-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenAdjust(item)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              Adjust Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailsItemId(item.id)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenEdit(item)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {paginatedItems.length === 0 && (
              <p className="py-6 text-sm text-(--color-muted-text)">
                No inventory items found for current filters.
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-(--color-muted-text)">
                Showing {filteredItems.length === 0 ? 0 : startIndex + 1} -{" "}
                {Math.min(startIndex + pageSize, filteredItems.length)} of{" "}
                {filteredItems.length}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-(--color-muted-text)">
                  Rows:
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 h-8 rounded-lg border border-(--color-border) px-2 text-sm"
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={20}>20</option>
                  </select>
                </label>

                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="h-8 rounded-lg border border-(--color-border) px-3 text-sm disabled:opacity-40"
                >
                  Prev
                </button>

                <span className="text-sm text-(--color-main-text)">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="h-8 rounded-lg border border-(--color-border) px-3 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Low Stock Alerts
            </h3>
            <div className="mt-3 space-y-2">
              {lowStockItemsList.length === 0 && (
                <p className="text-sm text-(--color-muted-text)">
                  No low stock alerts right now.
                </p>
              )}

              {lowStockItemsList.slice(0, 8).map((item) => {
                const status = getStockStatus(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2"
                  >
                    <p className="text-sm font-medium text-(--color-main-text)">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Stock: {item.currentStock} / Min: {item.minStockLevel}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStockStatusClass(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                      <span className="text-xs text-(--color-muted-text)">
                        Restock {getRestockRecommendation(item)}+
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Inventory Reports
            </h3>

            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Stock Valuation
                </p>
                <p className="mt-1 text-lg font-semibold text-(--color-main-text)">
                  {currencyFormat(overview.inventoryValue)}
                </p>
              </div>

              <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Low Stock Report
                </p>
                <p className="mt-1 text-lg font-semibold text-amber-700">
                  {overview.lowStockItems + overview.outOfStockItems} items need
                  attention
                </p>
              </div>

              <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Fast Moving Items
                </p>
                <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                  {fastMovingItems.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      {item.name} • {item.monthlySales} sold
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Slow Moving Items
                </p>
                <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                  {slowMovingItems.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      {item.name} • {item.monthlySales} sold
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Stock Movement History
        </h3>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-205 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-3">Date</th>
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Quantity Added</th>
                <th className="pb-3">Quantity Removed</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">User</th>
              </tr>
            </thead>

            <tbody>
              {movementHistory.slice(0, 20).map((movement) => (
                <tr
                  key={movement.id}
                  className="border-t border-(--color-border)"
                >
                  <td className="py-3 align-top">{movement.date}</td>
                  <td className="py-3 align-top">{movement.productName}</td>
                  <td className="py-3 align-top text-emerald-700">
                    {movement.qtyAdded > 0 ? `+${movement.qtyAdded}` : "-"}
                  </td>
                  <td className="py-3 align-top text-rose-700">
                    {movement.qtyRemoved > 0 ? `-${movement.qtyRemoved}` : "-"}
                  </td>
                  <td className="py-3 align-top">{movement.reason}</td>
                  <td className="py-3 align-top">{movement.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {adjustItemId && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-(--color-main-text)">
              Adjust Stock
            </h3>
            <p className="mt-1 text-sm text-(--color-muted-text)">
              {inventoryItems.find((item) => item.id === adjustItemId)?.name}
            </p>

            <form className="mt-4 space-y-3" onSubmit={onSubmitAdjustment}>
              <label className="grid gap-1 text-sm font-medium">
                Adjustment Type
                <select
                  value={adjustType}
                  onChange={(event) => setAdjustType(event.target.value)}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="increase">Increase Stock</option>
                  <option value="decrease">Decrease Stock</option>
                  <option value="correction">
                    Stock Correction (Set Exact Value)
                  </option>
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Quantity
                <input
                  value={adjustQuantity}
                  onChange={(event) => setAdjustQuantity(event.target.value)}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Reason
                <select
                  value={adjustReason}
                  onChange={(event) => setAdjustReason(event.target.value)}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {ADJUSTMENT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                User
                <input
                  value={adjustUser}
                  onChange={(event) => setAdjustUser(event.target.value)}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdjustItemId(null)}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRestockOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-(--color-main-text)">
              Add New Stock Purchase
            </h3>

            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={onSubmitRestock}
            >
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Product
                <select
                  name="productId"
                  value={restockForm.productId}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">Select Product</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Supplier Name
                <input
                  name="supplierName"
                  value={restockForm.supplierName}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Invoice Number
                <input
                  name="invoiceNumber"
                  value={restockForm.invoiceNumber}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Quantity
                <input
                  name="purchaseQuantity"
                  value={restockForm.purchaseQuantity}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Price
                <input
                  name="purchasePrice"
                  value={restockForm.purchasePrice}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                User
                <input
                  name="user"
                  value={restockForm.user}
                  onChange={onRestockFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockOpen(false)}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editItemId && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-(--color-main-text)">
              Edit Inventory Item
            </h3>

            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={onSaveEdit}
            >
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Product Name
                <input
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category
                <input
                  value={editForm.category}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Brand
                <input
                  value={editForm.brand}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      brand: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                SKU / Barcode
                <input
                  value={editForm.sku}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sku: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Price
                <input
                  value={editForm.purchasePrice}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      purchasePrice: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Selling Price
                <input
                  value={editForm.sellingPrice}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sellingPrice: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Minimum Stock Level
                <input
                  value={editForm.minStockLevel}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      minStockLevel: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItemId(null)}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsItem && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Inventory Item Details
              </h3>
              <button
                type="button"
                onClick={() => setDetailsItemId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex items-start gap-3">
                <img
                  src={detailsItem.image}
                  alt={detailsItem.name}
                  className="h-16 w-16 rounded-lg border border-(--color-border) object-cover"
                />

                <div>
                  <h4 className="text-lg font-semibold text-(--color-main-text)">
                    {detailsItem.name}
                  </h4>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {detailsItem.category} • {detailsItem.brand}
                  </p>
                  <p className="mt-1 font-mono text-xs text-(--color-muted-text)">
                    {detailsItem.sku}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-1 text-sm text-(--color-main-text)">
                <p>
                  Purchase Price: {currencyFormat(detailsItem.purchasePrice)}
                </p>
                <p>Selling Price: {currencyFormat(detailsItem.sellingPrice)}</p>
                <p>Current Stock: {detailsItem.currentStock}</p>
                <p>Minimum Stock Level: {detailsItem.minStockLevel}</p>
                <p>Status: {getStockStatus(detailsItem)}</p>
                <p>Last Updated: {detailsItem.lastUpdated}</p>
              </div>

              {getStockStatus(detailsItem) !== "In Stock" && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Restock recommended: {getRestockRecommendation(detailsItem)}{" "}
                  units
                </p>
              )}
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">
                Stock Movements
              </h5>

              <ul className="mt-3 space-y-2">
                {detailsMovements.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No movement history for this product.
                  </li>
                )}

                {detailsMovements.map((movement) => (
                  <li
                    key={movement.id}
                    className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2"
                  >
                    <p className="text-sm font-medium text-(--color-main-text)">
                      {movement.date}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      +{movement.qtyAdded} / -{movement.qtyRemoved} •{" "}
                      {movement.reason} • {movement.user}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
