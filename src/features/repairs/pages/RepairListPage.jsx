import { useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { currencyFormat } from "../../../utils/currencyFormat.js";

const REPAIR_STATUSES = [
  "Received",
  "Diagnosing",
  "Waiting for Parts",
  "Repairing",
  "Ready for Pickup",
  "Completed",
  "Delivered",
];

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "QR"];
const NOTIFICATION_CHANNELS = ["SMS", "Email", "WhatsApp"];
const ATTACHMENT_TYPES = ["Device Photo", "Damage Photo", "Repair Note"];

const SHOP_CONTACT = {
  name: "Smart Mobile Center",
  phone: "+94 77 123 4567",
  email: "support@smartmobile.lk",
  address: "No. 12, Main Street, Colombo",
};

const DEFAULT_REPAIR_FORM = {
  customerName: "",
  customerPhone: "",
  deviceBrand: "",
  deviceModel: "",
  serialNumber: "",
  problemDescription: "",
  deviceConditionNotes: "",
  accessoriesReceived: "",
  estimatedCost: "",
  estimatedCompletionDate: "",
  technician: "",
  repairNotes: "",
};

const DEFAULT_INVOICE_FORM = {
  partsCost: "0",
  laborCost: "0",
  paymentMethod: "Cash",
  warrantyInfo: "30 days service warranty",
};

const DEFAULT_PART_USAGE_FORM = {
  partName: "Screen",
  quantity: "1",
  unitCost: "0",
};

const DEFAULT_RESTOCK_PART_FORM = {
  partName: "Screen",
  quantity: "1",
  user: "Owner",
};

const INITIAL_PARTS_INVENTORY = [
  { partName: "Screen", stock: 16, unitCost: 18000 },
  { partName: "Battery", stock: 24, unitCost: 8500 },
  { partName: "Charging port", stock: 18, unitCost: 3200 },
  { partName: "Camera", stock: 10, unitCost: 12000 },
  { partName: "Speaker", stock: 21, unitCost: 2600 },
];

const INITIAL_REPAIRS = [
  {
    id: "R-2026-1021",
    customerName: "N. Fernando",
    customerPhone: "0771234567",
    deviceBrand: "Apple",
    deviceModel: "iPhone 13",
    serialNumber: "IMEI-359182840001",
    problemDescription: "Display cracked and touch not responding",
    deviceConditionNotes: "Frame slightly bent on right corner",
    accessoriesReceived: "Back cover",
    estimatedCost: 28500,
    status: "Repairing",
    technician: "Kamal",
    receivedDate: "2026-03-11",
    estimatedCompletionDate: "2026-03-13",
    repairNotes: "Display replacement in progress.",
    partsUsed: [
      {
        partName: "Screen",
        quantity: 1,
        unitCost: 18000,
        totalCost: 18000,
        usedAt: "2026-03-11 10:30",
      },
    ],
    invoice: null,
    attachments: [
      {
        id: "ATT-001",
        name: "iphone13-front.jpg",
        type: "Device Photo",
        uploadedAt: "2026-03-11 09:12",
      },
    ],
    notifications: [
      {
        id: "NTF-001",
        channel: "SMS",
        message: "Repair accepted for ticket R-2026-1021",
        sentAt: "2026-03-11 09:15",
      },
    ],
    history: [
      {
        id: "HIS-001",
        date: "2026-03-11 09:12",
        status: "Received",
        note: "Repair ticket created",
      },
      {
        id: "HIS-002",
        date: "2026-03-11 09:55",
        status: "Diagnosing",
        note: "Display connector damaged",
      },
      {
        id: "HIS-003",
        date: "2026-03-11 10:20",
        status: "Repairing",
        note: "Display replacement started",
      },
    ],
  },
  {
    id: "R-2026-1020",
    customerName: "P. Silva",
    customerPhone: "0778899001",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy A55",
    serialNumber: "IMEI-356221170981",
    problemDescription: "Battery drains fast and overheats",
    deviceConditionNotes: "No visible physical damage",
    accessoriesReceived: "Charger",
    estimatedCost: 14500,
    status: "Waiting for Parts",
    technician: "Ishara",
    receivedDate: "2026-03-10",
    estimatedCompletionDate: "2026-03-14",
    repairNotes: "Need new battery stock.",
    partsUsed: [],
    invoice: null,
    attachments: [],
    notifications: [],
    history: [
      {
        id: "HIS-004",
        date: "2026-03-10 14:05",
        status: "Received",
        note: "Ticket opened",
      },
      {
        id: "HIS-005",
        date: "2026-03-10 15:35",
        status: "Diagnosing",
        note: "Battery health below 65%",
      },
      {
        id: "HIS-006",
        date: "2026-03-10 16:10",
        status: "Waiting for Parts",
        note: "Battery replacement part unavailable",
      },
    ],
  },
  {
    id: "R-2026-1019",
    customerName: "R. Jayasena",
    customerPhone: "0765543322",
    deviceBrand: "Xiaomi",
    deviceModel: "Redmi Note 12",
    serialNumber: "IMEI-867459210113",
    problemDescription: "Charging port loose, not charging properly",
    deviceConditionNotes: "Minor scratches",
    accessoriesReceived: "Cable",
    estimatedCost: 6800,
    status: "Completed",
    technician: "Kamal",
    receivedDate: "2026-03-09",
    estimatedCompletionDate: "2026-03-10",
    repairNotes: "Charging port replaced and tested.",
    partsUsed: [
      {
        partName: "Charging port",
        quantity: 1,
        unitCost: 3200,
        totalCost: 3200,
        usedAt: "2026-03-09 16:20",
      },
    ],
    invoice: {
      partsCost: 3200,
      laborCost: 3000,
      totalAmount: 6200,
      paymentMethod: "Cash",
      warrantyInfo: "30 days service warranty",
      generatedAt: "2026-03-10 10:00",
    },
    attachments: [],
    notifications: [
      {
        id: "NTF-002",
        channel: "WhatsApp",
        message: "Your repair ticket R-2026-1019 is completed.",
        sentAt: "2026-03-10 10:05",
      },
    ],
    history: [
      {
        id: "HIS-007",
        date: "2026-03-09 12:30",
        status: "Received",
        note: "Ticket opened",
      },
      {
        id: "HIS-008",
        date: "2026-03-09 13:40",
        status: "Repairing",
        note: "Port replacement started",
      },
      {
        id: "HIS-009",
        date: "2026-03-10 09:55",
        status: "Completed",
        note: "Device passed charging test",
      },
    ],
  },
  {
    id: "R-2026-1018",
    customerName: "M. Perera",
    customerPhone: "0716789345",
    deviceBrand: "Apple",
    deviceModel: "iPad Air",
    serialNumber: "SN-IPAD-AIR-2231",
    problemDescription: "No sound from bottom speaker",
    deviceConditionNotes: "Good overall condition",
    accessoriesReceived: "None",
    estimatedCost: 9800,
    status: "Delivered",
    technician: "Dilan",
    receivedDate: "2026-03-06",
    estimatedCompletionDate: "2026-03-08",
    repairNotes: "Speaker module replaced and delivered.",
    partsUsed: [
      {
        partName: "Speaker",
        quantity: 1,
        unitCost: 2600,
        totalCost: 2600,
        usedAt: "2026-03-07 11:50",
      },
    ],
    invoice: {
      partsCost: 2600,
      laborCost: 5200,
      totalAmount: 7800,
      paymentMethod: "Card",
      warrantyInfo: "45 days service warranty",
      generatedAt: "2026-03-08 17:20",
    },
    attachments: [],
    notifications: [
      {
        id: "NTF-003",
        channel: "SMS",
        message: "Your device is ready for pickup. Ticket R-2026-1018",
        sentAt: "2026-03-08 16:50",
      },
    ],
    history: [
      {
        id: "HIS-010",
        date: "2026-03-06 09:45",
        status: "Received",
        note: "Ticket opened",
      },
      {
        id: "HIS-011",
        date: "2026-03-07 11:55",
        status: "Completed",
        note: "Speaker issue fixed",
      },
      {
        id: "HIS-012",
        date: "2026-03-08 18:10",
        status: "Delivered",
        note: "Customer collected device",
      },
    ],
  },
  {
    id: "R-2026-1017",
    customerName: "S. Nimal",
    customerPhone: "0702244668",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S21",
    serialNumber: "IMEI-352785660192",
    problemDescription: "Rear camera blurry and autofocus not working",
    deviceConditionNotes: "Back glass cracked",
    accessoriesReceived: "None",
    estimatedCost: 19000,
    status: "Received",
    technician: "Ishara",
    receivedDate: "2026-03-11",
    estimatedCompletionDate: "2026-03-15",
    repairNotes: "Waiting for diagnostics",
    partsUsed: [],
    invoice: null,
    attachments: [],
    notifications: [],
    history: [
      {
        id: "HIS-013",
        date: "2026-03-11 11:05",
        status: "Received",
        note: "Ticket opened",
      },
    ],
  },
];

const INITIAL_PARTS_MOVEMENTS = [
  {
    id: "PM-001",
    date: "2026-03-11 10:30",
    productName: "Screen",
    qtyAdded: 0,
    qtyRemoved: 1,
    reason: "repair R-2026-1021",
    user: "Kamal",
  },
  {
    id: "PM-002",
    date: "2026-03-09 16:20",
    productName: "Charging port",
    qtyAdded: 0,
    qtyRemoved: 1,
    reason: "repair R-2026-1019",
    user: "Kamal",
  },
];

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getDateTimeString = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const getStatusBucket = (status) => {
  if (["Received", "Diagnosing", "Waiting for Parts"].includes(status)) {
    return "pending";
  }

  if (["Repairing", "Ready for Pickup"].includes(status)) {
    return "in_progress";
  }

  if (status === "Completed") {
    return "completed";
  }

  if (status === "Delivered") {
    return "delivered";
  }

  return "pending";
};

const getStatusBadgeClass = (status) => {
  const bucket = getStatusBucket(status);

  if (bucket === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (bucket === "in_progress") {
    return "bg-sky-100 text-sky-700";
  }

  if (bucket === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
};

const getIssueCategory = (problemDescription) => {
  const text = problemDescription.toLowerCase();

  if (text.includes("screen") || text.includes("display"))
    return "Screen Issues";
  if (text.includes("battery")) return "Battery Issues";
  if (text.includes("charging") || text.includes("port"))
    return "Charging Issues";
  if (text.includes("camera")) return "Camera Issues";
  if (text.includes("speaker") || text.includes("sound")) return "Audio Issues";

  return "Other Issues";
};

const generateRepairId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `R-${new Date().getFullYear()}-${rand}`;
};

function RepairListPage() {
  const [repairs, setRepairs] = useState(INITIAL_REPAIRS);
  const [partsInventory, setPartsInventory] = useState(INITIAL_PARTS_INVENTORY);
  const [partsMovements, setPartsMovements] = useState(INITIAL_PARTS_MOVEMENTS);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingRepairId, setEditingRepairId] = useState(null);
  const [repairForm, setRepairForm] = useState(DEFAULT_REPAIR_FORM);

  const [detailsRepairId, setDetailsRepairId] = useState(null);
  const [receiptRepairId, setReceiptRepairId] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState(DEFAULT_INVOICE_FORM);
  const [attachmentType, setAttachmentType] = useState(ATTACHMENT_TYPES[0]);
  const [partUsageForm, setPartUsageForm] = useState(DEFAULT_PART_USAGE_FORM);
  const [restockPartForm, setRestockPartForm] = useState(
    DEFAULT_RESTOCK_PART_FORM,
  );

  const [feedbackMessage, setFeedbackMessage] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 250);

  const technicians = useMemo(
    () =>
      Array.from(
        new Set(
          repairs
            .map((repair) => repair.technician)
            .filter((technician) => technician && technician.trim().length > 0),
        ),
      ).sort(),
    [repairs],
  );

  const repairSummary = useMemo(() => {
    const today = getTodayString();

    const totalRepairs = repairs.length;
    const pendingRepairs = repairs.filter(
      (repair) => getStatusBucket(repair.status) === "pending",
    ).length;
    const inProgressRepairs = repairs.filter(
      (repair) => getStatusBucket(repair.status) === "in_progress",
    ).length;
    const completedRepairs = repairs.filter(
      (repair) => repair.status === "Completed",
    ).length;
    const deliveredRepairs = repairs.filter(
      (repair) => repair.status === "Delivered",
    ).length;
    const todaysRepairs = repairs.filter(
      (repair) => repair.receivedDate === today,
    ).length;

    return {
      totalRepairs,
      pendingRepairs,
      inProgressRepairs,
      completedRepairs,
      deliveredRepairs,
      todaysRepairs,
    };
  }, [repairs]);

  const filteredRepairs = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return repairs.filter((repair) => {
      const matchesSearch =
        term.length === 0 ||
        repair.id.toLowerCase().includes(term) ||
        repair.customerName.toLowerCase().includes(term) ||
        repair.customerPhone.toLowerCase().includes(term) ||
        repair.deviceModel.toLowerCase().includes(term) ||
        repair.serialNumber.toLowerCase().includes(term) ||
        repair.status.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || repair.status === statusFilter;
      const matchesBucket =
        bucketFilter === "all" ||
        getStatusBucket(repair.status) === bucketFilter;
      const matchesTechnician =
        technicianFilter === "all" || repair.technician === technicianFilter;

      const matchesFromDate =
        dateFrom.length === 0 || repair.receivedDate >= dateFrom;
      const matchesToDate =
        dateTo.length === 0 || repair.receivedDate <= dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBucket &&
        matchesTechnician &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    repairs,
    debouncedSearch,
    statusFilter,
    bucketFilter,
    technicianFilter,
    dateFrom,
    dateTo,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRepairs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRepairs = filteredRepairs.slice(
    startIndex,
    startIndex + pageSize,
  );

  const selectedRepair = useMemo(
    () => repairs.find((repair) => repair.id === detailsRepairId) || null,
    [repairs, detailsRepairId],
  );

  const relatedRepairHistory = useMemo(() => {
    if (!selectedRepair) return [];

    return repairs.filter(
      (repair) =>
        repair.id !== selectedRepair.id &&
        (repair.customerPhone === selectedRepair.customerPhone ||
          repair.serialNumber === selectedRepair.serialNumber),
    );
  }, [repairs, selectedRepair]);

  const receiptRepair = useMemo(
    () => repairs.find((repair) => repair.id === receiptRepairId) || null,
    [repairs, receiptRepairId],
  );

  const repairReports = useMemo(() => {
    const today = getTodayString();
    const monthPrefix = today.slice(0, 7);

    const dailyRepairs = repairs.filter(
      (repair) => repair.receivedDate === today,
    ).length;
    const monthlyRepairs = repairs.filter((repair) =>
      repair.receivedDate.startsWith(monthPrefix),
    ).length;

    const issueMap = new Map();
    repairs.forEach((repair) => {
      const issue = getIssueCategory(repair.problemDescription);
      issueMap.set(issue, (issueMap.get(issue) || 0) + 1);
    });

    const mostCommonIssues = Array.from(issueMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const repairRevenue = repairs
      .filter((repair) => ["Completed", "Delivered"].includes(repair.status))
      .reduce((sum, repair) => {
        if (repair.invoice) {
          return sum + repair.invoice.totalAmount;
        }
        return sum + repair.estimatedCost;
      }, 0);

    return {
      dailyRepairs,
      monthlyRepairs,
      mostCommonIssues,
      repairRevenue,
    };
  }, [repairs]);

  const receiptPreview = useMemo(() => {
    if (!receiptRepair) return "";

    return [
      "Repair Intake Receipt",
      `Ticket ID: ${receiptRepair.id}`,
      `Date Received: ${receiptRepair.receivedDate}`,
      "",
      `Customer: ${receiptRepair.customerName}`,
      `Phone: ${receiptRepair.customerPhone}`,
      "",
      `Device: ${receiptRepair.deviceBrand} ${receiptRepair.deviceModel}`,
      `IMEI / Serial: ${receiptRepair.serialNumber}`,
      `Problem: ${receiptRepair.problemDescription}`,
      "",
      `Estimated Cost: ${currencyFormat(receiptRepair.estimatedCost)}`,
      `Estimated Completion: ${receiptRepair.estimatedCompletionDate || "TBD"}`,
      "",
      `${SHOP_CONTACT.name}`,
      `Phone: ${SHOP_CONTACT.phone}`,
      `Email: ${SHOP_CONTACT.email}`,
      `${SHOP_CONTACT.address}`,
    ].join("\n");
  }, [receiptRepair]);

  const updateRepairById = (repairId, updater) => {
    setRepairs((prev) =>
      prev.map((repair) => (repair.id === repairId ? updater(repair) : repair)),
    );
  };

  const onOpenCreateForm = () => {
    setEditingRepairId(null);
    setRepairForm(DEFAULT_REPAIR_FORM);
    setFormOpen(true);
  };

  const onOpenEditForm = (repair) => {
    setEditingRepairId(repair.id);
    setRepairForm({
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      deviceBrand: repair.deviceBrand,
      deviceModel: repair.deviceModel,
      serialNumber: repair.serialNumber,
      problemDescription: repair.problemDescription,
      deviceConditionNotes: repair.deviceConditionNotes,
      accessoriesReceived: repair.accessoriesReceived,
      estimatedCost: String(repair.estimatedCost),
      estimatedCompletionDate: repair.estimatedCompletionDate,
      technician: repair.technician,
      repairNotes: repair.repairNotes,
    });
    setFormOpen(true);
  };

  const onCloseForm = () => {
    setFormOpen(false);
    setEditingRepairId(null);
    setRepairForm(DEFAULT_REPAIR_FORM);
  };

  const onRepairFormChange = (event) => {
    const { name, value } = event.target;
    setRepairForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitRepairForm = (event) => {
    event.preventDefault();

    if (
      !repairForm.customerName.trim() ||
      !repairForm.customerPhone.trim() ||
      !repairForm.deviceBrand.trim() ||
      !repairForm.deviceModel.trim() ||
      !repairForm.serialNumber.trim() ||
      !repairForm.problemDescription.trim()
    ) {
      setFeedbackMessage("Please fill all required ticket fields.");
      return;
    }

    const estimatedCost = Number(repairForm.estimatedCost);
    if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
      setFeedbackMessage("Enter a valid estimated repair cost.");
      return;
    }

    if (editingRepairId) {
      updateRepairById(editingRepairId, (repair) => ({
        ...repair,
        customerName: repairForm.customerName.trim(),
        customerPhone: repairForm.customerPhone.trim(),
        deviceBrand: repairForm.deviceBrand.trim(),
        deviceModel: repairForm.deviceModel.trim(),
        serialNumber: repairForm.serialNumber.trim(),
        problemDescription: repairForm.problemDescription.trim(),
        deviceConditionNotes: repairForm.deviceConditionNotes.trim(),
        accessoriesReceived: repairForm.accessoriesReceived.trim(),
        estimatedCost,
        estimatedCompletionDate: repairForm.estimatedCompletionDate,
        technician: repairForm.technician.trim(),
        repairNotes: repairForm.repairNotes.trim(),
        history: [
          {
            id: `HIS-${Date.now()}`,
            date: getDateTimeString(),
            status: repair.status,
            note: "Ticket details edited",
          },
          ...repair.history,
        ],
      }));

      setFeedbackMessage("Repair ticket updated.");
    } else {
      const nextId = generateRepairId();
      const createdRepair = {
        id: nextId,
        customerName: repairForm.customerName.trim(),
        customerPhone: repairForm.customerPhone.trim(),
        deviceBrand: repairForm.deviceBrand.trim(),
        deviceModel: repairForm.deviceModel.trim(),
        serialNumber: repairForm.serialNumber.trim(),
        problemDescription: repairForm.problemDescription.trim(),
        deviceConditionNotes: repairForm.deviceConditionNotes.trim(),
        accessoriesReceived: repairForm.accessoriesReceived.trim(),
        estimatedCost,
        status: "Received",
        technician: repairForm.technician.trim() || "Unassigned",
        receivedDate: getTodayString(),
        estimatedCompletionDate: repairForm.estimatedCompletionDate,
        repairNotes: repairForm.repairNotes.trim(),
        partsUsed: [],
        invoice: null,
        attachments: [],
        notifications: [],
        history: [
          {
            id: `HIS-${Date.now()}`,
            date: getDateTimeString(),
            status: "Received",
            note: "Repair ticket created",
          },
        ],
      };

      setRepairs((prev) => [createdRepair, ...prev]);
      setFeedbackMessage(`Repair ticket created: ${nextId}`);
      setReceiptRepairId(nextId);
    }

    onCloseForm();
  };

  const onUpdateStatus = (repairId, nextStatus) => {
    updateRepairById(repairId, (repair) => ({
      ...repair,
      status: nextStatus,
      history: [
        {
          id: `HIS-${Date.now()}`,
          date: getDateTimeString(),
          status: nextStatus,
          note: `Status changed to ${nextStatus}`,
        },
        ...repair.history,
      ],
    }));

    setFeedbackMessage(`Repair ${repairId} moved to ${nextStatus}.`);
  };

  const onOpenDetails = (repair) => {
    setDetailsRepairId(repair.id);

    const partsCost = repair.partsUsed.reduce(
      (sum, part) => sum + part.totalCost,
      0,
    );

    setInvoiceForm({
      partsCost: String(repair.invoice?.partsCost ?? partsCost),
      laborCost: String(repair.invoice?.laborCost ?? 0),
      paymentMethod: repair.invoice?.paymentMethod || "Cash",
      warrantyInfo: repair.invoice?.warrantyInfo || "30 days service warranty",
    });

    setPartUsageForm({
      partName: INITIAL_PARTS_INVENTORY[0].partName,
      quantity: "1",
      unitCost: String(INITIAL_PARTS_INVENTORY[0].unitCost),
    });

    setAttachmentType(ATTACHMENT_TYPES[0]);
  };

  const onSaveInvoice = () => {
    if (!selectedRepair) return;

    const partsCost = Number(invoiceForm.partsCost);
    const laborCost = Number(invoiceForm.laborCost);

    if (!Number.isFinite(partsCost) || !Number.isFinite(laborCost)) {
      setFeedbackMessage("Enter valid invoice cost values.");
      return;
    }

    const totalAmount = partsCost + laborCost;

    updateRepairById(selectedRepair.id, (repair) => ({
      ...repair,
      invoice: {
        partsCost,
        laborCost,
        totalAmount,
        paymentMethod: invoiceForm.paymentMethod,
        warrantyInfo: invoiceForm.warrantyInfo.trim(),
        generatedAt: getDateTimeString(),
      },
      history: [
        {
          id: `HIS-${Date.now()}`,
          date: getDateTimeString(),
          status: repair.status,
          note: "Repair invoice generated",
        },
        ...repair.history,
      ],
    }));

    setFeedbackMessage(`Invoice generated for ${selectedRepair.id}.`);
  };

  const onUsePartForRepair = () => {
    if (!selectedRepair) return;

    const quantity = Number(partUsageForm.quantity);
    const unitCost = Number(partUsageForm.unitCost);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedbackMessage("Enter a valid parts quantity.");
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      setFeedbackMessage("Enter a valid part unit cost.");
      return;
    }

    const targetPart = partsInventory.find(
      (part) => part.partName === partUsageForm.partName,
    );

    if (!targetPart) {
      setFeedbackMessage("Selected part not found in stock.");
      return;
    }

    const qtyRounded = Math.round(quantity);
    if (targetPart.stock < qtyRounded) {
      setFeedbackMessage("Not enough part stock available.");
      return;
    }

    setPartsInventory((prev) =>
      prev.map((part) =>
        part.partName === targetPart.partName
          ? { ...part, stock: part.stock - qtyRounded }
          : part,
      ),
    );

    updateRepairById(selectedRepair.id, (repair) => ({
      ...repair,
      partsUsed: [
        {
          partName: targetPart.partName,
          quantity: qtyRounded,
          unitCost,
          totalCost: unitCost * qtyRounded,
          usedAt: getDateTimeString(),
        },
        ...repair.partsUsed,
      ],
      history: [
        {
          id: `HIS-${Date.now()}`,
          date: getDateTimeString(),
          status: repair.status,
          note: `${qtyRounded} ${targetPart.partName} part(s) used`,
        },
        ...repair.history,
      ],
    }));

    setPartsMovements((prev) => [
      {
        id: `PM-${Date.now()}`,
        date: getDateTimeString(),
        productName: targetPart.partName,
        qtyAdded: 0,
        qtyRemoved: qtyRounded,
        reason: `repair ${selectedRepair.id}`,
        user: selectedRepair.technician || "Technician",
      },
      ...prev,
    ]);

    setFeedbackMessage("Part usage recorded and inventory updated.");
  };

  const onRestockPart = () => {
    const quantity = Number(restockPartForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedbackMessage("Enter valid restock quantity.");
      return;
    }

    const qtyRounded = Math.round(quantity);

    setPartsInventory((prev) =>
      prev.map((part) =>
        part.partName === restockPartForm.partName
          ? { ...part, stock: part.stock + qtyRounded }
          : part,
      ),
    );

    setPartsMovements((prev) => [
      {
        id: `PM-${Date.now()}`,
        date: getDateTimeString(),
        productName: restockPartForm.partName,
        qtyAdded: qtyRounded,
        qtyRemoved: 0,
        reason: "parts restock",
        user: restockPartForm.user || "Owner",
      },
      ...prev,
    ]);

    setFeedbackMessage("Parts inventory restocked.");
  };

  const onAttachmentUpload = (event) => {
    if (!selectedRepair) return;

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    updateRepairById(selectedRepair.id, (repair) => ({
      ...repair,
      attachments: [
        ...files.map((file, index) => ({
          id: `ATT-${Date.now()}-${index}`,
          name: file.name,
          type: attachmentType,
          uploadedAt: getDateTimeString(),
        })),
        ...repair.attachments,
      ],
      history: [
        {
          id: `HIS-${Date.now()}`,
          date: getDateTimeString(),
          status: repair.status,
          note: `${files.length} attachment(s) uploaded`,
        },
        ...repair.history,
      ],
    }));

    setFeedbackMessage("Attachments uploaded.");
    event.target.value = "";
  };

  const onSendNotification = (channel) => {
    if (!selectedRepair) return;

    const message =
      channel === "WhatsApp"
        ? `Ticket ${selectedRepair.id}: Your device status is ${selectedRepair.status}.`
        : `Repair ${selectedRepair.id} update: ${selectedRepair.status}`;

    updateRepairById(selectedRepair.id, (repair) => ({
      ...repair,
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          channel,
          message,
          sentAt: getDateTimeString(),
        },
        ...repair.notifications,
      ],
    }));

    setFeedbackMessage(`${channel} notification sent to customer.`);
  };

  const onPrintReceipt = (repairId) => {
    setReceiptRepairId(repairId);
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Repairs Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Manage repair tickets, technician workflow, parts usage, billing,
              and customer communication from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateForm}
            className="h-10 rounded-lg bg-(--color-main-text) px-4 text-sm font-medium text-white"
          >
            Create Repair Ticket
          </button>
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Repairs
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {repairSummary.totalRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-amber-700">
            Pending Repairs
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {repairSummary.pendingRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-sky-700">
            In Progress
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">
            {repairSummary.inProgressRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">
            Completed
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {repairSummary.completedRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-700">
            Delivered
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-700">
            {repairSummary.deliveredRepairs}
          </p>
        </article>

        <article className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Today&apos;s Repairs
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {repairSummary.todaysRepairs}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">
          Repair Search & Filters
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Search
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Customer / Phone / Device / Ticket"
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Repair Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              {REPAIR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Repair Group
            <select
              value={bucketFilter}
              onChange={(event) => {
                setBucketFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending Repairs</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Technician
            <select
              value={technicianFilter}
              onChange={(event) => {
                setTechnicianFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            >
              <option value="all">All Technicians</option>
              {technicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Date From
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
            Date To
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <th className="pb-3">Repair ID / Ticket Number</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Device Model</th>
                <th className="pb-3">IMEI / Serial Number</th>
                <th className="pb-3">Problem Description</th>
                <th className="pb-3">Assigned Technician</th>
                <th className="pb-3">Estimated Cost</th>
                <th className="pb-3">Repair Status</th>
                <th className="pb-3">Received Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRepairs.map((repair) => (
                <tr
                  key={repair.id}
                  className="border-t border-(--color-border)"
                >
                  <td className="py-3 align-top font-mono text-xs">
                    {repair.id}
                  </td>
                  <td className="py-3 align-top">{repair.customerName}</td>
                  <td className="py-3 align-top">{repair.customerPhone}</td>
                  <td className="py-3 align-top">
                    {repair.deviceBrand} {repair.deviceModel}
                  </td>
                  <td className="py-3 align-top font-mono text-xs">
                    {repair.serialNumber}
                  </td>
                  <td className="py-3 align-top">
                    <p className="max-w-[220px] text-sm text-(--color-main-text)">
                      {repair.problemDescription}
                    </p>
                  </td>
                  <td className="py-3 align-top">{repair.technician}</td>
                  <td className="py-3 align-top">
                    {currencyFormat(repair.estimatedCost)}
                  </td>
                  <td className="py-3 align-top">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                        repair.status,
                      )}`}
                    >
                      {repair.status}
                    </span>
                  </td>
                  <td className="py-3 align-top">{repair.receivedDate}</td>
                  <td className="py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(repair)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditForm(repair)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintReceipt(repair.id)}
                        className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                      >
                        Print Receipt
                      </button>
                    </div>

                    <select
                      value={repair.status}
                      onChange={(event) =>
                        onUpdateStatus(repair.id, event.target.value)
                      }
                      className="mt-2 h-8 rounded-lg border border-(--color-border) px-2 text-xs"
                    >
                      {REPAIR_STATUSES.map((status) => (
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

        {paginatedRepairs.length === 0 && (
          <p className="py-6 text-sm text-(--color-muted-text)">
            No repair jobs found with current filters.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-muted-text)">
            Showing {filteredRepairs.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, filteredRepairs.length)} of{" "}
            {filteredRepairs.length}
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
                <option value={15}>15</option>
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="h-8 rounded-lg border border-(--color-border) px-3 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <article className="min-w-0 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Parts Usage Tracking
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {partsInventory.map((part) => (
              <div
                key={part.partName}
                className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 text-sm font-medium text-(--color-main-text)">
                    {part.partName}
                  </p>
                  <p className="shrink-0 text-sm text-(--color-main-text)">
                    Stock: {part.stock}
                  </p>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  Unit Cost: {currencyFormat(part.unitCost)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
            <p className="text-sm font-medium text-(--color-main-text)">
              Restock Spare Parts
            </p>
            <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-3">
              <select
                value={restockPartForm.partName}
                onChange={(event) =>
                  setRestockPartForm((prev) => ({
                    ...prev,
                    partName: event.target.value,
                  }))
                }
                className="h-9 w-full min-w-0 rounded-lg border border-(--color-border) px-2 text-sm"
              >
                {partsInventory.map((part) => (
                  <option key={part.partName} value={part.partName}>
                    {part.partName}
                  </option>
                ))}
              </select>

              <input
                value={restockPartForm.quantity}
                onChange={(event) =>
                  setRestockPartForm((prev) => ({
                    ...prev,
                    quantity: event.target.value,
                  }))
                }
                placeholder="Qty"
                className="h-9 w-full min-w-0 rounded-lg border border-(--color-border) px-2 text-sm"
              />

              <button
                type="button"
                onClick={onRestockPart}
                className="h-9 w-full rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
              >
                Add Stock
              </button>
            </div>
          </div>

          <h4 className="mt-4 text-sm font-semibold text-(--color-main-text)">
            Parts Movement History
          </h4>
          <div className="mt-2 space-y-2 sm:hidden">
            {partsMovements.slice(0, 12).map((movement) => (
              <article
                key={movement.id}
                className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3 text-sm"
              >
                <p className="font-medium text-(--color-main-text)">
                  {movement.productName}
                </p>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {movement.date}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-(--color-muted-text)">Qty Added</p>
                  <p className="text-right text-emerald-700">
                    {movement.qtyAdded > 0 ? `+${movement.qtyAdded}` : "-"}
                  </p>
                  <p className="text-(--color-muted-text)">Qty Removed</p>
                  <p className="text-right text-rose-700">
                    {movement.qtyRemoved > 0 ? `-${movement.qtyRemoved}` : "-"}
                  </p>
                  <p className="text-(--color-muted-text)">Reason</p>
                  <p className="text-right text-(--color-main-text)">
                    {movement.reason}
                  </p>
                  <p className="text-(--color-muted-text)">User</p>
                  <p className="text-right text-(--color-main-text)">
                    {movement.user}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-2 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2">Quantity Added</th>
                  <th className="pb-2">Quantity Removed</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">User</th>
                </tr>
              </thead>
              <tbody>
                {partsMovements.slice(0, 12).map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t border-(--color-border)"
                  >
                    <td className="whitespace-nowrap py-2 align-top">
                      {movement.date}
                    </td>
                    <td className="py-2 align-top">{movement.productName}</td>
                    <td className="py-2 align-top text-emerald-700">
                      {movement.qtyAdded > 0 ? `+${movement.qtyAdded}` : "-"}
                    </td>
                    <td className="py-2 align-top text-rose-700">
                      {movement.qtyRemoved > 0
                        ? `-${movement.qtyRemoved}`
                        : "-"}
                    </td>
                    <td className="py-2 align-top">{movement.reason}</td>
                    <td className="py-2 align-top">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Repair Reports
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Daily Repairs
              </p>
              <p className="mt-1 text-xl font-semibold text-(--color-main-text)">
                {repairReports.dailyRepairs}
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Monthly Repairs
              </p>
              <p className="mt-1 text-xl font-semibold text-(--color-main-text)">
                {repairReports.monthlyRepairs}
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Repair Revenue
              </p>
              <p className="mt-1 text-xl font-semibold text-(--color-main-text)">
                {currencyFormat(repairReports.repairRevenue)}
              </p>
            </div>

            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                Most Common Issues
              </p>

              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {repairReports.mostCommonIssues.map((issue) => (
                  <li key={issue.label}>
                    {issue.label} • {issue.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingRepairId
                  ? "Edit Repair Ticket"
                  : "Create Repair Ticket"}
              </h3>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={onSubmitRepairForm}
            >
              <label className="grid gap-1 text-sm font-medium">
                Customer Name
                <input
                  required
                  name="customerName"
                  value={repairForm.customerName}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Customer Phone Number
                <input
                  required
                  name="customerPhone"
                  value={repairForm.customerPhone}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Device Brand
                <input
                  required
                  name="deviceBrand"
                  value={repairForm.deviceBrand}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Device Model
                <input
                  required
                  name="deviceModel"
                  value={repairForm.deviceModel}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                IMEI / Serial Number
                <input
                  required
                  name="serialNumber"
                  value={repairForm.serialNumber}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Technician Assignment
                <input
                  name="technician"
                  value={repairForm.technician}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Estimated Repair Cost
                <input
                  name="estimatedCost"
                  value={repairForm.estimatedCost}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Estimated Completion Date
                <input
                  type="date"
                  name="estimatedCompletionDate"
                  value={repairForm.estimatedCompletionDate}
                  onChange={onRepairFormChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Problem Description
                <textarea
                  required
                  name="problemDescription"
                  value={repairForm.problemDescription}
                  onChange={onRepairFormChange}
                  rows={3}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Device Condition Notes
                <textarea
                  name="deviceConditionNotes"
                  value={repairForm.deviceConditionNotes}
                  onChange={onRepairFormChange}
                  rows={2}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Accessories Received
                <input
                  name="accessoriesReceived"
                  value={repairForm.accessoriesReceived}
                  onChange={onRepairFormChange}
                  placeholder="charger, cover, cable"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Repair Notes
                <textarea
                  name="repairNotes"
                  value={repairForm.repairNotes}
                  onChange={onRepairFormChange}
                  rows={3}
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
                  {editingRepairId ? "Save Changes" : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receiptRepair && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Repair Ticket Receipt
              </h3>
              <button
                type="button"
                onClick={() => setReceiptRepairId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <pre className="mt-4 max-h-[65vh] overflow-auto rounded-xl border border-(--color-border) bg-(--color-menu-btn-hover) p-4 text-xs leading-6 text-(--color-main-text)">
              {receiptPreview}
            </pre>
          </div>
        </div>
      )}

      {selectedRepair && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Repair Details - {selectedRepair.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailsRepairId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Repair Status Workflow
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {REPAIR_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onUpdateStatus(selectedRepair.id, status)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      selectedRepair.status === status
                        ? `${getStatusBadgeClass(status)} ring-2 ring-offset-1`
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Device & Customer Info
              </h4>
              <div className="mt-2 grid gap-1 text-sm text-(--color-main-text)">
                <p>Customer: {selectedRepair.customerName}</p>
                <p>Phone: {selectedRepair.customerPhone}</p>
                <p>
                  Device: {selectedRepair.deviceBrand}{" "}
                  {selectedRepair.deviceModel}
                </p>
                <p>IMEI / Serial: {selectedRepair.serialNumber}</p>
                <p>Problem: {selectedRepair.problemDescription}</p>
                <p>
                  Accessories: {selectedRepair.accessoriesReceived || "None"}
                </p>
                <p>Technician: {selectedRepair.technician}</p>
                <p>
                  Estimated Cost: {currencyFormat(selectedRepair.estimatedCost)}
                </p>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Repair Invoice / Billing
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Parts Cost
                  <input
                    value={invoiceForm.partsCost}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        partsCost: event.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                  />
                </label>

                <label className="grid gap-1 text-sm font-medium">
                  Labor Cost
                  <input
                    value={invoiceForm.laborCost}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        laborCost: event.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                  />
                </label>

                <label className="grid gap-1 text-sm font-medium">
                  Payment Method
                  <select
                    value={invoiceForm.paymentMethod}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        paymentMethod: event.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-sm font-medium">
                  Warranty Information
                  <input
                    value={invoiceForm.warrantyInfo}
                    onChange={(event) =>
                      setInvoiceForm((prev) => ({
                        ...prev,
                        warrantyInfo: event.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={onSaveInvoice}
                className="mt-3 h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
              >
                Generate Repair Invoice
              </button>

              {selectedRepair.invoice && (
                <div className="mt-3 rounded-lg border border-(--color-border) bg-(--color-menu-btn-hover) p-3 text-sm">
                  <p>
                    Parts: {currencyFormat(selectedRepair.invoice.partsCost)} |
                    Labor: {currencyFormat(selectedRepair.invoice.laborCost)}
                  </p>
                  <p className="mt-1 font-semibold">
                    Total: {currencyFormat(selectedRepair.invoice.totalAmount)}
                  </p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">
                    {selectedRepair.invoice.paymentMethod} •{" "}
                    {selectedRepair.invoice.warrantyInfo}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Parts Usage
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <select
                  value={partUsageForm.partName}
                  onChange={(event) =>
                    setPartUsageForm((prev) => ({
                      ...prev,
                      partName: event.target.value,
                      unitCost: String(
                        partsInventory.find(
                          (part) => part.partName === event.target.value,
                        )?.unitCost || 0,
                      ),
                    }))
                  }
                  className="h-9 rounded-lg border border-(--color-border) px-2 text-sm"
                >
                  {partsInventory.map((part) => (
                    <option key={part.partName} value={part.partName}>
                      {part.partName}
                    </option>
                  ))}
                </select>

                <input
                  value={partUsageForm.quantity}
                  onChange={(event) =>
                    setPartUsageForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="Qty"
                  className="h-9 rounded-lg border border-(--color-border) px-2 text-sm"
                />

                <input
                  value={partUsageForm.unitCost}
                  onChange={(event) =>
                    setPartUsageForm((prev) => ({
                      ...prev,
                      unitCost: event.target.value,
                    }))
                  }
                  placeholder="Unit Cost"
                  className="h-9 rounded-lg border border-(--color-border) px-2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={onUsePartForRepair}
                className="mt-3 h-9 rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent)"
              >
                Use Part & Update Inventory
              </button>

              <ul className="mt-3 space-y-2">
                {selectedRepair.partsUsed.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No parts used yet.
                  </li>
                )}
                {selectedRepair.partsUsed.map((part, index) => (
                  <li
                    key={`${part.partName}-${part.usedAt}-${index}`}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p>
                      {part.partName} x{part.quantity} •{" "}
                      {currencyFormat(part.totalCost)}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {part.usedAt}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Repair Attachments
              </h4>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={attachmentType}
                  onChange={(event) => setAttachmentType(event.target.value)}
                  className="h-9 rounded-lg border border-(--color-border) px-3 text-sm"
                >
                  {ATTACHMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <label className="h-9 cursor-pointer rounded-lg border border-(--color-border) px-3 text-sm leading-9">
                  Upload Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onAttachmentUpload}
                  />
                </label>
              </div>

              <ul className="mt-3 space-y-2">
                {selectedRepair.attachments.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No attachments uploaded.
                  </li>
                )}
                {selectedRepair.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p>{attachment.name}</p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {attachment.type} • {attachment.uploadedAt}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h4 className="font-semibold text-(--color-main-text)">
                Customer Notifications
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => onSendNotification(channel)}
                    className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
                  >
                    Send via {channel}
                  </button>
                ))}
              </div>

              <ul className="mt-3 space-y-2">
                {selectedRepair.notifications.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No notifications sent.
                  </li>
                )}
                {selectedRepair.notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-(--color-main-text)">
                      {notification.channel}
                    </p>
                    <p className="mt-1 text-(--color-main-text)">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {notification.sentAt}
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
                {relatedRepairHistory.length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No previous repairs found for this customer/device.
                  </li>
                )}
                {relatedRepairHistory.map((repair) => (
                  <li
                    key={repair.id}
                    className="rounded-lg border border-(--color-border) px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-(--color-main-text)">
                      {repair.id} • {repair.deviceBrand} {repair.deviceModel}
                    </p>
                    <p className="mt-1 text-(--color-main-text)">
                      {repair.problemDescription}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {repair.receivedDate} • {repair.status} •{" "}
                      {currencyFormat(repair.estimatedCost)}
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

export default RepairListPage;
