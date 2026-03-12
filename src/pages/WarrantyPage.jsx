import { useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { currencyFormat } from "../utils/currencyFormat.js";

const CATEGORY_OPTIONS = [
  "Mobile Phones",
  "Accessories",
  "Tablets",
  "Audio",
  "Wearables",
];

const WARRANTY_TYPES = ["Manufacturer", "Store Warranty"];

const WARRANTY_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "claim_processing", label: "Claim Processing" },
  { value: "completed", label: "Completed" },
];

const CLAIM_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "In Repair",
  "Completed",
];

const WARRANTY_LIFECYCLE_STATUSES = [
  "Active",
  "Expiring Soon",
  "Expired",
  "Claim Processing",
  "Completed",
];

const EXTENSION_OPTIONS = [
  { label: "Extend by 6 months", months: 6, price: 7500 },
  { label: "Extend by 1 year", months: 12, price: 12000 },
];

const DOCUMENT_TYPES = ["Warranty Card", "Invoice", "Product Receipt"];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
};

const getTodayString = () => formatDate(new Date());

const getDateString = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
};

const dateToTimestamp = (dateString) => {
  const parsed = Date.parse(`${dateString}T12:00:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getDaysUntil = (dateString) => {
  const today = dateToTimestamp(getTodayString());
  const target = dateToTimestamp(dateString);
  if (target === 0) return -9999;
  return Math.floor((target - today) / (1000 * 60 * 60 * 24));
};

const addMonthsToDate = (dateString, months) => {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
};

const calculateBaseStatus = (warranty) => {
  const daysUntilExpiry = getDaysUntil(warranty.expiryDate);

  if (daysUntilExpiry < 0) return "Expired";
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  return "Active";
};

const getWarrantyLifecycleStatus = (warranty, relatedClaims) => {
  const hasOpenClaim = relatedClaims.some((claim) =>
    ["Pending", "Approved", "In Repair"].includes(claim.status),
  );

  const hasCompletedClaim = relatedClaims.some(
    (claim) => claim.status === "Completed",
  );

  if (warranty.lifecycleStatus === "Claim Processing" || hasOpenClaim) {
    return "Claim Processing";
  }

  if (warranty.lifecycleStatus === "Completed" || hasCompletedClaim) {
    return "Completed";
  }

  if (["Active", "Expiring Soon", "Expired"].includes(warranty.lifecycleStatus)) {
    return warranty.lifecycleStatus;
  }

  return calculateBaseStatus(warranty);
};

const mapLifecycleToFilter = (status) => {
  if (status === "Active") return "active";
  if (status === "Expiring Soon") return "expiring";
  if (status === "Expired") return "expired";
  if (status === "Claim Processing") return "claim_processing";
  if (status === "Completed") return "completed";
  return "active";
};

const warrantyStatusClassMap = {
  Active: "bg-emerald-100 text-emerald-700",
  "Expiring Soon": "bg-amber-100 text-amber-700",
  Expired: "bg-rose-100 text-rose-700",
  "Claim Processing": "bg-sky-100 text-sky-700",
  Completed: "bg-slate-200 text-slate-700",
};

const claimStatusClassMap = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
  Rejected: "bg-rose-100 text-rose-700",
  "In Repair": "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const getIssueCategory = (issueDescription) => {
  const text = String(issueDescription || "").toLowerCase();

  if (text.includes("screen") || text.includes("display")) return "Screen Issues";
  if (text.includes("battery")) return "Battery Issues";
  if (text.includes("charging") || text.includes("port")) return "Charging Issues";
  if (text.includes("camera")) return "Camera Issues";
  if (text.includes("speaker") || text.includes("audio")) return "Audio Issues";

  return "Other Issues";
};

const createWarrantyId = () => {
  const random = Math.floor(Math.random() * 900 + 100);
  return `WAR-${new Date().getFullYear()}-${random}`;
};

const createClaimId = () => {
  const random = Math.floor(Math.random() * 900 + 100);
  return `CLM-${new Date().getFullYear()}-${random}`;
};

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const INITIAL_WARRANTIES = [
  {
    id: "WAR-2026-101",
    invoiceNumber: "INV-562",
    productName: "iPhone 14 Pro Max",
    category: "Mobile Phones",
    customerName: "K. Deen",
    customerPhone: "0712244880",
    serialNumber: "IMEI-359182840001",
    purchaseDate: getDateString(-75),
    warrantyDurationMonths: 12,
    expiryDate: addMonthsToDate(getDateString(-75), 12),
    warrantyType: "Manufacturer",
    lifecycleStatus: "Active",
    terms:
      "Covers manufacturing defects. Physical damage, liquid damage, and unauthorized repairs are excluded.",
    extensionHistory: [],
    documents: [
      {
        id: "DOC-101",
        type: "Invoice",
        name: "inv-562.pdf",
        uploadedAt: `${getTodayString()} 09:20`,
      },
      {
        id: "DOC-102",
        type: "Warranty Card",
        name: "iphone14-warranty-card.jpg",
        uploadedAt: `${getTodayString()} 09:21`,
      },
    ],
    repairHistory: [
      {
        id: "RHR-001",
        date: getDateString(-30),
        detail: "Charging port cleaned under warranty",
        status: "Completed",
      },
    ],
  },
  {
    id: "WAR-2026-102",
    invoiceNumber: "INV-561",
    productName: "Samsung Galaxy A55",
    category: "Mobile Phones",
    customerName: "R. Gamage",
    customerPhone: "0701122334",
    serialNumber: "IMEI-352785660192",
    purchaseDate: getDateString(-28),
    warrantyDurationMonths: 12,
    expiryDate: addMonthsToDate(getDateString(-28), 12),
    warrantyType: "Manufacturer",
    lifecycleStatus: "Active",
    terms: "Manufacturer warranty for hardware and software defects.",
    extensionHistory: [],
    documents: [
      {
        id: "DOC-103",
        type: "Invoice",
        name: "inv-561.pdf",
        uploadedAt: `${getDateString(-28)} 12:10`,
      },
    ],
    repairHistory: [],
  },
  {
    id: "WAR-2026-103",
    invoiceNumber: "INV-559",
    productName: "AirPods Pro 2",
    category: "Audio",
    customerName: "D. Kalan",
    customerPhone: "0749988776",
    serialNumber: "SN-APP-229913",
    purchaseDate: getDateString(-340),
    warrantyDurationMonths: 12,
    expiryDate: addMonthsToDate(getDateString(-340), 12),
    warrantyType: "Store Warranty",
    lifecycleStatus: "Expiring Soon",
    terms: "Store warranty covers battery and charging case defects.",
    extensionHistory: [
      {
        id: "EXT-101",
        months: 6,
        amount: 7500,
        extendedAt: getDateString(-12),
      },
    ],
    documents: [],
    repairHistory: [],
  },
  {
    id: "WAR-2026-104",
    invoiceNumber: "INV-538",
    productName: "Xiaomi Redmi Note 12",
    category: "Mobile Phones",
    customerName: "A. Perera",
    customerPhone: "0786622448",
    serialNumber: "IMEI-867459210113",
    purchaseDate: getDateString(-430),
    warrantyDurationMonths: 12,
    expiryDate: addMonthsToDate(getDateString(-430), 12),
    warrantyType: "Manufacturer",
    lifecycleStatus: "Expired",
    terms: "Manufacturer standard coverage.",
    extensionHistory: [],
    documents: [
      {
        id: "DOC-104",
        type: "Product Receipt",
        name: "redmi-note12-receipt.jpg",
        uploadedAt: `${getDateString(-430)} 14:04`,
      },
    ],
    repairHistory: [
      {
        id: "RHR-002",
        date: getDateString(-220),
        detail: "Battery replacement completed",
        status: "Completed",
      },
    ],
  },
  {
    id: "WAR-2026-105",
    invoiceNumber: "INV-574",
    productName: "Anker 30W Fast Charger",
    category: "Accessories",
    customerName: "N. Fernando",
    customerPhone: "0771234567",
    serialNumber: "SN-ANK-A2633-7722",
    purchaseDate: getDateString(-95),
    warrantyDurationMonths: 6,
    expiryDate: addMonthsToDate(getDateString(-95), 6),
    warrantyType: "Store Warranty",
    lifecycleStatus: "Active",
    terms: "Store warranty valid for manufacturing defects and charging issues.",
    extensionHistory: [],
    documents: [],
    repairHistory: [],
  },
  {
    id: "WAR-2026-106",
    invoiceNumber: "INV-580",
    productName: "iPad Air",
    category: "Tablets",
    customerName: "M. Perera",
    customerPhone: "0716789345",
    serialNumber: "SN-IPAD-AIR-2231",
    purchaseDate: getDateString(-180),
    warrantyDurationMonths: 12,
    expiryDate: addMonthsToDate(getDateString(-180), 12),
    warrantyType: "Manufacturer",
    lifecycleStatus: "Claim Processing",
    terms: "Manufacturer warranty covers hardware defects only.",
    extensionHistory: [],
    documents: [
      {
        id: "DOC-105",
        type: "Warranty Card",
        name: "ipad-air-warranty.pdf",
        uploadedAt: `${getDateString(-179)} 10:33`,
      },
    ],
    repairHistory: [
      {
        id: "RHR-003",
        date: getDateString(-5),
        detail: "Speaker module inspection ongoing",
        status: "In Repair",
      },
    ],
  },
];

const INITIAL_CLAIMS = [
  {
    id: "CLM-2026-201",
    warrantyId: "WAR-2026-106",
    deviceModel: "iPad Air",
    issueDescription: "No sound from bottom speaker",
    claimDate: getDateString(-5),
    status: "In Repair",
    technicianAssigned: "Dilan",
    claimNotes: "Spare part ordered",
  },
  {
    id: "CLM-2026-202",
    warrantyId: "WAR-2026-103",
    deviceModel: "AirPods Pro 2",
    issueDescription: "Left bud battery drains quickly",
    claimDate: getDateString(-2),
    status: "Pending",
    technicianAssigned: "Ishara",
    claimNotes: "Awaiting inspection",
  },
  {
    id: "CLM-2026-203",
    warrantyId: "WAR-2026-101",
    deviceModel: "iPhone 14 Pro Max",
    issueDescription: "Charging issue",
    claimDate: getDateString(-20),
    status: "Completed",
    technicianAssigned: "Kamal",
    claimNotes: "Charging port replaced",
  },
];

const DEFAULT_WARRANTY_FORM = {
  invoiceNumber: "",
  productName: "",
  category: CATEGORY_OPTIONS[0],
  customerName: "",
  customerPhone: "",
  serialNumber: "",
  purchaseDate: getTodayString(),
  warrantyDurationMonths: "12",
  warrantyType: WARRANTY_TYPES[0],
  terms: "Standard warranty coverage for manufacturing defects.",
};

const DEFAULT_CLAIM_FORM = {
  warrantyId: "",
  deviceModel: "",
  issueDescription: "",
  claimDate: getTodayString(),
  status: "Pending",
  technicianAssigned: "",
  claimNotes: "",
};

function WarrantyPage() {
  const [warranties, setWarranties] = useState(INITIAL_WARRANTIES);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [isWarrantyFormOpen, setWarrantyFormOpen] = useState(false);
  const [editingWarrantyId, setEditingWarrantyId] = useState(null);
  const [warrantyForm, setWarrantyForm] = useState(DEFAULT_WARRANTY_FORM);

  const [isClaimFormOpen, setClaimFormOpen] = useState(false);
  const [claimForm, setClaimForm] = useState(DEFAULT_CLAIM_FORM);

  const [detailsWarrantyId, setDetailsWarrantyId] = useState(null);
  const [extensionOptionMonths, setExtensionOptionMonths] = useState(
    String(EXTENSION_OPTIONS[0].months),
  );
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 250);

  const warrantyMap = useMemo(
    () => new Map(warranties.map((warranty) => [warranty.id, warranty])),
    [warranties],
  );

  const warrantiesWithStatus = useMemo(
    () =>
      warranties.map((warranty) => {
        const relatedClaims = claims.filter(
          (claim) => claim.warrantyId === warranty.id,
        );

        const baseStatus = calculateBaseStatus(warranty);
        const lifecycleStatus = getWarrantyLifecycleStatus(warranty, relatedClaims);

        return {
          ...warranty,
          baseStatus,
          lifecycleStatus,
          claimCount: relatedClaims.length,
          latestClaim:
            relatedClaims.slice().sort((a, b) => dateToTimestamp(b.claimDate) - dateToTimestamp(a.claimDate))[0] ||
            null,
        };
      }),
    [warranties, claims],
  );

  const warrantySummary = useMemo(() => {
    const totalWarrantyItems = warrantiesWithStatus.length;
    const activeWarranties = warrantiesWithStatus.filter(
      (warranty) => warranty.baseStatus === "Active",
    ).length;
    const expiredWarranties = warrantiesWithStatus.filter(
      (warranty) => warranty.baseStatus === "Expired",
    ).length;
    const expiringSoon = warrantiesWithStatus.filter(
      (warranty) => warranty.baseStatus === "Expiring Soon",
    ).length;
    const warrantyClaims = claims.length;

    return {
      totalWarrantyItems,
      activeWarranties,
      expiredWarranties,
      expiringSoon,
      warrantyClaims,
    };
  }, [warrantiesWithStatus, claims]);

  const filteredWarranties = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return warrantiesWithStatus.filter((warranty) => {
      const matchesSearch =
        term.length === 0 ||
        warranty.customerName.toLowerCase().includes(term) ||
        warranty.customerPhone.toLowerCase().includes(term) ||
        warranty.productName.toLowerCase().includes(term) ||
        warranty.serialNumber.toLowerCase().includes(term) ||
        warranty.invoiceNumber.toLowerCase().includes(term) ||
        warranty.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        mapLifecycleToFilter(warranty.lifecycleStatus) === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || warranty.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [warrantiesWithStatus, debouncedSearch, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredWarranties.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedWarranties = filteredWarranties.slice(startIndex, startIndex + pageSize);

  const selectedWarranty = useMemo(
    () => warrantiesWithStatus.find((warranty) => warranty.id === detailsWarrantyId) || null,
    [warrantiesWithStatus, detailsWarrantyId],
  );

  const selectedWarrantyClaims = useMemo(() => {
    if (!selectedWarranty) return [];

    return claims
      .filter((claim) => claim.warrantyId === selectedWarranty.id)
      .sort((a, b) => dateToTimestamp(b.claimDate) - dateToTimestamp(a.claimDate));
  }, [claims, selectedWarranty]);

  const alerts = useMemo(() => {
    const expiringSoonItems = warrantiesWithStatus
      .filter((warranty) => warranty.baseStatus === "Expiring Soon")
      .sort((a, b) => getDaysUntil(a.expiryDate) - getDaysUntil(b.expiryDate))
      .slice(0, 6);

    const pendingClaims = claims
      .filter((claim) => ["Pending", "Approved", "In Repair"].includes(claim.status))
      .sort((a, b) => dateToTimestamp(b.claimDate) - dateToTimestamp(a.claimDate))
      .slice(0, 6);

    const readyForPickupClaims = claims
      .filter((claim) => claim.status === "Completed")
      .sort((a, b) => dateToTimestamp(b.claimDate) - dateToTimestamp(a.claimDate))
      .slice(0, 6);

    return {
      expiringSoonItems,
      pendingClaims,
      readyForPickupClaims,
    };
  }, [warrantiesWithStatus, claims]);

  const reports = useMemo(() => {
    const claimsByStatus = CLAIM_STATUSES.reduce(
      (acc, status) => ({
        ...acc,
        [status]: claims.filter((claim) => claim.status === status).length,
      }),
      {},
    );

    const expiredWarranties = warrantiesWithStatus.filter(
      (warranty) => warranty.baseStatus === "Expired",
    );

    const warrantyRevenue = warranties.reduce((sum, warranty) => {
      const extensionAmount = (warranty.extensionHistory || []).reduce(
        (extSum, extension) => extSum + Number(extension.amount || 0),
        0,
      );

      return sum + extensionAmount;
    }, 0);

    const failureMap = new Map();
    claims.forEach((claim) => {
      const category = getIssueCategory(claim.issueDescription);
      failureMap.set(category, (failureMap.get(category) || 0) + 1);
    });

    const productFailureTrends = Array.from(failureMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      claimsByStatus,
      expiredWarranties,
      warrantyRevenue,
      productFailureTrends,
    };
  }, [claims, warranties, warrantiesWithStatus]);

  const onOpenWarrantyForm = (warranty = null) => {
    if (warranty) {
      setEditingWarrantyId(warranty.id);
      setWarrantyForm({
        invoiceNumber: warranty.invoiceNumber,
        productName: warranty.productName,
        category: warranty.category,
        customerName: warranty.customerName,
        customerPhone: warranty.customerPhone,
        serialNumber: warranty.serialNumber,
        purchaseDate: warranty.purchaseDate,
        warrantyDurationMonths: String(warranty.warrantyDurationMonths),
        warrantyType: warranty.warrantyType,
        terms: warranty.terms,
      });
    } else {
      setEditingWarrantyId(null);
      setWarrantyForm(DEFAULT_WARRANTY_FORM);
    }

    setWarrantyFormOpen(true);
  };

  const onCloseWarrantyForm = () => {
    setWarrantyFormOpen(false);
    setEditingWarrantyId(null);
    setWarrantyForm(DEFAULT_WARRANTY_FORM);
  };

  const onWarrantyFormChange = (event) => {
    const { name, value } = event.target;
    setWarrantyForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitWarrantyForm = (event) => {
    event.preventDefault();

    const productName = warrantyForm.productName.trim();
    const customerName = warrantyForm.customerName.trim();
    const customerPhone = warrantyForm.customerPhone.trim();
    const serialNumber = warrantyForm.serialNumber.trim();
    const invoiceNumber = warrantyForm.invoiceNumber.trim();
    const purchaseDate = warrantyForm.purchaseDate;
    const duration = Number(warrantyForm.warrantyDurationMonths);

    if (!productName || !customerName || !customerPhone || !serialNumber || !purchaseDate) {
      setFeedbackMessage("Fill all required warranty registration fields.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setFeedbackMessage("Enter a valid warranty duration in months.");
      return;
    }

    const expiryDate = addMonthsToDate(purchaseDate, Math.round(duration));

    if (editingWarrantyId) {
      setWarranties((prev) =>
        prev.map((warranty) => {
          if (warranty.id !== editingWarrantyId) return warranty;

          return {
            ...warranty,
            invoiceNumber: invoiceNumber || warranty.invoiceNumber,
            productName,
            category: warrantyForm.category,
            customerName,
            customerPhone,
            serialNumber,
            purchaseDate,
            warrantyDurationMonths: Math.round(duration),
            expiryDate,
            warrantyType: warrantyForm.warrantyType,
            terms: warrantyForm.terms.trim(),
          };
        }),
      );

      setFeedbackMessage(`Warranty record updated: ${editingWarrantyId}`);
    } else {
      const newWarrantyId = createWarrantyId();

      setWarranties((prev) => [
        {
          id: newWarrantyId,
          invoiceNumber: invoiceNumber || `INV-AUTO-${new Date().getTime()}`,
          productName,
          category: warrantyForm.category,
          customerName,
          customerPhone,
          serialNumber,
          purchaseDate,
          warrantyDurationMonths: Math.round(duration),
          expiryDate,
          warrantyType: warrantyForm.warrantyType,
          lifecycleStatus: "Active",
          terms: warrantyForm.terms.trim(),
          extensionHistory: [],
          documents: [],
          repairHistory: [
            {
              id: `RHR-${Date.now()}`,
              date: getTodayString(),
              detail: "Warranty registered automatically after sale",
              status: "Completed",
            },
          ],
        },
        ...prev,
      ]);

      setFeedbackMessage(`Warranty registered from sale: ${newWarrantyId}`);
    }

    onCloseWarrantyForm();
  };

  const onOpenClaimForm = (warrantyId = "") => {
    setClaimForm({
      ...DEFAULT_CLAIM_FORM,
      warrantyId,
      deviceModel: warrantyId
        ? warrantyMap.get(warrantyId)?.productName || ""
        : "",
    });
    setClaimFormOpen(true);
  };

  const onCloseClaimForm = () => {
    setClaimFormOpen(false);
    setClaimForm(DEFAULT_CLAIM_FORM);
  };

  const onClaimFormChange = (event) => {
    const { name, value } = event.target;
    setClaimForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitClaimForm = (event) => {
    event.preventDefault();

    const warrantyId = claimForm.warrantyId;
    const warranty = warrantyMap.get(warrantyId);

    if (!warranty) {
      setFeedbackMessage("Select a valid warranty record for claim creation.");
      return;
    }

    const deviceModel = claimForm.deviceModel.trim();
    const issueDescription = claimForm.issueDescription.trim();

    if (!deviceModel || !issueDescription || !claimForm.claimDate) {
      setFeedbackMessage("Fill all required claim fields.");
      return;
    }

    const claimId = createClaimId();

    setClaims((prev) => [
      {
        id: claimId,
        warrantyId,
        deviceModel,
        issueDescription,
        claimDate: claimForm.claimDate,
        status: claimForm.status,
        technicianAssigned: claimForm.technicianAssigned.trim() || "Unassigned",
        claimNotes: claimForm.claimNotes.trim(),
      },
      ...prev,
    ]);

    setWarranties((prev) =>
      prev.map((item) => {
        if (item.id !== warrantyId) return item;

        return {
          ...item,
          lifecycleStatus: "Claim Processing",
          repairHistory: [
            {
              id: `RHR-${Date.now()}`,
              date: claimForm.claimDate,
              detail: `Warranty claim opened (${claimId})`,
              status: "Pending",
            },
            ...item.repairHistory,
          ],
        };
      }),
    );

    setFeedbackMessage(`Warranty claim created: ${claimId}`);
    onCloseClaimForm();
  };

  const onUpdateClaimStatus = (claimId, nextStatus) => {
    const targetClaim = claims.find((claim) => claim.id === claimId);
    if (!targetClaim) return;

    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              status: nextStatus,
            }
          : claim,
      ),
    );

    setWarranties((prev) =>
      prev.map((warranty) => {
        if (warranty.id !== targetClaim.warrantyId) return warranty;

        return {
          ...warranty,
          lifecycleStatus:
            nextStatus === "Completed"
              ? "Completed"
              : nextStatus === "Rejected"
              ? calculateBaseStatus(warranty)
              : "Claim Processing",
          repairHistory: [
            {
              id: `RHR-${Date.now()}`,
              date: getTodayString(),
              detail: `Claim ${claimId} status updated to ${nextStatus}`,
              status: nextStatus,
            },
            ...warranty.repairHistory,
          ],
        };
      }),
    );

    setFeedbackMessage(`Claim ${claimId} moved to ${nextStatus}.`);
  };

  const onSetWarrantyLifecycleStatus = (warrantyId, nextStatus) => {
    setWarranties((prev) =>
      prev.map((warranty) =>
        warranty.id === warrantyId
          ? {
              ...warranty,
              lifecycleStatus: nextStatus,
            }
          : warranty,
      ),
    );

    setFeedbackMessage(`Warranty ${warrantyId} set to ${nextStatus}.`);
  };

  const onApplyExtendedWarranty = () => {
    if (!selectedWarranty) return;

    const selectedPlan = EXTENSION_OPTIONS.find(
      (option) => String(option.months) === extensionOptionMonths,
    );

    if (!selectedPlan) {
      setFeedbackMessage("Select a valid extension plan.");
      return;
    }

    setWarranties((prev) =>
      prev.map((warranty) => {
        if (warranty.id !== selectedWarranty.id) return warranty;

        const nextExpiry = addMonthsToDate(warranty.expiryDate, selectedPlan.months);

        return {
          ...warranty,
          expiryDate: nextExpiry,
          warrantyDurationMonths: warranty.warrantyDurationMonths + selectedPlan.months,
          lifecycleStatus: "Active",
          extensionHistory: [
            {
              id: `EXT-${Date.now()}`,
              months: selectedPlan.months,
              amount: selectedPlan.price,
              extendedAt: getTodayString(),
            },
            ...(warranty.extensionHistory || []),
          ],
          repairHistory: [
            {
              id: `RHR-${Date.now()}`,
              date: getTodayString(),
              detail: `Extended warranty by ${selectedPlan.months} months`,
              status: "Completed",
            },
            ...warranty.repairHistory,
          ],
        };
      }),
    );

    setFeedbackMessage(
      `Extended warranty for ${selectedWarranty.id} by ${selectedPlan.months} months.`,
    );
  };

  const onWarrantyDocumentUpload = (event) => {
    if (!selectedWarranty) return;

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setWarranties((prev) =>
      prev.map((warranty) => {
        if (warranty.id !== selectedWarranty.id) return warranty;

        return {
          ...warranty,
          documents: [
            ...files.map((file, index) => ({
              id: `DOC-${Date.now()}-${index}`,
              type: documentType,
              name: file.name,
              uploadedAt: `${getTodayString()} ${new Date().toTimeString().slice(0, 5)}`,
            })),
            ...warranty.documents,
          ],
        };
      }),
    );

    setFeedbackMessage("Warranty documents attached.");
    event.target.value = "";
  };

  const onExportClaimsReport = () => {
    if (claims.length === 0) {
      setFeedbackMessage("No claims available to export.");
      return;
    }

    const headers = [
      "claimId",
      "warrantyId",
      "productName",
      "customerName",
      "issueDescription",
      "claimDate",
      "status",
      "technician",
    ];

    const rows = claims.map((claim) => {
      const warranty = warrantyMap.get(claim.warrantyId);
      return [
        claim.id,
        claim.warrantyId,
        warranty?.productName || "-",
        warranty?.customerName || "-",
        claim.issueDescription,
        claim.claimDate,
        claim.status,
        claim.technicianAssigned,
      ]
        .map(escapeCsvCell)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "warranty-claims-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Warranty claims report exported.");
  };

  const onExportExpiredReport = () => {
    const expired = warrantiesWithStatus.filter(
      (warranty) => warranty.baseStatus === "Expired",
    );

    if (expired.length === 0) {
      setFeedbackMessage("No expired warranties to export.");
      return;
    }

    const headers = [
      "warrantyId",
      "productName",
      "customerName",
      "phoneNumber",
      "purchaseDate",
      "expiryDate",
      "warrantyType",
    ];

    const rows = expired.map((warranty) =>
      [
        warranty.id,
        warranty.productName,
        warranty.customerName,
        warranty.customerPhone,
        warranty.purchaseDate,
        warranty.expiryDate,
        warranty.warrantyType,
      ]
        .map(escapeCsvCell)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "expired-warranties-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setFeedbackMessage("Expired warranties report exported.");
  };

  const warrantyExpiryPreview = useMemo(() => {
    const purchaseDate = warrantyForm.purchaseDate;
    const duration = Number(warrantyForm.warrantyDurationMonths);

    if (!purchaseDate || !Number.isFinite(duration) || duration <= 0) {
      return "-";
    }

    return addMonthsToDate(purchaseDate, Math.round(duration));
  }, [warrantyForm.purchaseDate, warrantyForm.warrantyDurationMonths]);

  return (
    <div className="w-full min-w-0 space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Warranty Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Track warranty items, claims, lifecycle status, alerts, and warranty
              performance for all sold products.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportClaimsReport}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Claims Report
            </button>
            <button
              type="button"
              onClick={onExportExpiredReport}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Expired Report
            </button>
            <button
              type="button"
              onClick={() => onOpenClaimForm()}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium text-(--color-main-text)"
            >
              Create Claim
            </button>
            <button
              type="button"
              onClick={() => onOpenWarrantyForm()}
              className="h-9 rounded-lg bg-(--color-main-text) px-3 text-sm font-medium text-white"
            >
              Register Warranty
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
            Total Warranty Items
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {warrantySummary.totalWarrantyItems}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
            Active Warranties
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {warrantySummary.activeWarranties}
          </p>
        </article>

        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-rose-700">
            Expired Warranties
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">
            {warrantySummary.expiredWarranties}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-amber-700">
            Expiring Soon
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {warrantySummary.expiringSoon}
          </p>
        </article>

        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-sky-700">
            Warranty Claims
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">
            {warrantySummary.warrantyClaims}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Warranty Search & Filters
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Search Warranty Records
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Customer / Phone / Product / IMEI / Invoice"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Warranty Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              {WARRANTY_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
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
              {CATEGORY_OPTIONS.map((category) => (
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
                setStatusFilter("all");
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
          Warranty List
        </h3>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1650px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-3">Warranty ID</th>
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">IMEI / Serial Number</th>
                <th className="pb-3">Purchase Date</th>
                <th className="pb-3">Warranty Period</th>
                <th className="pb-3">Warranty Expiry Date</th>
                <th className="pb-3">Warranty Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedWarranties.map((warranty) => (
                <tr key={warranty.id} className="border-t border-(--color-border)">
                  <td className="py-3 align-top font-mono text-xs">{warranty.id}</td>
                  <td className="py-3 align-top">
                    <p className="font-medium text-(--color-main-text)">
                      {warranty.productName}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {warranty.invoiceNumber}
                    </p>
                  </td>
                  <td className="py-3 align-top">{warranty.category}</td>
                  <td className="py-3 align-top">{warranty.customerName}</td>
                  <td className="py-3 align-top">{warranty.customerPhone}</td>
                  <td className="py-3 align-top font-mono text-xs">{warranty.serialNumber}</td>
                  <td className="py-3 align-top">{warranty.purchaseDate}</td>
                  <td className="py-3 align-top">{warranty.warrantyDurationMonths} Months</td>
                  <td className="py-3 align-top">{warranty.expiryDate}</td>
                  <td className="py-3 align-top">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        warrantyStatusClassMap[warranty.lifecycleStatus] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {warranty.lifecycleStatus}
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailsWarrantyId(warranty.id)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenClaimForm(warranty.id)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenWarrantyForm(warranty)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-3 space-y-3 md:hidden">
          {paginatedWarranties.map((warranty) => (
            <li
              key={`${warranty.id}-mobile`}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-(--color-main-text)">
                    {warranty.productName}
                  </p>
                  <p className="text-xs font-mono text-(--color-muted-text)">
                    {warranty.id}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    warrantyStatusClassMap[warranty.lifecycleStatus] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {warranty.lifecycleStatus}
                </span>
              </div>

              <div className="mt-2 grid gap-1 text-xs text-(--color-muted-text)">
                <p>{warranty.customerName}</p>
                <p>{warranty.customerPhone}</p>
                <p>{warranty.serialNumber}</p>
                <p>
                  {warranty.purchaseDate} → {warranty.expiryDate}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setDetailsWarrantyId(warranty.id)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onOpenClaimForm(warranty.id)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  Claim
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWarrantyForm(warranty)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>

        {paginatedWarranties.length === 0 && (
          <p className="py-6 text-sm text-(--color-muted-text)">
            No warranty records found with current filters.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-muted-text)">
            Showing {filteredWarranties.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, filteredWarranties.length)} of{" "}
            {filteredWarranties.length}
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
            Warranty Claim Management
          </h3>
          <button
            type="button"
            onClick={() => onOpenClaimForm()}
            className="h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
          >
            Create Warranty Claim
          </button>
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1250px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-2">Claim ID</th>
                <th className="pb-2">Warranty ID</th>
                <th className="pb-2">Device Model</th>
                <th className="pb-2">Issue Description</th>
                <th className="pb-2">Claim Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Technician Assigned</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-t border-(--color-border)">
                  <td className="py-2 align-top font-mono text-xs">{claim.id}</td>
                  <td className="py-2 align-top font-mono text-xs">{claim.warrantyId}</td>
                  <td className="py-2 align-top">{claim.deviceModel}</td>
                  <td className="py-2 align-top">
                    <p className="max-w-[260px] text-sm text-(--color-main-text)">
                      {claim.issueDescription}
                    </p>
                  </td>
                  <td className="py-2 align-top">{claim.claimDate}</td>
                  <td className="py-2 align-top">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        claimStatusClassMap[claim.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-2 align-top">{claim.technicianAssigned}</td>
                  <td className="py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailsWarrantyId(claim.warrantyId)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        View Warranty
                      </button>
                    </div>
                    <select
                      value={claim.status}
                      onChange={(event) =>
                        onUpdateClaimStatus(claim.id, event.target.value)
                      }
                      className="mt-2 h-8 rounded-lg border border-(--color-border) px-2 text-xs"
                    >
                      {CLAIM_STATUSES.map((status) => (
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
          {claims.map((claim) => (
            <li
              key={`${claim.id}-mobile`}
              className="rounded-lg border border-(--color-border) p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-(--color-muted-text)">{claim.id}</p>
                  <p className="font-medium text-(--color-main-text)">{claim.deviceModel}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    claimStatusClassMap[claim.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {claim.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-(--color-muted-text)">{claim.issueDescription}</p>
              <p className="mt-1 text-xs text-(--color-muted-text)">
                {claim.claimDate} • {claim.technicianAssigned}
              </p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setDetailsWarrantyId(claim.warrantyId)}
                  className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                >
                  View Warranty
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-3">
        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Warranty Alerts: Expiring Soon
          </h3>
          <ul className="mt-3 space-y-2">
            {alerts.expiringSoonItems.length === 0 && (
              <li className="text-sm text-(--color-muted-text)">
                No warranties expiring soon.
              </li>
            )}
            {alerts.expiringSoonItems.map((item) => (
              <li
                key={`alert-exp-${item.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">{item.productName}</p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {item.customerName} • {item.expiryDate}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Warranty Alerts: Claims Pending
          </h3>
          <ul className="mt-3 space-y-2">
            {alerts.pendingClaims.length === 0 && (
              <li className="text-sm text-(--color-muted-text)">No pending claims.</li>
            )}
            {alerts.pendingClaims.map((claim) => (
              <li
                key={`alert-pen-${claim.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">{claim.deviceModel}</p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {claim.id} • {claim.status}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Warranty Alerts: Ready Pickup
          </h3>
          <ul className="mt-3 space-y-2">
            {alerts.readyForPickupClaims.length === 0 && (
              <li className="text-sm text-(--color-muted-text)">
                No items ready for pickup.
              </li>
            )}
            {alerts.readyForPickupClaims.map((claim) => (
              <li
                key={`alert-rdy-${claim.id}`}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">{claim.deviceModel}</p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {claim.id} • Completed
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Warranty Reports
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Claims Report
              </p>
              <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                Total Claims: {claims.length}
              </p>
              <p className="mt-1 text-xs text-(--color-muted-text)">
                Pending: {reports.claimsByStatus.Pending || 0} • Approved:{" "}
                {reports.claimsByStatus.Approved || 0}
              </p>
              <p className="mt-1 text-xs text-(--color-muted-text)">
                In Repair: {reports.claimsByStatus["In Repair"] || 0} • Completed:{" "}
                {reports.claimsByStatus.Completed || 0}
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Expired Warranties
              </p>
              <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                {reports.expiredWarranties.length} Records
              </p>
              <p className="mt-1 text-xs text-(--color-muted-text)">
                Export expired list for proactive follow-up.
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Warranty Revenue
              </p>
              <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                {currencyFormat(reports.warrantyRevenue)}
              </p>
              <p className="mt-1 text-xs text-(--color-muted-text)">
                Revenue from extended warranty plans.
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Product Failure Trends
              </p>
              <ul className="mt-1 space-y-1 text-xs text-(--color-main-text)">
                {reports.productFailureTrends.length === 0 && (
                  <li>No issue trends yet.</li>
                )}
                {reports.productFailureTrends.map((trend) => (
                  <li key={trend.label}>
                    {trend.label} • {trend.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Extended Warranty Option
          </h3>

          <p className="mt-2 text-sm text-(--color-muted-text)">
            Offer optional plans: extend warranty by 6 months or 1 year at the
            time of sale or during active coverage.
          </p>

          <div className="mt-3 space-y-2">
            {EXTENSION_OPTIONS.map((option) => (
              <div
                key={option.months}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">{option.label}</p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Plan Price: {currencyFormat(option.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-menu-btn-hover) p-3 text-sm text-(--color-main-text)">
            <p className="font-medium">How It Works</p>
            <p className="mt-1 text-(--color-muted-text)">
              Open warranty details and apply extension plan. Expiry date and
              warranty revenue are updated automatically.
            </p>
          </div>
        </article>
      </section>

      {isWarrantyFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingWarrantyId ? "Edit Warranty Record" : "Warranty Registration"}
              </h3>
              <button
                type="button"
                onClick={onCloseWarrantyForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitWarrantyForm}>
              <label className="grid gap-1 text-sm font-medium">
                Invoice Number
                <input
                  name="invoiceNumber"
                  value={warrantyForm.invoiceNumber}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Product Name
                <input
                  required
                  name="productName"
                  value={warrantyForm.productName}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category
                <select
                  name="category"
                  value={warrantyForm.category}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Customer Name
                <input
                  required
                  name="customerName"
                  value={warrantyForm.customerName}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Customer Phone
                <input
                  required
                  name="customerPhone"
                  value={warrantyForm.customerPhone}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Serial Number / IMEI
                <input
                  required
                  name="serialNumber"
                  value={warrantyForm.serialNumber}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Date
                <input
                  type="date"
                  required
                  name="purchaseDate"
                  value={warrantyForm.purchaseDate}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Warranty Duration (Months)
                <input
                  required
                  name="warrantyDurationMonths"
                  value={warrantyForm.warrantyDurationMonths}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Warranty Type
                <select
                  name="warrantyType"
                  value={warrantyForm.warrantyType}
                  onChange={onWarrantyFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {WARRANTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-1 text-sm font-medium">
                Warranty Expiry Date
                <div className="grid h-10 items-center rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text)">
                  {warrantyExpiryPreview}
                </div>
              </div>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Warranty Terms
                <textarea
                  name="terms"
                  value={warrantyForm.terms}
                  onChange={onWarrantyFormChange}
                  rows={3}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseWarrantyForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  {editingWarrantyId ? "Save Warranty" : "Register Warranty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClaimFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Warranty Claim Management
              </h3>
              <button
                type="button"
                onClick={onCloseClaimForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitClaimForm}>
              <label className="grid gap-1 text-sm font-medium">
                Warranty ID
                <select
                  required
                  name="warrantyId"
                  value={claimForm.warrantyId}
                  onChange={onClaimFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">Select Warranty</option>
                  {warrantiesWithStatus.map((warranty) => (
                    <option key={warranty.id} value={warranty.id}>
                      {warranty.id} - {warranty.productName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Device Model
                <input
                  required
                  name="deviceModel"
                  value={claimForm.deviceModel}
                  onChange={onClaimFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Claim Date
                <input
                  type="date"
                  required
                  name="claimDate"
                  value={claimForm.claimDate}
                  onChange={onClaimFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Claim Status
                <select
                  name="status"
                  value={claimForm.status}
                  onChange={onClaimFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {CLAIM_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Technician Assigned
                <input
                  name="technicianAssigned"
                  value={claimForm.technicianAssigned}
                  onChange={onClaimFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Issue Description
                <textarea
                  required
                  name="issueDescription"
                  value={claimForm.issueDescription}
                  onChange={onClaimFormChange}
                  rows={3}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Claim Notes
                <textarea
                  name="claimNotes"
                  value={claimForm.claimNotes}
                  onChange={onClaimFormChange}
                  rows={2}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseClaimForm}
                  className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Save Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedWarranty && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-4xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Warranty Details - {selectedWarranty.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailsWarrantyId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Warranty Status Tracking
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {WARRANTY_LIFECYCLE_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onSetWarrantyLifecycleStatus(selectedWarranty.id, status)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      selectedWarranty.lifecycleStatus === status
                        ? `${warrantyStatusClassMap[status] || "bg-slate-100 text-slate-700"} ring-2 ring-offset-1`
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">Warranty Information</h4>
              <div className="mt-2 grid gap-1 text-sm text-(--color-main-text)">
                <p>Product: {selectedWarranty.productName}</p>
                <p>Category: {selectedWarranty.category}</p>
                <p>Customer: {selectedWarranty.customerName}</p>
                <p>Phone: {selectedWarranty.customerPhone}</p>
                <p>Invoice: {selectedWarranty.invoiceNumber}</p>
                <p>Serial / IMEI: {selectedWarranty.serialNumber}</p>
                <p>
                  Purchase Date: {selectedWarranty.purchaseDate} • Expiry Date:{" "}
                  {selectedWarranty.expiryDate}
                </p>
                <p>
                  Warranty Period: {selectedWarranty.warrantyDurationMonths} Months ({selectedWarranty.warrantyType})
                </p>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Warranty Terms
              </h4>
              <p className="mt-2 text-sm text-(--color-main-text)">{selectedWarranty.terms}</p>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Extended Warranty Option
              </h4>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select
                  value={extensionOptionMonths}
                  onChange={(event) => setExtensionOptionMonths(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
                >
                  {EXTENSION_OPTIONS.map((option) => (
                    <option key={option.months} value={option.months}>
                      {option.label} ({currencyFormat(option.price)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onApplyExtendedWarranty}
                  className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
                >
                  Apply Extension
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {(selectedWarranty.extensionHistory || []).length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No extension plan applied yet.
                  </li>
                )}
                {(selectedWarranty.extensionHistory || []).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    +{item.months} months • {currencyFormat(item.amount)} • {item.extendedAt}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Warranty Documents
              </h4>
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
                    onChange={onWarrantyDocumentUpload}
                  />
                </label>
              </div>

              <ul className="mt-3 space-y-2">
                {selectedWarranty.documents.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No documents attached.
                  </li>
                )}
                {selectedWarranty.documents.map((document) => (
                  <li
                    key={document.id}
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

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-(--color-main-text)">Claim History</h4>
                <button
                  type="button"
                  onClick={() => onOpenClaimForm(selectedWarranty.id)}
                  className="h-8 rounded-lg border border-(--color-border) px-3 text-xs font-medium"
                >
                  New Claim
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {selectedWarrantyClaims.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No claims recorded for this warranty.
                  </li>
                )}

                {selectedWarrantyClaims.map((claim) => (
                  <li
                    key={claim.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-(--color-main-text)">
                        {claim.id} • {claim.deviceModel}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          claimStatusClassMap[claim.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="mt-1 text-(--color-main-text)">{claim.issueDescription}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {claim.claimDate} • Technician: {claim.technicianAssigned}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Repair History
              </h4>

              <ul className="mt-3 space-y-2">
                {selectedWarranty.repairHistory.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No repair history available.
                  </li>
                )}
                {selectedWarranty.repairHistory.map((history) => (
                  <li
                    key={history.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-(--color-main-text)">{history.detail}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {history.date} • {history.status}
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

export default WarrantyPage;
