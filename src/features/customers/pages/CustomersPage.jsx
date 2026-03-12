import { useMemo, useRef, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { currencyFormat } from "../../../utils/currencyFormat.js";

const getDateString = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const getTimestamp = (value) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const createCustomerId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `CUS-${new Date().getFullYear()}-${rand}`;
};

const normalizeText = (value) => String(value || "").trim();

const normalizeNotesFromMultiline = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((note) => note.trim())
    .filter(Boolean);

const getCustomerSpending = (customer) =>
  customer.purchases.reduce(
    (sum, purchase) => sum + Number(purchase.quantity || 0) * Number(purchase.price || 0),
    0,
  );

const getPurchaseUnits = (customer) =>
  customer.purchases.reduce((sum, purchase) => sum + Number(purchase.quantity || 0), 0);

const getLoyaltyTier = (customerType, totalSpending, purchaseInvoices) => {
  if (
    customerType === "VIP" ||
    totalSpending >= 500000 ||
    purchaseInvoices >= 5
  ) {
    return "VIP";
  }

  if (totalSpending >= 250000 || purchaseInvoices >= 3) {
    return "Loyal";
  }

  return "Regular";
};

const getSuggestedDiscount = (loyaltyTier) => {
  if (loyaltyTier === "VIP") return "10%";
  if (loyaltyTier === "Loyal") return "5%";
  return "2%";
};

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const normalizePurchaseEntries = (rawPurchases) => {
  if (!Array.isArray(rawPurchases)) return [];

  return rawPurchases
    .map((purchase, index) => {
      const productName = normalizeText(
        purchase?.productName || purchase?.product || purchase?.name,
      );
      const quantity = Number(purchase?.quantity ?? purchase?.qty ?? 1);
      const price = Number(
        purchase?.price ?? purchase?.unitPrice ?? purchase?.amount ?? 0,
      );
      const invoiceNumber = normalizeText(
        purchase?.invoiceNumber || purchase?.invoice || purchase?.invoiceNo,
      );
      const date = normalizeText(purchase?.date) || getDateString(0);

      if (!productName) return null;

      return {
        invoiceNumber: invoiceNumber || `INV-IMP-${index + 1}`,
        productName,
        quantity: Number.isFinite(quantity) && quantity > 0 ? Math.round(quantity) : 1,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        date,
      };
    })
    .filter(Boolean);
};

const normalizeRepairEntries = (rawRepairs) => {
  if (!Array.isArray(rawRepairs)) return [];

  return rawRepairs
    .map((repair, index) => {
      const deviceModel = normalizeText(repair?.deviceModel || repair?.device);
      const problem = normalizeText(repair?.problem || repair?.issue);
      const status = toTitleCase(normalizeText(repair?.status)) || "Pending";
      const cost = Number(repair?.cost ?? repair?.amount ?? 0);
      const date = normalizeText(repair?.date) || getDateString(0);
      const ticketNumber = normalizeText(
        repair?.ticketNumber || repair?.ticket || repair?.repairId,
      );

      if (!deviceModel && !problem) return null;

      return {
        ticketNumber: ticketNumber || `REP-IMP-${index + 1}`,
        deviceModel: deviceModel || "Unknown Device",
        problem: problem || "General service",
        status,
        cost: Number.isFinite(cost) && cost >= 0 ? cost : 0,
        date,
      };
    })
    .filter(Boolean);
};

const normalizeWarrantyEntries = (rawWarranties) => {
  if (!Array.isArray(rawWarranties)) return [];

  return rawWarranties
    .map((warranty, index) => {
      const productName = normalizeText(
        warranty?.productName || warranty?.product || warranty?.item,
      );
      const expiresOn = normalizeText(
        warranty?.expiresOn || warranty?.expiryDate || warranty?.warrantyEndDate,
      );
      const status = toTitleCase(normalizeText(warranty?.status)) || "Active";

      if (!productName) return null;

      return {
        productName,
        expiresOn: expiresOn || getDateString(365),
        status: status || "Active",
        id: `WAR-IMP-${index + 1}`,
      };
    })
    .filter(Boolean);
};

const DATE_TODAY = getDateString(0);
const DATE_YESTERDAY = getDateString(-1);
const DATE_MINUS_2 = getDateString(-2);
const DATE_MINUS_3 = getDateString(-3);
const DATE_MINUS_4 = getDateString(-4);
const DATE_MINUS_6 = getDateString(-6);
const DATE_MINUS_8 = getDateString(-8);
const DATE_MINUS_12 = getDateString(-12);
const DATE_MINUS_20 = getDateString(-20);
const DATE_MINUS_30 = getDateString(-30);
const DATE_MINUS_45 = getDateString(-45);
const DATE_MINUS_65 = getDateString(-65);

const INITIAL_CUSTOMERS = [
  {
    id: "CUS-1001",
    name: "N. Fernando",
    phone: "0771234567",
    email: "nimal.fernando@gmail.com",
    address: "35 Lake Road, Colombo 05",
    dateOfBirth: "1991-08-17",
    notes: ["Regular customer", "Prefers Samsung phones"],
    customerType: "VIP",
    status: "Active",
    createdDate: DATE_MINUS_30,
    lastVisitDate: DATE_YESTERDAY,
    purchases: [
      {
        invoiceNumber: "INV-560",
        productName: "Samsung Galaxy A55",
        quantity: 1,
        price: 124000,
        date: DATE_MINUS_20,
      },
      {
        invoiceNumber: "INV-571",
        productName: "Fast Charger 25W",
        quantity: 2,
        price: 9500,
        date: DATE_MINUS_6,
      },
      {
        invoiceNumber: "INV-579",
        productName: "Power Bank 20,000mAh",
        quantity: 1,
        price: 14500,
        date: DATE_MINUS_2,
      },
    ],
    repairs: [
      {
        ticketNumber: "REP-228",
        deviceModel: "Samsung A55",
        problem: "Display replacement",
        status: "In Progress",
        cost: 22500,
        date: DATE_MINUS_3,
      },
    ],
    warrantyProducts: [
      { id: "WAR-001", productName: "Samsung Galaxy A55", expiresOn: "2027-02-19", status: "Active" },
      { id: "WAR-002", productName: "Power Bank 20,000mAh", expiresOn: "2026-11-12", status: "Active" },
    ],
  },
  {
    id: "CUS-1002",
    name: "P. Silva",
    phone: "0778899001",
    email: "pradeep.silva@gmail.com",
    address: "14 Temple Lane, Maharagama",
    dateOfBirth: "1988-03-05",
    notes: ["Price sensitive", "Calls before visiting"],
    customerType: "Regular",
    status: "Active",
    createdDate: DATE_TODAY,
    lastVisitDate: DATE_TODAY,
    purchases: [
      {
        invoiceNumber: "INV-583",
        productName: "iPhone 13",
        quantity: 1,
        price: 248000,
        date: DATE_TODAY,
      },
    ],
    repairs: [
      {
        ticketNumber: "REP-231",
        deviceModel: "iPhone 13",
        problem: "Battery replacement",
        status: "Pending",
        cost: 16500,
        date: DATE_TODAY,
      },
    ],
    warrantyProducts: [{ id: "WAR-003", productName: "iPhone 13", expiresOn: "2027-03-12", status: "Active" }],
  },
  {
    id: "CUS-1003",
    name: "K. Deen",
    phone: "0712244880",
    email: "k.deen@outlook.com",
    address: "82 Galle Road, Dehiwala",
    dateOfBirth: "1985-11-09",
    notes: ["Corporate buyer", "Prefers invoice by email"],
    customerType: "VIP",
    status: "Active",
    createdDate: DATE_MINUS_65,
    lastVisitDate: DATE_TODAY,
    purchases: [
      {
        invoiceNumber: "INV-541",
        productName: "iPhone 14 Pro Max",
        quantity: 1,
        price: 385000,
        date: DATE_MINUS_45,
      },
      {
        invoiceNumber: "INV-557",
        productName: "AirPods Pro 2",
        quantity: 1,
        price: 95000,
        date: DATE_MINUS_12,
      },
      {
        invoiceNumber: "INV-562",
        productName: "Apple 20W Charger",
        quantity: 2,
        price: 14500,
        date: DATE_YESTERDAY,
      },
      {
        invoiceNumber: "INV-584",
        productName: "Type-C Cable",
        quantity: 3,
        price: 2500,
        date: DATE_TODAY,
      },
    ],
    repairs: [
      {
        ticketNumber: "REP-203",
        deviceModel: "iPhone 14 Pro Max",
        problem: "Charging port cleaning",
        status: "Completed",
        cost: 3500,
        date: DATE_MINUS_30,
      },
      {
        ticketNumber: "REP-224",
        deviceModel: "AirPods Pro 2",
        problem: "Battery calibration",
        status: "Delivered",
        cost: 7000,
        date: DATE_MINUS_8,
      },
    ],
    warrantyProducts: [
      { id: "WAR-004", productName: "iPhone 14 Pro Max", expiresOn: "2027-01-05", status: "Active" },
      { id: "WAR-005", productName: "AirPods Pro 2", expiresOn: "2026-12-10", status: "Active" },
    ],
  },
  {
    id: "CUS-1004",
    name: "R. Gamage",
    phone: "0701122334",
    email: "r.gamage@gmail.com",
    address: "6A Kandy Road, Kadawatha",
    dateOfBirth: "",
    notes: ["Accessory buyer"],
    customerType: "Regular",
    status: "Active",
    createdDate: DATE_MINUS_8,
    lastVisitDate: DATE_MINUS_2,
    purchases: [
      {
        invoiceNumber: "INV-561",
        productName: "Back Cover",
        quantity: 1,
        price: 3900,
        date: DATE_MINUS_2,
      },
      {
        invoiceNumber: "INV-573",
        productName: "Tempered Glass",
        quantity: 2,
        price: 1500,
        date: DATE_MINUS_4,
      },
    ],
    repairs: [],
    warrantyProducts: [{ id: "WAR-006", productName: "Back Cover", expiresOn: "2026-06-24", status: "Expiring Soon" }],
  },
  {
    id: "CUS-1005",
    name: "M. Nawaz",
    phone: "0765543322",
    email: "nawaz.m@gmail.com",
    address: "90 New Road, Panadura",
    dateOfBirth: "1994-02-28",
    notes: ["Mostly purchases cables"],
    customerType: "Regular",
    status: "Inactive",
    createdDate: DATE_MINUS_65,
    lastVisitDate: DATE_MINUS_45,
    purchases: [
      {
        invoiceNumber: "INV-520",
        productName: "Type-C Cable",
        quantity: 4,
        price: 1900,
        date: DATE_MINUS_45,
      },
    ],
    repairs: [],
    warrantyProducts: [],
  },
  {
    id: "CUS-1006",
    name: "D. Kalan",
    phone: "0749988776",
    email: "dkalan@yahoo.com",
    address: "27 Main Street, Negombo",
    dateOfBirth: "",
    notes: ["Walk-in repair customer"],
    customerType: "Regular",
    status: "Active",
    createdDate: DATE_TODAY,
    lastVisitDate: DATE_TODAY,
    purchases: [],
    repairs: [
      {
        ticketNumber: "REP-230",
        deviceModel: "Redmi Note 12",
        problem: "Speaker replacement",
        status: "Diagnosing",
        cost: 8800,
        date: DATE_TODAY,
      },
    ],
    warrantyProducts: [],
  },
  {
    id: "CUS-1007",
    name: "T. Madushan",
    phone: "0753344556",
    email: "madushan.t@proton.me",
    address: "124 High Level Road, Nugegoda",
    dateOfBirth: "1996-10-10",
    notes: ["Loyal customer", "Interested in warranty extensions"],
    customerType: "VIP",
    status: "Active",
    createdDate: DATE_MINUS_20,
    lastVisitDate: DATE_MINUS_3,
    purchases: [
      {
        invoiceNumber: "INV-548",
        productName: "Samsung S24",
        quantity: 1,
        price: 312000,
        date: DATE_MINUS_20,
      },
      {
        invoiceNumber: "INV-566",
        productName: "Samsung Buds FE",
        quantity: 1,
        price: 28500,
        date: DATE_MINUS_6,
      },
      {
        invoiceNumber: "INV-577",
        productName: "Wireless Charger",
        quantity: 1,
        price: 12000,
        date: DATE_MINUS_3,
      },
    ],
    repairs: [],
    warrantyProducts: [
      { id: "WAR-007", productName: "Samsung S24", expiresOn: "2027-02-21", status: "Active" },
      { id: "WAR-008", productName: "Samsung Buds FE", expiresOn: "2026-10-06", status: "Active" },
    ],
  },
  {
    id: "CUS-1008",
    name: "A. Perera",
    phone: "0786622448",
    email: "amila.perera@mail.com",
    address: "51 Station Road, Gampaha",
    dateOfBirth: "1990-06-15",
    notes: ["Needs reminders for pickups"],
    customerType: "Regular",
    status: "Active",
    createdDate: DATE_MINUS_12,
    lastVisitDate: DATE_MINUS_4,
    purchases: [
      {
        invoiceNumber: "INV-552",
        productName: "Anker 30W Charger",
        quantity: 1,
        price: 9500,
        date: DATE_MINUS_8,
      },
      {
        invoiceNumber: "INV-569",
        productName: "Tempered Glass",
        quantity: 3,
        price: 1200,
        date: DATE_MINUS_4,
      },
    ],
    repairs: [
      {
        ticketNumber: "REP-219",
        deviceModel: "Samsung A34",
        problem: "Charging slow",
        status: "Completed",
        cost: 4900,
        date: DATE_MINUS_6,
      },
      {
        ticketNumber: "REP-223",
        deviceModel: "Samsung A34",
        problem: "Battery drain",
        status: "In Progress",
        cost: 14500,
        date: DATE_MINUS_2,
      },
    ],
    warrantyProducts: [],
  },
];

const CUSTOMER_TYPES = ["Regular", "VIP"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const SEGMENT_FILTERS = [
  { value: "all", label: "All Customers" },
  { value: "frequent", label: "Frequent Customers" },
  { value: "recent", label: "Recent Customers" },
  { value: "repairs", label: "Customers With Repairs" },
  { value: "warranty", label: "Customers With Warranty" },
];

const DEFAULT_CUSTOMER_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  notes: "",
  customerType: "Regular",
  status: "Active",
};

const customerStatusClassMap = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-200 text-slate-700",
};

const repairStatusClassMap = {
  Pending: "bg-amber-100 text-amber-700",
  Diagnosing: "bg-sky-100 text-sky-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Delivered: "bg-slate-200 text-slate-700",
};

const loyaltyBadgeClassMap = {
  VIP: "bg-indigo-100 text-indigo-700",
  Loyal: "bg-emerald-100 text-emerald-700",
  Regular: "bg-slate-100 text-slate-700",
};

function CustomersPage() {
  const importInputRef = useRef(null);

  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [customerForm, setCustomerForm] = useState(DEFAULT_CUSTOMER_FORM);

  const [profileCustomerId, setProfileCustomerId] = useState(null);
  const [profileNote, setProfileNote] = useState("");

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 250);

  const enrichedCustomers = useMemo(
    () =>
      customers.map((customer) => {
        const totalSpending = getCustomerSpending(customer);
        const purchaseInvoices = customer.purchases.length;
        const purchaseUnits = getPurchaseUnits(customer);
        const repairCount = customer.repairs.length;
        const warrantyCount = customer.warrantyProducts.length;
        const loyaltyTier = getLoyaltyTier(
          customer.customerType,
          totalSpending,
          purchaseInvoices,
        );

        return {
          ...customer,
          totalSpending,
          purchaseInvoices,
          purchaseUnits,
          repairCount,
          warrantyCount,
          loyaltyTier,
        };
      }),
    [customers],
  );

  const customerSummary = useMemo(() => {
    const totalCustomers = enrichedCustomers.length;
    const newCustomersToday = enrichedCustomers.filter(
      (customer) => customer.createdDate === DATE_TODAY,
    ).length;
    const repeatCustomers = enrichedCustomers.filter(
      (customer) => customer.purchaseInvoices >= 2,
    ).length;
    const customersWithRepairs = enrichedCustomers.filter(
      (customer) => customer.repairCount > 0,
    ).length;
    const customersWithWarranty = enrichedCustomers.filter(
      (customer) => customer.warrantyCount > 0,
    ).length;

    return {
      totalCustomers,
      newCustomersToday,
      repeatCustomers,
      customersWithRepairs,
      customersWithWarranty,
    };
  }, [enrichedCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const recentThreshold = getTimestamp(getDateString(-30));

    return enrichedCustomers
      .filter((customer) => {
        const matchesSearch =
          term.length === 0 ||
          customer.name.toLowerCase().includes(term) ||
          customer.phone.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term);

        const matchesSegment =
          segmentFilter === "all" ||
          (segmentFilter === "frequent" && customer.purchaseInvoices >= 3) ||
          (segmentFilter === "recent" &&
            getTimestamp(customer.lastVisitDate) >= recentThreshold) ||
          (segmentFilter === "repairs" && customer.repairCount > 0) ||
          (segmentFilter === "warranty" && customer.warrantyCount > 0);

        const matchesType =
          customerTypeFilter === "all" ||
          customer.customerType === customerTypeFilter;

        const matchesStatus =
          statusFilter === "all" || customer.status === statusFilter;

        return matchesSearch && matchesSegment && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const dateDiff = getTimestamp(b.lastVisitDate) - getTimestamp(a.lastVisitDate);
        if (dateDiff !== 0) return dateDiff;
        return a.name.localeCompare(b.name);
      });
  }, [
    enrichedCustomers,
    debouncedSearch,
    segmentFilter,
    customerTypeFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  const selectedCustomer = useMemo(
    () => enrichedCustomers.find((customer) => customer.id === profileCustomerId) || null,
    [enrichedCustomers, profileCustomerId],
  );

  const selectedRecentTransactions = useMemo(() => {
    if (!selectedCustomer) return [];

    return [...selectedCustomer.purchases]
      .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
      .slice(0, 5);
  }, [selectedCustomer]);

  const customerAnalytics = useMemo(() => {
    const topCustomers = [...enrichedCustomers]
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, 5);

    const mostFrequentBuyers = [...enrichedCustomers]
      .sort((a, b) => b.purchaseInvoices - a.purchaseInvoices)
      .slice(0, 5);

    const monthlyMap = new Map();

    enrichedCustomers.forEach((customer) => {
      customer.purchases.forEach((purchase) => {
        const month = purchase.date.slice(0, 7);
        const amount = Number(purchase.quantity || 0) * Number(purchase.price || 0);
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + amount);
      });
    });

    const purchaseTrends = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const highestTrendValue = purchaseTrends.reduce(
      (max, trend) => Math.max(max, trend.total),
      0,
    );

    const vipCustomers = enrichedCustomers.filter(
      (customer) => customer.customerType === "VIP" || customer.loyaltyTier === "VIP",
    );

    return {
      topCustomers,
      mostFrequentBuyers,
      purchaseTrends,
      highestTrendValue,
      vipCustomers,
    };
  }, [enrichedCustomers]);

  const updateCustomerById = (customerId, updater) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? updater(customer) : customer,
      ),
    );
  };

  const onOpenCreateForm = () => {
    setEditingCustomerId(null);
    setCustomerForm(DEFAULT_CUSTOMER_FORM);
    setFormOpen(true);
  };

  const onOpenEditForm = (customer) => {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth || "",
      notes: customer.notes.join("\n"),
      customerType: customer.customerType,
      status: customer.status,
    });
    setFormOpen(true);
  };

  const onCloseForm = () => {
    setFormOpen(false);
    setEditingCustomerId(null);
    setCustomerForm(DEFAULT_CUSTOMER_FORM);
  };

  const onCustomerFormChange = (event) => {
    const { name, value } = event.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitCustomerForm = (event) => {
    event.preventDefault();

    const name = normalizeText(customerForm.name);
    const phone = normalizeText(customerForm.phone);
    const email = normalizeText(customerForm.email);
    const address = normalizeText(customerForm.address);
    const notes = normalizeNotesFromMultiline(customerForm.notes);

    if (!name || !phone) {
      setFeedbackMessage("Customer name and phone number are required.");
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setFeedbackMessage("Enter a valid email address.");
      return;
    }

    if (editingCustomerId) {
      updateCustomerById(editingCustomerId, (customer) => ({
        ...customer,
        name,
        phone,
        email,
        address,
        dateOfBirth: customerForm.dateOfBirth,
        notes,
        customerType: customerForm.customerType,
        status: customerForm.status,
      }));

      setFeedbackMessage(`Customer ${editingCustomerId} updated.`);
    } else {
      const customerId = createCustomerId();

      setCustomers((prev) => [
        {
          id: customerId,
          name,
          phone,
          email,
          address,
          dateOfBirth: customerForm.dateOfBirth,
          notes,
          customerType: customerForm.customerType,
          status: customerForm.status,
          createdDate: DATE_TODAY,
          lastVisitDate: DATE_TODAY,
          purchases: [],
          repairs: [],
          warrantyProducts: [],
        },
        ...prev,
      ]);

      setFeedbackMessage(`Customer created: ${customerId}`);
    }

    onCloseForm();
  };

  const onDeleteCustomer = (customer) => {
    const shouldDelete = window.confirm(
      `Delete customer "${customer.name}" from the list?`,
    );

    if (!shouldDelete) return;

    setCustomers((prev) => prev.filter((item) => item.id !== customer.id));

    if (profileCustomerId === customer.id) {
      setProfileCustomerId(null);
      setProfileNote("");
    }

    setFeedbackMessage(`Customer deleted: ${customer.id}`);
  };

  const onOpenProfile = (customerId) => {
    setProfileCustomerId(customerId);
    setProfileNote("");
  };

  const onAddProfileNote = () => {
    if (!selectedCustomer) return;

    const note = normalizeText(profileNote);
    if (!note) {
      setFeedbackMessage("Type a note before adding.");
      return;
    }

    updateCustomerById(selectedCustomer.id, (customer) => ({
      ...customer,
      notes: [note, ...customer.notes],
    }));

    setProfileNote("");
    setFeedbackMessage(`Note added for ${selectedCustomer.name}.`);
  };

  const onSendCommunication = (channel) => {
    if (!selectedCustomer) return;
    setFeedbackMessage(`${channel} queued for ${selectedCustomer.name}.`);
  };

  const onExportCustomers = () => {
    if (customers.length === 0) {
      setFeedbackMessage("No customers available to export.");
      return;
    }

    const headers = [
      "customerId",
      "name",
      "phone",
      "email",
      "totalPurchases",
      "totalRepairs",
      "lastVisitDate",
      "status",
      "customerType",
      "address",
      "dateOfBirth",
      "notes",
    ];

    const rows = customers.map((customer) =>
      [
        customer.id,
        customer.name,
        customer.phone,
        customer.email,
        getCustomerSpending(customer),
        customer.repairs.length,
        customer.lastVisitDate,
        customer.status,
        customer.customerType,
        customer.address,
        customer.dateOfBirth,
        customer.notes.join(" | "),
      ]
        .map(escapeCsvCell)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "customers-export.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Customer list exported to CSV.");
  };

  const onBackupCustomers = () => {
    if (customers.length === 0) {
      setFeedbackMessage("No customers available for backup.");
      return;
    }

    const backup = JSON.stringify(customers, null, 2);
    const blob = new Blob([backup], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "customers-backup.json";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Customer database backup downloaded.");
  };

  const onImportCustomers = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "").trim();
        if (!text) {
          setFeedbackMessage("Import file is empty.");
          return;
        }

        let importedCustomers = [];
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".json")) {
          const data = JSON.parse(text);
          if (!Array.isArray(data)) {
            setFeedbackMessage("JSON import must be an array of customers.");
            return;
          }

          importedCustomers = data
            .map((item, index) => {
              const name = normalizeText(item?.name || item?.customerName);
              const phone = normalizeText(item?.phone || item?.phoneNumber);

              if (!name || !phone) return null;

              const notes = Array.isArray(item?.notes)
                ? item.notes.map((note) => normalizeText(note)).filter(Boolean)
                : normalizeText(item?.notes)
                    .split("|")
                    .map((note) => note.trim())
                    .filter(Boolean);

              return {
                id: normalizeText(item?.id) || `CUS-IMP-${Date.now()}-${index}`,
                name,
                phone,
                email: normalizeText(item?.email),
                address: normalizeText(item?.address),
                dateOfBirth: normalizeText(item?.dateOfBirth),
                notes,
                customerType:
                  toTitleCase(item?.customerType) === "Vip" ? "VIP" : "Regular",
                status: toTitleCase(item?.status) === "Inactive" ? "Inactive" : "Active",
                createdDate: normalizeText(item?.createdDate) || DATE_TODAY,
                lastVisitDate: normalizeText(item?.lastVisitDate) || DATE_TODAY,
                purchases: normalizePurchaseEntries(item?.purchases),
                repairs: normalizeRepairEntries(item?.repairs),
                warrantyProducts: normalizeWarrantyEntries(item?.warrantyProducts),
              };
            })
            .filter(Boolean);
        } else {
          const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

          if (lines.length < 2) {
            setFeedbackMessage("CSV has no data rows.");
            return;
          }

          const headers = parseCsvLine(lines[0]).map((header) =>
            header.toLowerCase().trim(),
          );

          const getValue = (cells, aliases) => {
            for (const key of aliases) {
              const index = headers.indexOf(key);
              if (index >= 0) {
                return normalizeText(cells[index]);
              }
            }
            return "";
          };

          importedCustomers = lines
            .slice(1)
            .map((line, index) => {
              const cells = parseCsvLine(line);
              const name = getValue(cells, ["name", "customername", "customer name"]);
              const phone = getValue(cells, ["phone", "phonenumber", "phone number"]);

              if (!name || !phone) return null;

              const customerType = toTitleCase(
                getValue(cells, ["customertype", "customer type"]),
              );
              const status = toTitleCase(getValue(cells, ["status"]));
              const noteText = getValue(cells, ["notes", "note"]);

              return {
                id:
                  getValue(cells, ["customerid", "customer id", "id"]) ||
                  `CUS-IMP-${Date.now()}-${index}`,
                name,
                phone,
                email: getValue(cells, ["email", "emailaddress", "email address"]),
                address: getValue(cells, ["address"]),
                dateOfBirth: getValue(cells, ["dateofbirth", "date of birth", "dob"]),
                notes: noteText
                  .split("|")
                  .map((note) => note.trim())
                  .filter(Boolean),
                customerType: customerType === "Vip" ? "VIP" : "Regular",
                status: status === "Inactive" ? "Inactive" : "Active",
                createdDate: DATE_TODAY,
                lastVisitDate:
                  getValue(cells, ["lastvisitdate", "last visit date"]) || DATE_TODAY,
                purchases: [],
                repairs: [],
                warrantyProducts: [],
              };
            })
            .filter(Boolean);
        }

        if (importedCustomers.length === 0) {
          setFeedbackMessage("No valid customers found in file.");
          return;
        }

        let importedCount = 0;
        setCustomers((prev) => {
          const existingPhones = new Set(prev.map((customer) => customer.phone));
          const existingIds = new Set(prev.map((customer) => customer.id));

          const unique = importedCustomers.filter((customer) => {
            if (existingPhones.has(customer.phone)) return false;

            let customerId = customer.id || createCustomerId();
            while (existingIds.has(customerId)) {
              customerId = createCustomerId();
            }

            existingIds.add(customerId);
            existingPhones.add(customer.phone);
            customer.id = customerId;

            return true;
          });

          importedCount = unique.length;
          return unique.length > 0 ? [...unique, ...prev] : prev;
        });

        if (importedCount === 0) {
          setFeedbackMessage("All imported customers already exist.");
        } else {
          setFeedbackMessage(`${importedCount} customers imported.`);
        }
      } catch {
        setFeedbackMessage("Unable to import file. Check JSON/CSV format.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Customer Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Manage customer records, purchase history, repairs, warranty details,
              and loyalty relationships in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportCustomers}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Export Customers
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Import Data
            </button>
            <button
              type="button"
              onClick={onBackupCustomers}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Backup DB
            </button>
            <button
              type="button"
              onClick={onOpenCreateForm}
              className="h-9 rounded-lg bg-(--color-main-text) px-3 text-sm font-medium text-white"
            >
              Add Customer
            </button>
          </div>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".csv,.json,application/json,text/csv"
          className="hidden"
          onChange={onImportCustomers}
        />
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
            Total Customers
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {customerSummary.totalCustomers}
          </p>
        </article>

        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-sky-700">
            New Customers Today
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">
            {customerSummary.newCustomersToday}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
            Repeat Customers
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {customerSummary.repeatCustomers}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-amber-700">
            Customers With Repairs
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {customerSummary.customersWithRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-indigo-700">
            Customers With Warranty
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-700">
            {customerSummary.customersWithWarranty}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Search & Filters
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Search Customer
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Name / Phone / Email"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Segment
            <select
              value={segmentFilter}
              onChange={(event) => {
                setSegmentFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              {SEGMENT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Customer Type
            <select
              value={customerTypeFilter}
              onChange={(event) => {
                setCustomerTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All Types</option>
              {CUSTOMER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
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
                setSegmentFilter("all");
                setCustomerTypeFilter("all");
                setStatusFilter("all");
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
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1150px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-3">Customer ID</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Total Purchases</th>
                <th className="pb-3">Total Repairs</th>
                <th className="pb-3">Last Visit Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-(--color-border)">
                  <td className="py-3 align-top font-mono text-xs">{customer.id}</td>
                  <td className="py-3 align-top">
                    <p className="font-medium text-(--color-main-text)">
                      {customer.name}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {customer.customerType}
                    </p>
                  </td>
                  <td className="py-3 align-top">{customer.phone}</td>
                  <td className="py-3 align-top">{customer.email || "-"}</td>
                  <td className="py-3 align-top">
                    <p className="font-medium text-(--color-main-text)">
                      {currencyFormat(customer.totalSpending)}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {customer.purchaseInvoices} invoices
                    </p>
                  </td>
                  <td className="py-3 align-top">{customer.repairCount}</td>
                  <td className="py-3 align-top">{customer.lastVisitDate}</td>
                  <td className="py-3 align-top">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        customerStatusClassMap[customer.status]
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenProfile(customer.id)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditForm(customer)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomer(customer)}
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

        <ul className="space-y-3 md:hidden">
          {paginatedCustomers.map((customer) => (
            <li
              key={`${customer.id}-mobile`}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-(--color-main-text)">
                    {customer.name}
                  </p>
                  <p className="text-xs font-mono text-(--color-muted-text)">
                    {customer.id}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    customerStatusClassMap[customer.status]
                  }`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="mt-2 grid gap-1 text-xs text-(--color-muted-text)">
                <p>{customer.phone}</p>
                <p>{customer.email || "No email"}</p>
                <p>
                  Purchases: {currencyFormat(customer.totalSpending)} • Repairs:{" "}
                  {customer.repairCount}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onOpenProfile(customer.id)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditForm(customer)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCustomer(customer)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs text-rose-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {paginatedCustomers.length === 0 && (
          <p className="py-6 text-sm text-(--color-muted-text)">
            No customers found with the selected filters.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-muted-text)">
            Showing {filteredCustomers.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, filteredCustomers.length)} of{" "}
            {filteredCustomers.length}
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

      <section className="grid min-w-0 gap-4 xl:grid-cols-3">
        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Top Customers
          </h3>
          <ul className="mt-3 space-y-2">
            {customerAnalytics.topCustomers.map((customer) => (
              <li
                key={`top-${customer.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-(--color-main-text)">
                    {customer.name}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      loyaltyBadgeClassMap[customer.loyaltyTier]
                    }`}
                  >
                    {customer.loyaltyTier}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Spending: {currencyFormat(customer.totalSpending)}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Most Frequent Buyers
          </h3>
          <ul className="mt-3 space-y-2">
            {customerAnalytics.mostFrequentBuyers.map((customer) => (
              <li
                key={`frequent-${customer.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">{customer.name}</p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {customer.purchaseInvoices} purchase invoices •{" "}
                  {customer.purchaseUnits} items
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Customer Purchase Trends
          </h3>

          <div className="mt-3 space-y-2">
            {customerAnalytics.purchaseTrends.length === 0 && (
              <p className="text-sm text-(--color-muted-text)">
                No purchase trend data available.
              </p>
            )}

            {customerAnalytics.purchaseTrends.map((trend) => {
              const percent =
                customerAnalytics.highestTrendValue > 0
                  ? Math.round((trend.total / customerAnalytics.highestTrendValue) * 100)
                  : 0;

              return (
                <div key={trend.month} className="rounded-lg border border-(--color-border) p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-(--color-main-text)">
                      {trend.month}
                    </span>
                    <span className="text-(--color-muted-text)">
                      {currencyFormat(trend.total)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-(--color-menu-btn-hover)">
                    <div
                      className="h-2 rounded-full bg-(--color-accent)"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-menu-btn-hover) p-3 text-sm">
            <p className="font-medium text-(--color-main-text)">
              Loyalty / VIP Customers
            </p>
            <p className="mt-1 text-(--color-muted-text)">
              {customerAnalytics.vipCustomers.length} customers currently match VIP
              criteria.
            </p>
          </div>
        </article>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingCustomerId ? "Edit Customer" : "Add Customer"}
              </h3>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitCustomerForm}>
              <label className="grid gap-1 text-sm font-medium">
                Customer Name
                <input
                  required
                  name="name"
                  value={customerForm.name}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Phone Number
                <input
                  required
                  name="phone"
                  value={customerForm.phone}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Email Address
                <input
                  name="email"
                  value={customerForm.email}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Date of Birth
                <input
                  type="date"
                  name="dateOfBirth"
                  value={customerForm.dateOfBirth}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Customer Type
                <select
                  name="customerType"
                  value={customerForm.customerType}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {CUSTOMER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Status
                <select
                  name="status"
                  value={customerForm.status}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Address
                <input
                  name="address"
                  value={customerForm.address}
                  onChange={onCustomerFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Notes
                <textarea
                  name="notes"
                  value={customerForm.notes}
                  onChange={onCustomerFormChange}
                  rows={3}
                  placeholder="One note per line"
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  {editingCustomerId ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-4xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Customer Profile - {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setProfileCustomerId(null);
                  setProfileNote("");
                }}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-(--color-main-text)">
                    {selectedCustomer.name}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {selectedCustomer.phone} • {selectedCustomer.email || "No email"}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {selectedCustomer.address || "No address"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      customerStatusClassMap[selectedCustomer.status]
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      loyaltyBadgeClassMap[selectedCustomer.loyaltyTier]
                    }`}
                  >
                    {selectedCustomer.loyaltyTier}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Total Spending
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {currencyFormat(selectedCustomer.totalSpending)}
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Purchases
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {selectedCustomer.purchaseInvoices} invoices
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Repairs
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {selectedCustomer.repairCount} jobs
                  </p>
                </div>
                <div className="rounded-lg border border-(--color-border) p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    Last Visit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                    {selectedCustomer.lastVisitDate}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Customer Communication
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSendCommunication("SMS")}
                  className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
                >
                  Send SMS
                </button>
                <button
                  type="button"
                  onClick={() => onSendCommunication("Email")}
                  className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
                >
                  Send Email
                </button>
                <button
                  type="button"
                  onClick={() => onSendCommunication("Repair Status Notification")}
                  className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
                >
                  Notify Repair Status
                </button>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Customer Notes</h4>
              <ul className="mt-3 space-y-2">
                {selectedCustomer.notes.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">No notes added yet.</li>
                )}
                {selectedCustomer.notes.map((note, index) => (
                  <li
                    key={`${selectedCustomer.id}-note-${index}`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    {note}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={profileNote}
                  onChange={(event) => setProfileNote(event.target.value)}
                  placeholder="Add a new note"
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={onAddProfileNote}
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Add Note
                </button>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Loyalty / VIP Insight
              </h4>
              <p className="mt-2 text-sm text-(--color-muted-text)">
                Suggested loyalty discount:{" "}
                <span className="font-semibold text-(--color-main-text)">
                  {getSuggestedDiscount(selectedCustomer.loyaltyTier)}
                </span>
              </p>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Purchase History</h4>

              <ul className="mt-3 space-y-2 sm:hidden">
                {selectedCustomer.purchases.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No purchases found for this customer.
                  </li>
                )}
                {selectedCustomer.purchases.map((purchase) => (
                  <li
                    key={`${selectedCustomer.id}-${purchase.invoiceNumber}-mobile`}
                    className="rounded-lg border border-(--color-border) p-3 text-sm"
                  >
                    <p className="font-medium text-(--color-main-text)">
                      {purchase.productName}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Invoice: {purchase.invoiceNumber}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Qty {purchase.quantity} • {purchase.date}
                    </p>
                    <p className="mt-1 font-semibold text-(--color-main-text)">
                      {currencyFormat(purchase.price * purchase.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-3 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                      <th className="pb-2">Product Name</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Invoice Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.purchases.map((purchase) => (
                      <tr
                        key={`${selectedCustomer.id}-${purchase.invoiceNumber}-table`}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-2">{purchase.productName}</td>
                        <td className="py-2">{purchase.quantity}</td>
                        <td className="py-2">
                          {currencyFormat(purchase.price * purchase.quantity)}
                        </td>
                        <td className="py-2">{purchase.date}</td>
                        <td className="py-2 font-mono text-xs">
                          {purchase.invoiceNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Repair History</h4>

              <ul className="mt-3 space-y-2 sm:hidden">
                {selectedCustomer.repairs.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No repairs found for this customer.
                  </li>
                )}
                {selectedCustomer.repairs.map((repair) => (
                  <li
                    key={`${selectedCustomer.id}-${repair.ticketNumber}-mobile`}
                    className="rounded-lg border border-(--color-border) p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-(--color-main-text)">
                        {repair.deviceModel}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          repairStatusClassMap[repair.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {repair.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {repair.ticketNumber} • {repair.problem}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {repair.date}
                    </p>
                    <p className="mt-1 font-semibold text-(--color-main-text)">
                      {currencyFormat(repair.cost)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-3 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                      <th className="pb-2">Repair Ticket</th>
                      <th className="pb-2">Device Model</th>
                      <th className="pb-2">Problem</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Cost</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.repairs.map((repair) => (
                      <tr
                        key={`${selectedCustomer.id}-${repair.ticketNumber}-table`}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-2 font-mono text-xs">{repair.ticketNumber}</td>
                        <td className="py-2">{repair.deviceModel}</td>
                        <td className="py-2">{repair.problem}</td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              repairStatusClassMap[repair.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {repair.status}
                          </span>
                        </td>
                        <td className="py-2">{currencyFormat(repair.cost)}</td>
                        <td className="py-2">{repair.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Warranty Products</h4>

              <ul className="mt-3 space-y-2">
                {selectedCustomer.warrantyProducts.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No active warranty products.
                  </li>
                )}
                {selectedCustomer.warrantyProducts.map((item) => (
                  <li
                    key={`${selectedCustomer.id}-${item.id}`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-(--color-main-text)">
                        {item.productName}
                      </p>
                      <span className="text-xs text-(--color-muted-text)">
                        {item.expiresOn}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      Warranty: {item.status}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Recent Transactions
              </h4>

              <ul className="mt-3 space-y-2">
                {selectedRecentTransactions.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No recent transactions.
                  </li>
                )}
                {selectedRecentTransactions.map((transaction) => (
                  <li
                    key={`${selectedCustomer.id}-${transaction.invoiceNumber}-recent`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-(--color-main-text)">
                        {transaction.invoiceNumber}
                      </p>
                      <p className="text-xs text-(--color-muted-text)">
                        {transaction.date}
                      </p>
                    </div>
                    <p className="mt-1 text-(--color-main-text)">
                      {transaction.productName}
                    </p>
                    <p className="mt-1 font-semibold text-(--color-main-text)">
                      {currencyFormat(transaction.price * transaction.quantity)}
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

export default CustomersPage;
