import { useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { currencyFormat } from "../utils/currencyFormat.js";

const PRODUCT_CATEGORY_OPTIONS = [
  "Mobile Phones",
  "Accessories",
  "Spare Parts",
  "Electronic Items",
];

const SUPPLIER_STATUS_OPTIONS = ["Active", "Inactive", "Suspended"];
const ORDER_STATUS_OPTIONS = ["Pending", "Received", "Cancelled"];
const PAYMENT_METHOD_OPTIONS = ["Bank Transfer", "Cash", "Cheque", "Card"];
const DOCUMENT_TYPES = ["Purchase Invoice", "Agreement", "Payment Receipt"];

const getDateString = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const getDateTimeString = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const toTimestamp = (dateString) => {
  const parsed = Date.parse(`${dateString}T12:00:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parseAmount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const createSupplierId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `SUP-${new Date().getFullYear()}-${rand}`;
};

const createOrderId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PO-${new Date().getFullYear()}-${rand}`;
};

const createPurchaseId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PUR-${new Date().getFullYear()}-${rand}`;
};

const createInvoiceNumber = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PINV-${new Date().getFullYear()}-${rand}`;
};

const createPaymentId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PAY-${new Date().getFullYear()}-${rand}`;
};

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const orderStatusClassMap = {
  Pending: "bg-amber-100 text-amber-700",
  Received: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const paymentStatusClassMap = {
  Paid: "bg-emerald-100 text-emerald-700",
  Partial: "bg-amber-100 text-amber-700",
  Pending: "bg-rose-100 text-rose-700",
};

const statusClassMap = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-200 text-slate-700",
  Suspended: "bg-rose-100 text-rose-700",
};

const getSupplierIndicator = (status, outstandingBalance) => {
  if (status === "Suspended") {
    return {
      label: "Suspended",
      className: "bg-rose-100 text-rose-700",
    };
  }

  if (outstandingBalance > 0) {
    return {
      label: "Pending Payments",
      className: "bg-amber-100 text-amber-700",
    };
  }

  if (status === "Active") {
    return {
      label: "Active",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  return {
    label: "Inactive",
    className: "bg-slate-200 text-slate-700",
  };
};

const DATE_TODAY = getDateString(0);
const DATE_MINUS_2 = getDateString(-2);
const DATE_MINUS_4 = getDateString(-4);
const DATE_MINUS_7 = getDateString(-7);
const DATE_MINUS_10 = getDateString(-10);
const DATE_MINUS_12 = getDateString(-12);
const DATE_MINUS_15 = getDateString(-15);
const DATE_MINUS_20 = getDateString(-20);
const DATE_MINUS_25 = getDateString(-25);
const DATE_MINUS_35 = getDateString(-35);
const DATE_MINUS_42 = getDateString(-42);
const DATE_PLUS_3 = getDateString(3);
const DATE_PLUS_5 = getDateString(5);
const DATE_PLUS_8 = getDateString(8);

const INITIAL_SUPPLIERS = [
  {
    id: "SUP-1001",
    supplierName: "ABC Mobile Distributor",
    contactPerson: "Nalin Jayawardena",
    phone: "0772211445",
    email: "sales@abcmobile.lk",
    companyName: "ABC Mobile Distributors Pvt Ltd",
    address: "No. 20, Armour Street, Colombo 12",
    bankDetails: "Commercial Bank - 010012345678",
    paymentTerms: "30 days credit",
    openingBalance: 85000,
    notes: "Main partner for flagship phone stock.",
    status: "Active",
    productCategory: "Mobile Phones",
    productsSupplied: [
      "iPhone 14 Pro Max",
      "Samsung Galaxy A55",
      "iPad Air",
    ],
    documents: [
      {
        id: "DOC-SUP-001",
        type: "Agreement",
        name: "abc-yearly-agreement-2026.pdf",
        uploadedAt: `${DATE_MINUS_35} 10:25`,
      },
    ],
  },
  {
    id: "SUP-1002",
    supplierName: "Smart Accessory House",
    contactPerson: "Kasun Perera",
    phone: "0719988776",
    email: "orders@smartaccessory.lk",
    companyName: "Smart Accessory House (Pvt) Ltd",
    address: "48, Main Street, Pettah",
    bankDetails: "Sampath Bank - 221034567812",
    paymentTerms: "21 days credit",
    openingBalance: 42000,
    notes: "Fast delivery for accessories.",
    status: "Active",
    productCategory: "Accessories",
    productsSupplied: [
      "iPhone Back Covers",
      "Tempered Glass",
      "Type-C Cables",
      "Chargers",
    ],
    documents: [],
  },
  {
    id: "SUP-1003",
    supplierName: "Tech Parts Lanka",
    contactPerson: "Ishara Fernando",
    phone: "0754455667",
    email: "parts@techparts.lk",
    companyName: "Tech Parts Lanka",
    address: "67, Galle Road, Dehiwala",
    bankDetails: "HNB - 009872345111",
    paymentTerms: "15 days credit",
    openingBalance: 16000,
    notes: "Reliable spare part quality.",
    status: "Active",
    productCategory: "Spare Parts",
    productsSupplied: [
      "Battery Packs",
      "Charging Ports",
      "Mobile Screens",
      "Speakers",
    ],
    documents: [],
  },
  {
    id: "SUP-1004",
    supplierName: "Global Gadget Imports",
    contactPerson: "Ravindu Silva",
    phone: "0703322119",
    email: "import@globalgadget.lk",
    companyName: "Global Gadget Imports",
    address: "114, Duplication Road, Colombo 03",
    bankDetails: "NDB - 8899001122",
    paymentTerms: "45 days credit",
    openingBalance: 0,
    notes: "Imports electronic bundles monthly.",
    status: "Inactive",
    productCategory: "Electronic Items",
    productsSupplied: ["Bluetooth Speakers", "Smart Watches", "Power Banks"],
    documents: [],
  },
  {
    id: "SUP-1005",
    supplierName: "Prime Wholesale Hub",
    contactPerson: "Tharaka Nimal",
    phone: "0767788990",
    email: "prime@wholesalehub.lk",
    companyName: "Prime Wholesale Hub",
    address: "22, Kandy Road, Kadawatha",
    bankDetails: "BOC - 5511990033",
    paymentTerms: "30 days credit",
    openingBalance: 120000,
    notes: "Payment disputes pending from last quarter.",
    status: "Suspended",
    productCategory: "Accessories",
    productsSupplied: ["Car Chargers", "Earphones", "Data Cables"],
    documents: [
      {
        id: "DOC-SUP-005",
        type: "Payment Receipt",
        name: "receipt-partial-prime.pdf",
        uploadedAt: `${DATE_MINUS_12} 15:05`,
      },
    ],
  },
  {
    id: "SUP-1006",
    supplierName: "Nano Device Source",
    contactPerson: "Maneesha Gunasekara",
    phone: "0742211330",
    email: "sales@nanodevice.lk",
    companyName: "Nano Device Source",
    address: "95, High Level Road, Nugegoda",
    bankDetails: "DFCC - 7002211002",
    paymentTerms: "Cash on delivery",
    openingBalance: 0,
    notes: "Good for limited stock devices.",
    status: "Active",
    productCategory: "Mobile Phones",
    productsSupplied: ["Xiaomi Redmi Series", "Oppo Series"],
    documents: [],
  },
];

const INITIAL_PURCHASE_ORDERS = [
  {
    id: "PO-2026-301",
    supplierId: "SUP-1001",
    productName: "iPhone 14 Pro Max",
    productCategory: "Mobile Phones",
    quantity: 5,
    purchasePrice: 320000,
    totalCost: 1600000,
    orderDate: DATE_MINUS_20,
    expectedDeliveryDate: DATE_MINUS_15,
    status: "Received",
    purchaseCreated: true,
  },
  {
    id: "PO-2026-302",
    supplierId: "SUP-1002",
    productName: "Tempered Glass",
    productCategory: "Accessories",
    quantity: 120,
    purchasePrice: 450,
    totalCost: 54000,
    orderDate: DATE_MINUS_15,
    expectedDeliveryDate: DATE_MINUS_10,
    status: "Received",
    purchaseCreated: true,
  },
  {
    id: "PO-2026-303",
    supplierId: "SUP-1003",
    productName: "Charging Port",
    productCategory: "Spare Parts",
    quantity: 40,
    purchasePrice: 3100,
    totalCost: 124000,
    orderDate: DATE_MINUS_10,
    expectedDeliveryDate: DATE_MINUS_4,
    status: "Pending",
    purchaseCreated: false,
  },
  {
    id: "PO-2026-304",
    supplierId: "SUP-1002",
    productName: "USB Type-C Cable",
    productCategory: "Accessories",
    quantity: 250,
    purchasePrice: 900,
    totalCost: 225000,
    orderDate: DATE_MINUS_7,
    expectedDeliveryDate: DATE_PLUS_3,
    status: "Pending",
    purchaseCreated: false,
  },
  {
    id: "PO-2026-305",
    supplierId: "SUP-1005",
    productName: "Wireless Earbuds",
    productCategory: "Electronic Items",
    quantity: 30,
    purchasePrice: 9800,
    totalCost: 294000,
    orderDate: DATE_MINUS_25,
    expectedDeliveryDate: DATE_MINUS_20,
    status: "Cancelled",
    purchaseCreated: false,
  },
  {
    id: "PO-2026-306",
    supplierId: "SUP-1006",
    productName: "Redmi Note 12",
    productCategory: "Mobile Phones",
    quantity: 20,
    purchasePrice: 81000,
    totalCost: 1620000,
    orderDate: DATE_MINUS_4,
    expectedDeliveryDate: DATE_PLUS_5,
    status: "Pending",
    purchaseCreated: false,
  },
  {
    id: "PO-2026-307",
    supplierId: "SUP-1001",
    productName: "iPad Air",
    productCategory: "Electronic Items",
    quantity: 8,
    purchasePrice: 198000,
    totalCost: 1584000,
    orderDate: DATE_MINUS_2,
    expectedDeliveryDate: DATE_PLUS_8,
    status: "Pending",
    purchaseCreated: false,
  },
];

const INITIAL_PURCHASES = [
  {
    id: "PUR-2026-401",
    supplierId: "SUP-1001",
    invoiceNumber: "PINV-2026-801",
    date: DATE_MINUS_15,
    productList: "iPhone 14 Pro Max",
    quantity: 5,
    totalAmount: 1600000,
  },
  {
    id: "PUR-2026-402",
    supplierId: "SUP-1002",
    invoiceNumber: "PINV-2026-802",
    date: DATE_MINUS_10,
    productList: "Tempered Glass",
    quantity: 120,
    totalAmount: 54000,
  },
  {
    id: "PUR-2026-403",
    supplierId: "SUP-1003",
    invoiceNumber: "PINV-2026-803",
    date: DATE_MINUS_42,
    productList: "Mobile Battery Packs",
    quantity: 55,
    totalAmount: 356000,
  },
  {
    id: "PUR-2026-404",
    supplierId: "SUP-1005",
    invoiceNumber: "PINV-2026-804",
    date: DATE_MINUS_35,
    productList: "Car Chargers + Earphones",
    quantity: 100,
    totalAmount: 440000,
  },
  {
    id: "PUR-2026-405",
    supplierId: "SUP-1006",
    invoiceNumber: "PINV-2026-805",
    date: DATE_MINUS_25,
    productList: "Xiaomi Redmi Series",
    quantity: 15,
    totalAmount: 1080000,
  },
];

const INITIAL_PAYMENTS = [
  {
    id: "PAY-2026-501",
    supplierId: "SUP-1001",
    invoiceNumber: "PINV-2026-801",
    amountPaid: 800000,
    paymentMethod: "Bank Transfer",
    paymentDate: DATE_MINUS_12,
  },
  {
    id: "PAY-2026-502",
    supplierId: "SUP-1002",
    invoiceNumber: "PINV-2026-802",
    amountPaid: 54000,
    paymentMethod: "Cash",
    paymentDate: DATE_MINUS_7,
  },
  {
    id: "PAY-2026-503",
    supplierId: "SUP-1003",
    invoiceNumber: "PINV-2026-803",
    amountPaid: 180000,
    paymentMethod: "Bank Transfer",
    paymentDate: DATE_MINUS_20,
  },
  {
    id: "PAY-2026-504",
    supplierId: "SUP-1005",
    invoiceNumber: "PINV-2026-804",
    amountPaid: 120000,
    paymentMethod: "Cheque",
    paymentDate: DATE_MINUS_15,
  },
  {
    id: "PAY-2026-505",
    supplierId: "SUP-1006",
    invoiceNumber: "PINV-2026-805",
    amountPaid: 500000,
    paymentMethod: "Bank Transfer",
    paymentDate: DATE_MINUS_10,
  },
];

const SUPPLIER_FILTER_OPTIONS = [
  { value: "all", label: "All Suppliers" },
  { value: "active", label: "Active Suppliers" },
  { value: "pending", label: "Pending Payments" },
  { value: "inactive", label: "Inactive Suppliers" },
  { value: "suspended", label: "Suspended Suppliers" },
];

const DEFAULT_SUPPLIER_FORM = {
  supplierName: "",
  contactPerson: "",
  phone: "",
  email: "",
  companyName: "",
  address: "",
  bankDetails: "",
  paymentTerms: "30 days credit",
  openingBalance: "0",
  notes: "",
  status: "Active",
  productCategory: PRODUCT_CATEGORY_OPTIONS[0],
};

const DEFAULT_ORDER_FORM = {
  supplierId: "",
  productName: "",
  productCategory: PRODUCT_CATEGORY_OPTIONS[0],
  quantity: "1",
  purchasePrice: "0",
  orderDate: DATE_TODAY,
  expectedDeliveryDate: DATE_PLUS_5,
  status: "Pending",
};

const DEFAULT_PAYMENT_FORM = {
  supplierId: "",
  invoiceNumber: "",
  amountPaid: "",
  paymentMethod: "Bank Transfer",
  paymentDate: DATE_TODAY,
};

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [isSupplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [supplierForm, setSupplierForm] = useState(DEFAULT_SUPPLIER_FORM);

  const [isOrderFormOpen, setOrderFormOpen] = useState(false);
  const [orderForm, setOrderForm] = useState(DEFAULT_ORDER_FORM);

  const [isPaymentFormOpen, setPaymentFormOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState(DEFAULT_PAYMENT_FORM);

  const [profileSupplierId, setProfileSupplierId] = useState(null);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 250);

  const supplierMap = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );

  const purchaseMetricsMap = useMemo(() => {
    const map = new Map();

    purchases.forEach((purchase) => {
      const current = map.get(purchase.supplierId) || {
        totalPurchases: 0,
        totalQuantity: 0,
      };

      map.set(purchase.supplierId, {
        totalPurchases: current.totalPurchases + Number(purchase.totalAmount || 0),
        totalQuantity: current.totalQuantity + Number(purchase.quantity || 0),
      });
    });

    return map;
  }, [purchases]);

  const paymentTotalsMap = useMemo(() => {
    const map = new Map();

    payments.forEach((payment) => {
      map.set(
        payment.supplierId,
        (map.get(payment.supplierId) || 0) + Number(payment.amountPaid || 0),
      );
    });

    return map;
  }, [payments]);

  const enrichedSuppliers = useMemo(
    () =>
      suppliers.map((supplier) => {
        const purchaseMetrics = purchaseMetricsMap.get(supplier.id) || {
          totalPurchases: 0,
          totalQuantity: 0,
        };

        const totalPaid = paymentTotalsMap.get(supplier.id) || 0;
        const outstandingBalance = Math.max(
          0,
          Number(supplier.openingBalance || 0) + purchaseMetrics.totalPurchases - totalPaid,
        );

        const indicator = getSupplierIndicator(supplier.status, outstandingBalance);

        return {
          ...supplier,
          totalPurchases: purchaseMetrics.totalPurchases,
          purchaseVolume: purchaseMetrics.totalQuantity,
          totalPaid,
          outstandingBalance,
          indicatorLabel: indicator.label,
          indicatorClassName: indicator.className,
        };
      }),
    [suppliers, purchaseMetricsMap, paymentTotalsMap],
  );

  const purchasesWithStatus = useMemo(() => {
    return purchases
      .map((purchase) => {
        const totalPaid = payments
          .filter(
            (payment) =>
              payment.supplierId === purchase.supplierId &&
              payment.invoiceNumber === purchase.invoiceNumber,
          )
          .reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0);

        const remainingBalance = Math.max(0, Number(purchase.totalAmount || 0) - totalPaid);
        const paymentStatus =
          remainingBalance === 0
            ? "Paid"
            : totalPaid > 0
            ? "Partial"
            : "Pending";

        return {
          ...purchase,
          supplierName: supplierMap.get(purchase.supplierId)?.supplierName || "Unknown",
          totalPaid,
          remainingBalance,
          paymentStatus,
        };
      })
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [purchases, payments, supplierMap]);

  const filteredSuppliers = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return enrichedSuppliers
      .filter((supplier) => {
        const matchesSearch =
          term.length === 0 ||
          supplier.supplierName.toLowerCase().includes(term) ||
          supplier.phone.toLowerCase().includes(term) ||
          supplier.companyName.toLowerCase().includes(term) ||
          supplier.contactPerson.toLowerCase().includes(term);

        const matchesSupplierFilter =
          supplierFilter === "all" ||
          (supplierFilter === "active" && supplier.status === "Active") ||
          (supplierFilter === "pending" && supplier.outstandingBalance > 0) ||
          (supplierFilter === "inactive" && supplier.status === "Inactive") ||
          (supplierFilter === "suspended" && supplier.status === "Suspended");

        const matchesCategory =
          categoryFilter === "all" || supplier.productCategory === categoryFilter;

        return matchesSearch && matchesSupplierFilter && matchesCategory;
      })
      .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
  }, [enrichedSuppliers, debouncedSearch, supplierFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + pageSize);

  const selectedSupplier = useMemo(
    () =>
      enrichedSuppliers.find((supplier) => supplier.id === profileSupplierId) || null,
    [enrichedSuppliers, profileSupplierId],
  );

  const selectedSupplierOrders = useMemo(() => {
    if (!selectedSupplier) return [];

    return purchaseOrders
      .filter((order) => order.supplierId === selectedSupplier.id)
      .sort((a, b) => toTimestamp(b.orderDate) - toTimestamp(a.orderDate));
  }, [purchaseOrders, selectedSupplier]);

  const selectedSupplierPurchases = useMemo(() => {
    if (!selectedSupplier) return [];

    return purchasesWithStatus
      .filter((purchase) => purchase.supplierId === selectedSupplier.id)
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [purchasesWithStatus, selectedSupplier]);

  const selectedSupplierPayments = useMemo(() => {
    if (!selectedSupplier) return [];

    return payments
      .filter((payment) => payment.supplierId === selectedSupplier.id)
      .sort((a, b) => toTimestamp(b.paymentDate) - toTimestamp(a.paymentDate));
  }, [payments, selectedSupplier]);

  const selectedSupplierOutstanding = useMemo(() => {
    if (!selectedSupplier) return [];

    return selectedSupplierPurchases.filter((purchase) => purchase.remainingBalance > 0);
  }, [selectedSupplier, selectedSupplierPurchases]);

  const selectedOpeningOutstanding = useMemo(() => {
    if (!selectedSupplier) return 0;

    const invoiceOutstanding = selectedSupplierOutstanding.reduce(
      (sum, purchase) => sum + purchase.remainingBalance,
      0,
    );

    return Math.max(0, selectedSupplier.outstandingBalance - invoiceOutstanding);
  }, [selectedSupplier, selectedSupplierOutstanding]);

  const supplierOverview = useMemo(() => {
    const monthPrefix = DATE_TODAY.slice(0, 7);

    const totalSuppliers = enrichedSuppliers.length;
    const activeSuppliers = enrichedSuppliers.filter(
      (supplier) => supplier.status === "Active",
    ).length;
    const pendingPayments = enrichedSuppliers.filter(
      (supplier) => supplier.outstandingBalance > 0,
    ).length;

    const totalPurchases = enrichedSuppliers.reduce(
      (sum, supplier) => sum + supplier.totalPurchases,
      0,
    );

    const supplierOrdersThisMonth = purchaseOrders.filter((order) =>
      order.orderDate.startsWith(monthPrefix),
    ).length;

    return {
      totalSuppliers,
      activeSuppliers,
      pendingPayments,
      totalPurchases,
      supplierOrdersThisMonth,
    };
  }, [enrichedSuppliers, purchaseOrders]);

  const supplierReports = useMemo(() => {
    const topSuppliersByPurchase = [...enrichedSuppliers]
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5);

    const supplierPaymentReport = [...enrichedSuppliers]
      .map((supplier) => ({
        id: supplier.id,
        supplierName: supplier.supplierName,
        totalPaid: supplier.totalPaid,
        outstandingBalance: supplier.outstandingBalance,
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    const monthMap = new Map();
    purchases.forEach((purchase) => {
      const month = purchase.date.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + Number(purchase.totalAmount || 0));
    });

    const monthlyPurchaseSummary = Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const topSuppliersByPurchaseVolume = [...enrichedSuppliers]
      .sort((a, b) => b.purchaseVolume - a.purchaseVolume)
      .slice(0, 5);

    return {
      topSuppliersByPurchase,
      supplierPaymentReport,
      monthlyPurchaseSummary,
      topSuppliersByPurchaseVolume,
    };
  }, [enrichedSuppliers, purchases]);

  const paymentFormInvoiceOptions = useMemo(() => {
    if (!paymentForm.supplierId) return [];

    return purchasesWithStatus.filter(
      (purchase) =>
        purchase.supplierId === paymentForm.supplierId && purchase.remainingBalance > 0,
    );
  }, [paymentForm.supplierId, purchasesWithStatus]);

  const paymentTargetPurchase = useMemo(
    () =>
      purchasesWithStatus.find(
        (purchase) =>
          purchase.supplierId === paymentForm.supplierId &&
          purchase.invoiceNumber === paymentForm.invoiceNumber,
      ) || null,
    [purchasesWithStatus, paymentForm.supplierId, paymentForm.invoiceNumber],
  );

  const orderTotalPreview = useMemo(() => {
    const quantity = parseAmount(orderForm.quantity);
    const purchasePrice = parseAmount(orderForm.purchasePrice);
    return Math.max(0, quantity * purchasePrice);
  }, [orderForm.quantity, orderForm.purchasePrice]);

  const onOpenAddSupplierForm = () => {
    setEditingSupplierId(null);
    setSupplierForm(DEFAULT_SUPPLIER_FORM);
    setSupplierFormOpen(true);
  };

  const onOpenEditSupplierForm = (supplier) => {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      companyName: supplier.companyName,
      address: supplier.address,
      bankDetails: supplier.bankDetails,
      paymentTerms: supplier.paymentTerms,
      openingBalance: String(supplier.openingBalance),
      notes: supplier.notes,
      status: supplier.status,
      productCategory: supplier.productCategory,
    });
    setSupplierFormOpen(true);
  };

  const onCloseSupplierForm = () => {
    setSupplierFormOpen(false);
    setEditingSupplierId(null);
    setSupplierForm(DEFAULT_SUPPLIER_FORM);
  };

  const onSupplierFormChange = (event) => {
    const { name, value } = event.target;
    setSupplierForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitSupplierForm = (event) => {
    event.preventDefault();

    const supplierName = supplierForm.supplierName.trim();
    const contactPerson = supplierForm.contactPerson.trim();
    const phone = supplierForm.phone.trim();
    const email = supplierForm.email.trim();

    if (!supplierName || !contactPerson || !phone) {
      setFeedbackMessage("Supplier name, contact person, and phone are required.");
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setFeedbackMessage("Enter a valid supplier email address.");
      return;
    }

    const openingBalance = Math.max(0, parseAmount(supplierForm.openingBalance));

    if (editingSupplierId) {
      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === editingSupplierId
            ? {
                ...supplier,
                supplierName,
                contactPerson,
                phone,
                email,
                companyName: supplierForm.companyName.trim(),
                address: supplierForm.address.trim(),
                bankDetails: supplierForm.bankDetails.trim(),
                paymentTerms: supplierForm.paymentTerms.trim(),
                openingBalance,
                notes: supplierForm.notes.trim(),
                status: supplierForm.status,
                productCategory: supplierForm.productCategory,
              }
            : supplier,
        ),
      );

      setFeedbackMessage(`Supplier updated: ${editingSupplierId}`);
    } else {
      const supplierId = createSupplierId();

      setSuppliers((prev) => [
        {
          id: supplierId,
          supplierName,
          contactPerson,
          phone,
          email,
          companyName: supplierForm.companyName.trim(),
          address: supplierForm.address.trim(),
          bankDetails: supplierForm.bankDetails.trim(),
          paymentTerms: supplierForm.paymentTerms.trim(),
          openingBalance,
          notes: supplierForm.notes.trim(),
          status: supplierForm.status,
          productCategory: supplierForm.productCategory,
          productsSupplied: [],
          documents: [],
        },
        ...prev,
      ]);

      setFeedbackMessage(`Supplier created: ${supplierId}`);
    }

    onCloseSupplierForm();
  };

  const onDeleteSupplier = (supplier) => {
    const shouldDelete = window.confirm(
      `Delete supplier "${supplier.supplierName}" and related records?`,
    );

    if (!shouldDelete) return;

    setSuppliers((prev) => prev.filter((item) => item.id !== supplier.id));
    setPurchaseOrders((prev) => prev.filter((order) => order.supplierId !== supplier.id));
    setPurchases((prev) => prev.filter((purchase) => purchase.supplierId !== supplier.id));
    setPayments((prev) => prev.filter((payment) => payment.supplierId !== supplier.id));

    if (profileSupplierId === supplier.id) {
      setProfileSupplierId(null);
    }

    setFeedbackMessage(`Supplier deleted: ${supplier.id}`);
  };

  const onOpenOrderForm = (supplierId = "") => {
    setOrderForm({
      ...DEFAULT_ORDER_FORM,
      supplierId,
      productCategory:
        supplierId && supplierMap.get(supplierId)
          ? supplierMap.get(supplierId).productCategory
          : PRODUCT_CATEGORY_OPTIONS[0],
    });
    setOrderFormOpen(true);
  };

  const onCloseOrderForm = () => {
    setOrderForm(DEFAULT_ORDER_FORM);
    setOrderFormOpen(false);
  };

  const onOrderFormChange = (event) => {
    const { name, value } = event.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitOrderForm = (event) => {
    event.preventDefault();

    if (!orderForm.supplierId) {
      setFeedbackMessage("Select a supplier for the purchase order.");
      return;
    }

    const supplier = supplierMap.get(orderForm.supplierId);
    if (!supplier) {
      setFeedbackMessage("Selected supplier is not available.");
      return;
    }

    const productName = orderForm.productName.trim();
    const quantity = Math.max(1, Math.round(parseAmount(orderForm.quantity)));
    const purchasePrice = Math.max(0, parseAmount(orderForm.purchasePrice));

    if (!productName || purchasePrice <= 0) {
      setFeedbackMessage("Enter product name and valid purchase price.");
      return;
    }

    const totalCost = quantity * purchasePrice;
    const orderId = createOrderId();
    const shouldCreatePurchase = orderForm.status === "Received";

    setPurchaseOrders((prev) => [
      {
        id: orderId,
        supplierId: orderForm.supplierId,
        productName,
        productCategory: orderForm.productCategory,
        quantity,
        purchasePrice,
        totalCost,
        orderDate: orderForm.orderDate,
        expectedDeliveryDate: orderForm.expectedDeliveryDate,
        status: orderForm.status,
        purchaseCreated: shouldCreatePurchase,
      },
      ...prev,
    ]);

    setSuppliers((prev) =>
      prev.map((item) => {
        if (item.id !== orderForm.supplierId) return item;

        const existingProducts = new Set(item.productsSupplied || []);
        existingProducts.add(productName);

        return {
          ...item,
          productsSupplied: Array.from(existingProducts),
          productCategory: orderForm.productCategory,
        };
      }),
    );

    if (shouldCreatePurchase) {
      const invoiceNumber = createInvoiceNumber();

      setPurchases((prev) => [
        {
          id: createPurchaseId(),
          supplierId: orderForm.supplierId,
          invoiceNumber,
          date: orderForm.orderDate,
          productList: productName,
          quantity,
          totalAmount: totalCost,
        },
        ...prev,
      ]);

      setFeedbackMessage(`Order received and purchase recorded (${invoiceNumber}).`);
    } else {
      setFeedbackMessage(`Purchase order created: ${orderId}`);
    }

    onCloseOrderForm();
  };

  const onUpdateOrderStatus = (orderId, nextStatus) => {
    const targetOrder = purchaseOrders.find((order) => order.id === orderId);
    if (!targetOrder) return;

    const shouldCreatePurchase =
      nextStatus === "Received" && !targetOrder.purchaseCreated;

    setPurchaseOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              purchaseCreated: shouldCreatePurchase
                ? true
                : order.purchaseCreated,
            }
          : order,
      ),
    );

    if (shouldCreatePurchase) {
      const invoiceNumber = createInvoiceNumber();

      setPurchases((prev) => [
        {
          id: createPurchaseId(),
          supplierId: targetOrder.supplierId,
          invoiceNumber,
          date: DATE_TODAY,
          productList: targetOrder.productName,
          quantity: targetOrder.quantity,
          totalAmount: targetOrder.totalCost,
        },
        ...prev,
      ]);

      setFeedbackMessage(
        `Order ${orderId} received and purchase invoice ${invoiceNumber} created.`,
      );
      return;
    }

    setFeedbackMessage(`Order ${orderId} moved to ${nextStatus}.`);
  };

  const onOpenPaymentForm = (supplierId = "", invoiceNumber = "") => {
    setPaymentForm({
      ...DEFAULT_PAYMENT_FORM,
      supplierId,
      invoiceNumber,
    });
    setPaymentFormOpen(true);
  };

  const onClosePaymentForm = () => {
    setPaymentForm(DEFAULT_PAYMENT_FORM);
    setPaymentFormOpen(false);
  };

  const onPaymentFormChange = (event) => {
    const { name, value } = event.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitPaymentForm = (event) => {
    event.preventDefault();

    const supplierId = paymentForm.supplierId;
    const invoiceNumber = paymentForm.invoiceNumber;
    const amountPaid = parseAmount(paymentForm.amountPaid);

    if (!supplierId || !invoiceNumber) {
      setFeedbackMessage("Select supplier and invoice to record payment.");
      return;
    }

    if (amountPaid <= 0) {
      setFeedbackMessage("Enter a valid payment amount.");
      return;
    }

    const purchase = purchasesWithStatus.find(
      (item) =>
        item.supplierId === supplierId && item.invoiceNumber === invoiceNumber,
    );

    if (!purchase) {
      setFeedbackMessage("Selected invoice was not found.");
      return;
    }

    if (purchase.remainingBalance <= 0) {
      setFeedbackMessage("Selected invoice is already fully paid.");
      return;
    }

    if (amountPaid > purchase.remainingBalance) {
      setFeedbackMessage(
        `Amount exceeds remaining balance (${currencyFormat(purchase.remainingBalance)}).`,
      );
      return;
    }

    const paymentId = createPaymentId();

    setPayments((prev) => [
      {
        id: paymentId,
        supplierId,
        invoiceNumber,
        amountPaid,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
      },
      ...prev,
    ]);

    setFeedbackMessage(`Payment recorded: ${paymentId}`);
    onClosePaymentForm();
  };

  const onSupplierDocumentUpload = (event) => {
    if (!selectedSupplier) return;

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier.id !== selectedSupplier.id) return supplier;

        return {
          ...supplier,
          documents: [
            ...files.map((file, index) => ({
              id: `DOC-${Date.now()}-${index}`,
              type: documentType,
              name: file.name,
              uploadedAt: getDateTimeString(),
            })),
            ...(supplier.documents || []),
          ],
        };
      }),
    );

    setFeedbackMessage("Supplier documents attached.");
    event.target.value = "";
  };

  const onExportSupplierPurchaseReport = () => {
    const rows = supplierReports.topSuppliersByPurchase;

    if (rows.length === 0) {
      setFeedbackMessage("No supplier purchase report data available.");
      return;
    }

    const headers = ["supplierId", "supplierName", "totalPurchases", "purchaseVolume"];

    const csvRows = rows.map((supplier) =>
      [supplier.id, supplier.supplierName, supplier.totalPurchases, supplier.purchaseVolume]
        .map(escapeCsvCell)
        .join(","),
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "supplier-purchase-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Supplier purchase report exported.");
  };

  const onExportSupplierPaymentReport = () => {
    const rows = supplierReports.supplierPaymentReport;

    if (rows.length === 0) {
      setFeedbackMessage("No supplier payment report data available.");
      return;
    }

    const headers = ["supplierId", "supplierName", "totalPaid", "outstandingBalance"];

    const csvRows = rows.map((supplier) =>
      [supplier.id, supplier.supplierName, supplier.totalPaid, supplier.outstandingBalance]
        .map(escapeCsvCell)
        .join(","),
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "supplier-payment-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Supplier payment report exported.");
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Supplier Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Manage supplier details, purchase orders, payments, products supplied,
              and procurement performance from one page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportSupplierPurchaseReport}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Purchase Report
            </button>
            <button
              type="button"
              onClick={onExportSupplierPaymentReport}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Payment Report
            </button>
            <button
              type="button"
              onClick={() => onOpenOrderForm()}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Create PO
            </button>
            <button
              type="button"
              onClick={() => onOpenPaymentForm()}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Add Payment
            </button>
            <button
              type="button"
              onClick={onOpenAddSupplierForm}
              className="h-9 rounded-lg bg-(--color-main-text) px-3 text-sm font-medium text-white"
            >
              Add Supplier
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
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Suppliers
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {supplierOverview.totalSuppliers}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
            Active Suppliers
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {supplierOverview.activeSuppliers}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-amber-700">
            Pending Payments
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {supplierOverview.pendingPayments}
          </p>
        </article>

        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-sky-700">
            Total Purchases
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">
            {currencyFormat(supplierOverview.totalPurchases)}
          </p>
        </article>

        <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-indigo-700">
            Orders This Month
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-700">
            {supplierOverview.supplierOrdersThisMonth}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Search & Filters
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Search Supplier
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Supplier / Phone / Company"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Supplier Filter
            <select
              value={supplierFilter}
              onChange={(event) => {
                setSupplierFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              {SUPPLIER_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Product Category
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-1">
            <span className="text-sm font-medium text-(--color-main-text)">
              Quick Reset
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSupplierFilter("all");
                setCategoryFilter("all");
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Supplier List
        </h3>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1550px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-3">Supplier ID</th>
                <th className="pb-3">Supplier Name</th>
                <th className="pb-3">Contact Person</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Address</th>
                <th className="pb-3">Total Purchases</th>
                <th className="pb-3">Outstanding Balance</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-t border-(--color-border)">
                  <td className="py-3 align-top font-mono text-xs">{supplier.id}</td>
                  <td className="py-3 align-top">
                    <p className="font-medium text-(--color-main-text)">
                      {supplier.supplierName}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {supplier.companyName}
                    </p>
                  </td>
                  <td className="py-3 align-top">{supplier.contactPerson}</td>
                  <td className="py-3 align-top">{supplier.phone}</td>
                  <td className="py-3 align-top">{supplier.email || "-"}</td>
                  <td className="py-3 align-top">
                    <p className="max-w-[240px] text-sm text-(--color-main-text)">
                      {supplier.address || "-"}
                    </p>
                  </td>
                  <td className="py-3 align-top">{currencyFormat(supplier.totalPurchases)}</td>
                  <td className="py-3 align-top">{currencyFormat(supplier.outstandingBalance)}</td>
                  <td className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusClassMap[supplier.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {supplier.status}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${supplier.indicatorClassName}`}
                      >
                        {supplier.indicatorLabel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setProfileSupplierId(supplier.id)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditSupplierForm(supplier)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSupplier(supplier)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-3 space-y-3 md:hidden">
          {paginatedSuppliers.map((supplier) => (
            <li
              key={`${supplier.id}-mobile`}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-(--color-main-text)">
                    {supplier.supplierName}
                  </p>
                  <p className="text-xs font-mono text-(--color-muted-text)">
                    {supplier.id}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${supplier.indicatorClassName}`}
                >
                  {supplier.indicatorLabel}
                </span>
              </div>

              <div className="mt-2 grid gap-1 text-xs text-(--color-muted-text)">
                <p>{supplier.contactPerson}</p>
                <p>{supplier.phone}</p>
                <p>{supplier.companyName}</p>
                <p>
                  Purchases: {currencyFormat(supplier.totalPurchases)} • Outstanding:{" "}
                  {currencyFormat(supplier.outstandingBalance)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setProfileSupplierId(supplier.id)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditSupplierForm(supplier)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSupplier(supplier)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs text-rose-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {paginatedSuppliers.length === 0 && (
          <p className="py-6 text-sm text-(--color-muted-text)">
            No suppliers found with current filters.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-muted-text)">
            Showing {filteredSuppliers.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, filteredSuppliers.length)} of{" "}
            {filteredSuppliers.length}
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
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </label>

            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-8 rounded-lg border border-(--color-border) px-3 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Purchase Orders Management
          </h3>
          <button
            type="button"
            onClick={() => onOpenOrderForm()}
            className="h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
          >
            New Purchase Order
          </button>
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1350px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Supplier Name</th>
                <th className="pb-2">Product List</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Purchase Price</th>
                <th className="pb-2">Total Cost</th>
                <th className="pb-2">Order Date</th>
                <th className="pb-2">Expected Delivery</th>
                <th className="pb-2">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders
                .slice()
                .sort((a, b) => toTimestamp(b.orderDate) - toTimestamp(a.orderDate))
                .map((order) => (
                  <tr key={order.id} className="border-t border-(--color-border)">
                    <td className="py-2 align-top font-mono text-xs">{order.id}</td>
                    <td className="py-2 align-top">
                      {supplierMap.get(order.supplierId)?.supplierName || "Unknown"}
                    </td>
                    <td className="py-2 align-top">{order.productName}</td>
                    <td className="py-2 align-top">{order.quantity}</td>
                    <td className="py-2 align-top">{currencyFormat(order.purchasePrice)}</td>
                    <td className="py-2 align-top">{currencyFormat(order.totalCost)}</td>
                    <td className="py-2 align-top">{order.orderDate}</td>
                    <td className="py-2 align-top">{order.expectedDeliveryDate}</td>
                    <td className="py-2 align-top">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          onUpdateOrderStatus(order.id, event.target.value)
                        }
                        className={`h-8 rounded-lg border border-(--color-border) px-2 text-xs font-medium ${
                          orderStatusClassMap[order.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-3 space-y-2 md:hidden">
          {purchaseOrders
            .slice()
            .sort((a, b) => toTimestamp(b.orderDate) - toTimestamp(a.orderDate))
            .map((order) => (
              <li
                key={`${order.id}-mobile`}
                className="rounded-lg border border-(--color-border) p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-(--color-muted-text)">{order.id}</p>
                    <p className="font-medium text-(--color-main-text)">{order.productName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      orderStatusClassMap[order.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {supplierMap.get(order.supplierId)?.supplierName || "Unknown"}
                </p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Qty {order.quantity} • {currencyFormat(order.totalCost)}
                </p>
              </li>
            ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Supplier Payment Tracking
          </h3>
          <button
            type="button"
            onClick={() => onOpenPaymentForm()}
            className="h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
          >
            Record Payment
          </button>
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-2">Payment ID</th>
                <th className="pb-2">Supplier</th>
                <th className="pb-2">Invoice Number</th>
                <th className="pb-2">Amount Paid</th>
                <th className="pb-2">Remaining Balance</th>
                <th className="pb-2">Payment Method</th>
                <th className="pb-2">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {payments
                .slice()
                .sort((a, b) => toTimestamp(b.paymentDate) - toTimestamp(a.paymentDate))
                .map((payment) => {
                  const purchase = purchasesWithStatus.find(
                    (item) =>
                      item.supplierId === payment.supplierId &&
                      item.invoiceNumber === payment.invoiceNumber,
                  );

                  return (
                    <tr key={payment.id} className="border-t border-(--color-border)">
                      <td className="py-2 align-top font-mono text-xs">{payment.id}</td>
                      <td className="py-2 align-top">
                        {supplierMap.get(payment.supplierId)?.supplierName || "Unknown"}
                      </td>
                      <td className="py-2 align-top font-mono text-xs">
                        {payment.invoiceNumber}
                      </td>
                      <td className="py-2 align-top">{currencyFormat(payment.amountPaid)}</td>
                      <td className="py-2 align-top">
                        {currencyFormat(purchase?.remainingBalance || 0)}
                      </td>
                      <td className="py-2 align-top">{payment.paymentMethod}</td>
                      <td className="py-2 align-top">{payment.paymentDate}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <ul className="mt-3 space-y-2 md:hidden">
          {payments
            .slice()
            .sort((a, b) => toTimestamp(b.paymentDate) - toTimestamp(a.paymentDate))
            .map((payment) => {
              const purchase = purchasesWithStatus.find(
                (item) =>
                  item.supplierId === payment.supplierId &&
                  item.invoiceNumber === payment.invoiceNumber,
              );

              return (
                <li
                  key={`${payment.id}-mobile`}
                  className="rounded-lg border border-(--color-border) p-3 text-sm"
                >
                  <p className="font-mono text-xs text-(--color-muted-text)">{payment.id}</p>
                  <p className="mt-1 font-medium text-(--color-main-text)">
                    {supplierMap.get(payment.supplierId)?.supplierName || "Unknown"}
                  </p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">
                    {payment.invoiceNumber} • {payment.paymentDate}
                  </p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">
                    Paid: {currencyFormat(payment.amountPaid)} • Remaining:{" "}
                    {currencyFormat(purchase?.remainingBalance || 0)}
                  </p>
                </li>
              );
            })}
        </ul>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Supplier Reports
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Top Suppliers By Purchase
              </p>
              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {supplierReports.topSuppliersByPurchase.map((supplier) => (
                  <li key={`purchase-report-${supplier.id}`}>
                    {supplier.supplierName} • {currencyFormat(supplier.totalPurchases)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Top Suppliers By Volume
              </p>
              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {supplierReports.topSuppliersByPurchaseVolume.map((supplier) => (
                  <li key={`volume-report-${supplier.id}`}>
                    {supplier.supplierName} • {supplier.purchaseVolume} units
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-(--color-border) p-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Monthly Purchase Summary
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {supplierReports.monthlyPurchaseSummary.map((item) => (
                  <div key={item.month} className="rounded-md bg-(--color-menu-btn-hover) p-2 text-sm">
                    <p className="text-xs text-(--color-muted-text)">{item.month}</p>
                    <p className="font-medium text-(--color-main-text)">
                      {currencyFormat(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Supplier Payment Report
          </h3>

          <ul className="mt-3 space-y-2">
            {supplierReports.supplierPaymentReport.map((supplier) => (
              <li
                key={`payment-report-${supplier.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-(--color-main-text)">{supplier.supplierName}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      supplier.outstandingBalance > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {supplier.outstandingBalance > 0 ? "Pending" : "Cleared"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Paid: {currencyFormat(supplier.totalPaid)}
                </p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Outstanding: {currencyFormat(supplier.outstandingBalance)}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {isSupplierFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingSupplierId ? "Edit Supplier" : "Add Supplier"}
              </h3>
              <button
                type="button"
                onClick={onCloseSupplierForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitSupplierForm}>
              <label className="grid gap-1 text-sm font-medium">
                Supplier Name
                <input
                  required
                  name="supplierName"
                  value={supplierForm.supplierName}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Contact Person
                <input
                  required
                  name="contactPerson"
                  value={supplierForm.contactPerson}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Phone Number
                <input
                  required
                  name="phone"
                  value={supplierForm.phone}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Email Address
                <input
                  name="email"
                  value={supplierForm.email}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Company Name
                <input
                  name="companyName"
                  value={supplierForm.companyName}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Product Category
                <select
                  name="productCategory"
                  value={supplierForm.productCategory}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Address
                <input
                  name="address"
                  value={supplierForm.address}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Bank Details
                <input
                  name="bankDetails"
                  value={supplierForm.bankDetails}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Payment Terms
                <input
                  name="paymentTerms"
                  value={supplierForm.paymentTerms}
                  onChange={onSupplierFormChange}
                  placeholder="30 days credit"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Opening Balance
                <input
                  name="openingBalance"
                  value={supplierForm.openingBalance}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Supplier Status
                <select
                  name="status"
                  value={supplierForm.status}
                  onChange={onSupplierFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {SUPPLIER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Notes
                <textarea
                  name="notes"
                  value={supplierForm.notes}
                  onChange={onSupplierFormChange}
                  rows={3}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseSupplierForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  {editingSupplierId ? "Save Supplier" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOrderFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Create Purchase Order
              </h3>
              <button
                type="button"
                onClick={onCloseOrderForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitOrderForm}>
              <label className="grid gap-1 text-sm font-medium">
                Supplier Name
                <select
                  required
                  name="supplierId"
                  value={orderForm.supplierId}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Product List
                <input
                  required
                  name="productName"
                  value={orderForm.productName}
                  onChange={onOrderFormChange}
                  placeholder="e.g. Chargers"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Product Category
                <select
                  name="productCategory"
                  value={orderForm.productCategory}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Quantity
                <input
                  required
                  name="quantity"
                  value={orderForm.quantity}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Price
                <input
                  required
                  name="purchasePrice"
                  value={orderForm.purchasePrice}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="grid gap-1 text-sm font-medium">
                Total Cost
                <div className="grid h-10 items-center rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text)">
                  {currencyFormat(orderTotalPreview)}
                </div>
              </div>

              <label className="grid gap-1 text-sm font-medium">
                Order Date
                <input
                  type="date"
                  required
                  name="orderDate"
                  value={orderForm.orderDate}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Expected Delivery Date
                <input
                  type="date"
                  required
                  name="expectedDeliveryDate"
                  value={orderForm.expectedDeliveryDate}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Order Status
                <select
                  name="status"
                  value={orderForm.status}
                  onChange={onOrderFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseOrderForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Save Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Record Supplier Payment
              </h3>
              <button
                type="button"
                onClick={onClosePaymentForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitPaymentForm}>
              <label className="grid gap-1 text-sm font-medium">
                Supplier Name
                <select
                  required
                  name="supplierId"
                  value={paymentForm.supplierId}
                  onChange={onPaymentFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Invoice Number
                <select
                  required
                  name="invoiceNumber"
                  value={paymentForm.invoiceNumber}
                  onChange={onPaymentFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">Select Invoice</option>
                  {paymentFormInvoiceOptions.map((purchase) => (
                    <option key={purchase.invoiceNumber} value={purchase.invoiceNumber}>
                      {purchase.invoiceNumber} ({currencyFormat(purchase.remainingBalance)} due)
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Amount Paid
                <input
                  required
                  name="amountPaid"
                  value={paymentForm.amountPaid}
                  onChange={onPaymentFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="grid gap-1 text-sm font-medium">
                Remaining Balance
                <div className="grid h-10 items-center rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text)">
                  {paymentTargetPurchase
                    ? currencyFormat(paymentTargetPurchase.remainingBalance)
                    : "-"}
                </div>
              </div>

              <label className="grid gap-1 text-sm font-medium">
                Payment Method
                <select
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={onPaymentFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Payment Date
                <input
                  type="date"
                  required
                  name="paymentDate"
                  value={paymentForm.paymentDate}
                  onChange={onPaymentFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClosePaymentForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSupplier && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-4xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Supplier Profile - {selectedSupplier.supplierName}
              </h3>
              <button
                type="button"
                onClick={() => setProfileSupplierId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-(--color-main-text)">
                    {selectedSupplier.supplierName}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {selectedSupplier.companyName}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    Contact: {selectedSupplier.contactPerson} • {selectedSupplier.phone}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {selectedSupplier.email || "No email"}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {selectedSupplier.address || "No address"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusClassMap[selectedSupplier.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedSupplier.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedSupplier.indicatorClassName}`}
                  >
                    {selectedSupplier.indicatorLabel}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Total Purchases
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {currencyFormat(selectedSupplier.totalPurchases)}
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Outstanding Balance
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {currencyFormat(selectedSupplier.outstandingBalance)}
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Payment Terms
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {selectedSupplier.paymentTerms}
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Bank Details
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {selectedSupplier.bankDetails || "-"}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Products Supplied
              </h4>
              <ul className="mt-3 space-y-2">
                {selectedSupplier.productsSupplied.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No products mapped yet.
                  </li>
                )}
                {selectedSupplier.productsSupplied.map((product) => (
                  <li
                    key={`${selectedSupplier.id}-${product}`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    {product}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-(--color-main-text)">Outstanding Payments</h4>
                <button
                  type="button"
                  onClick={() => onOpenPaymentForm(selectedSupplier.id)}
                  className="h-8 rounded-lg border border-(--color-border) px-3 text-xs font-medium"
                >
                  Add Payment
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {selectedOpeningOutstanding > 0 && (
                  <li className="rounded-lg border border-(--color-border) px-3 py-2 text-sm">
                    <p className="font-medium text-(--color-main-text)">Opening Balance</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Remaining: {currencyFormat(selectedOpeningOutstanding)}
                    </p>
                  </li>
                )}

                {selectedSupplierOutstanding.length === 0 && selectedOpeningOutstanding === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No outstanding supplier payments.
                  </li>
                )}

                {selectedSupplierOutstanding.map((purchase) => (
                  <li
                    key={`${selectedSupplier.id}-${purchase.invoiceNumber}-due`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-(--color-muted-text)">
                        {purchase.invoiceNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          paymentStatusClassMap[purchase.paymentStatus] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {purchase.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-(--color-main-text)">{purchase.productList}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Remaining: {currencyFormat(purchase.remainingBalance)}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPaymentForm(selectedSupplier.id, purchase.invoiceNumber)
                        }
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Pay This Invoice
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Purchase History</h4>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                      <th className="pb-2">Invoice Number</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Product List</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Total Purchase Amount</th>
                      <th className="pb-2">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSupplierPurchases.map((purchase) => (
                      <tr
                        key={`${selectedSupplier.id}-${purchase.invoiceNumber}-history`}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-2 font-mono text-xs">{purchase.invoiceNumber}</td>
                        <td className="py-2">{purchase.date}</td>
                        <td className="py-2">{purchase.productList}</td>
                        <td className="py-2">{purchase.quantity}</td>
                        <td className="py-2">{currencyFormat(purchase.totalAmount)}</td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              paymentStatusClassMap[purchase.paymentStatus] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {purchase.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Payment History</h4>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                      <th className="pb-2">Payment ID</th>
                      <th className="pb-2">Invoice Number</th>
                      <th className="pb-2">Amount Paid</th>
                      <th className="pb-2">Payment Method</th>
                      <th className="pb-2">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSupplierPayments.map((payment) => (
                      <tr
                        key={`${selectedSupplier.id}-${payment.id}`}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-2 font-mono text-xs">{payment.id}</td>
                        <td className="py-2 font-mono text-xs">{payment.invoiceNumber}</td>
                        <td className="py-2">{currencyFormat(payment.amountPaid)}</td>
                        <td className="py-2">{payment.paymentMethod}</td>
                        <td className="py-2">{payment.paymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Purchase Orders</h4>
              <ul className="mt-3 space-y-2">
                {selectedSupplierOrders.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No purchase orders for this supplier.
                  </li>
                )}
                {selectedSupplierOrders.map((order) => (
                  <li
                    key={`${selectedSupplier.id}-${order.id}-profile-order`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-(--color-muted-text)">{order.id}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          orderStatusClassMap[order.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-(--color-main-text)">{order.productName}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Qty {order.quantity} • {currencyFormat(order.totalCost)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Supplier Documents</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <label className="h-9 cursor-pointer rounded-lg border border-(--color-border) px-3 text-sm leading-9">
                  Attach Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onSupplierDocumentUpload}
                  />
                </label>
              </div>

              <ul className="mt-3 space-y-2">
                {selectedSupplier.documents.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No supplier documents attached.
                  </li>
                )}
                {selectedSupplier.documents.map((document) => (
                  <li
                    key={`${selectedSupplier.id}-${document.id}`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p>{document.name}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {document.type} • {document.uploadedAt}
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

export default SuppliersPage;
