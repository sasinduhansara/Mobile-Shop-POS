import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDebounce } from "../hooks/useDebounce.js";
import { currencyFormat } from "../utils/currencyFormat.js";

const panelClassName =
  "rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm";

const CATEGORY_OPTIONS = [
  "Rent",
  "Electricity",
  "Internet",
  "Employee Salaries",
  "Inventory Purchases",
  "Repair Parts",
  "Marketing",
  "Maintenance",
];

const PAYMENT_METHOD_OPTIONS = ["Cash", "Card", "Bank", "Transfer"];
const STATUS_OPTIONS = ["Paid", "Pending"];
const DATE_FILTER_OPTIONS = ["Today", "This Week", "This Month", "Custom"];
const RECURRING_OPTIONS = ["Weekly", "Monthly", "Quarterly"];

const CATEGORY_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const STATUS_CLASS_MAP = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
};

const getDateString = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = Date.parse(`${value}T12:00:00`);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isSameMonth = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};

const isSameYear = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear();
};

const createExpenseId = () => {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `EXP-${new Date().getFullYear()}-${rand}`;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDiffDays = (value, target) => {
  const left = toDate(value);
  const right = toDate(target);

  if (!left || !right) return Number.POSITIVE_INFINITY;

  return Math.floor((left.getTime() - right.getTime()) / 86400000);
};

const groupAmountBy = (rows, keySelector) => {
  const map = new Map();

  rows.forEach((row) => {
    const key = keySelector(row);
    map.set(key, (map.get(key) || 0) + row.amount);
  });

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
};

const makeCsv = (rows) => {
  if (!rows.length) return "";

  const keys = Object.keys(rows[0]);
  const header = keys.join(",");

  const body = rows.map((row) =>
    keys
      .map((key) => {
        const value = String(row[key] ?? "");
        if (/[",\n]/.test(value)) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(","),
  );

  return [header, ...body].join("\n");
};

const downloadBlob = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
};

const formatDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${mins}`;
};

const DATE_TODAY = getDateString(0);
const DATE_MINUS_1 = getDateString(-1);
const DATE_MINUS_2 = getDateString(-2);
const DATE_MINUS_3 = getDateString(-3);
const DATE_MINUS_4 = getDateString(-4);
const DATE_MINUS_5 = getDateString(-5);
const DATE_MINUS_8 = getDateString(-8);
const DATE_MINUS_11 = getDateString(-11);
const DATE_MINUS_14 = getDateString(-14);
const DATE_MINUS_18 = getDateString(-18);
const DATE_MINUS_24 = getDateString(-24);
const DATE_MINUS_34 = getDateString(-34);
const DATE_MINUS_42 = getDateString(-42);
const DATE_MINUS_56 = getDateString(-56);
const DATE_PLUS_2 = getDateString(2);
const DATE_PLUS_4 = getDateString(4);
const DATE_PLUS_7 = getDateString(7);

const INITIAL_EXPENSES = [
  {
    id: "EXP-1001",
    title: "Shop Rent - Main Branch",
    category: "Rent",
    amount: 120000,
    paymentMethod: "Bank",
    vendor: "City Properties Ltd",
    date: DATE_MINUS_11,
    status: "Paid",
    notes: "Monthly branch rent payment",
    receiptName: "rent-march-main-branch.pdf",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_7,
  },
  {
    id: "EXP-1002",
    title: "Electricity Bill",
    category: "Electricity",
    amount: 28600,
    paymentMethod: "Cash",
    vendor: "Ceylon Electricity Board",
    date: DATE_MINUS_3,
    status: "Paid",
    notes: "Bill period Feb - Mar",
    receiptName: "ceb-bill-mar.pdf",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_4,
  },
  {
    id: "EXP-1003",
    title: "Dialog Internet Fiber",
    category: "Internet",
    amount: 8900,
    paymentMethod: "Card",
    vendor: "Dialog Broadband",
    date: DATE_MINUS_8,
    status: "Paid",
    notes: "Office internet package",
    receiptName: "dialog-internet-march.pdf",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_2,
  },
  {
    id: "EXP-1004",
    title: "Staff Salaries - First Half",
    category: "Employee Salaries",
    amount: 175000,
    paymentMethod: "Transfer",
    vendor: "Internal Payroll",
    date: DATE_MINUS_4,
    status: "Paid",
    notes: "Owner + 3 staff members",
    receiptName: "salary-sheet-mar-h1.xlsx",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_7,
  },
  {
    id: "EXP-1005",
    title: "Accessories Purchase - Tempered",
    category: "Inventory Purchases",
    amount: 54000,
    paymentMethod: "Bank",
    vendor: "Smart Accessory House",
    date: DATE_MINUS_5,
    status: "Pending",
    notes: "120 tempered glasses order",
    receiptName: "inv-8834-tempered.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1006",
    title: "Repair Parts - Charging Ports",
    category: "Repair Parts",
    amount: 124000,
    paymentMethod: "Transfer",
    vendor: "Tech Parts Lanka",
    date: DATE_MINUS_14,
    status: "Pending",
    notes: "Batch order for repair desk",
    receiptName: "repair-parts-march.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1007",
    title: "Facebook Ad Campaign",
    category: "Marketing",
    amount: 22000,
    paymentMethod: "Card",
    vendor: "Meta Ads",
    date: DATE_MINUS_2,
    status: "Paid",
    notes: "Weekend promo campaign",
    receiptName: "meta-campaign-march.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1008",
    title: "AC Service - Branch Hall",
    category: "Maintenance",
    amount: 14600,
    paymentMethod: "Cash",
    vendor: "Cool Air Engineering",
    date: DATE_MINUS_18,
    status: "Paid",
    notes: "Routine maintenance service",
    receiptName: "ac-service-receipt.jpg",
    isRecurring: true,
    recurringFrequency: "Quarterly",
    nextDueDate: getDateString(72),
  },
  {
    id: "EXP-1009",
    title: "Shop Rent - Store Room",
    category: "Rent",
    amount: 48000,
    paymentMethod: "Bank",
    vendor: "City Properties Ltd",
    date: DATE_MINUS_42,
    status: "Paid",
    notes: "Second unit rent",
    receiptName: "rent-store-room-feb.pdf",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_7,
  },
  {
    id: "EXP-1010",
    title: "Generator Fuel",
    category: "Maintenance",
    amount: 13200,
    paymentMethod: "Cash",
    vendor: "Lanka Fuel Mart",
    date: DATE_MINUS_1,
    status: "Paid",
    notes: "Backup power fuel refill",
    receiptName: "fuel-slip-122.jpg",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1011",
    title: "Inventory Purchase - Phone Cases",
    category: "Inventory Purchases",
    amount: 31200,
    paymentMethod: "Transfer",
    vendor: "Prime Wholesale Hub",
    date: DATE_MINUS_24,
    status: "Paid",
    notes: "Back cover restock order",
    receiptName: "cases-restock.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1012",
    title: "Internet Backup Dongle",
    category: "Internet",
    amount: 3200,
    paymentMethod: "Cash",
    vendor: "Dialog Broadband",
    date: DATE_MINUS_34,
    status: "Paid",
    notes: "Backup connection recharge",
    receiptName: "dongle-recharge.pdf",
    isRecurring: true,
    recurringFrequency: "Monthly",
    nextDueDate: DATE_PLUS_2,
  },
  {
    id: "EXP-1013",
    title: "Electricity Deposit Adjustment",
    category: "Electricity",
    amount: 5200,
    paymentMethod: "Card",
    vendor: "Ceylon Electricity Board",
    date: DATE_MINUS_56,
    status: "Paid",
    notes: "Meter change adjustment",
    receiptName: "ceb-adjustment.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
  {
    id: "EXP-1014",
    title: "Repair Parts - OLED Panels",
    category: "Repair Parts",
    amount: 188000,
    paymentMethod: "Bank",
    vendor: "Tech Parts Lanka",
    date: DATE_TODAY,
    status: "Pending",
    notes: "Urgent display panel order",
    receiptName: "oled-panel-order.pdf",
    isRecurring: false,
    recurringFrequency: "Monthly",
    nextDueDate: "",
  },
];

const INITIAL_BUDGETS = {
  Rent: 180000,
  Electricity: 35000,
  Internet: 15000,
  "Employee Salaries": 200000,
  "Inventory Purchases": 120000,
  "Repair Parts": 150000,
  Marketing: 40000,
  Maintenance: 30000,
};

const PROFIT_MONTHLY = [
  { month: "2026-01", profit: 420000 },
  { month: "2026-02", profit: 465000 },
  { month: "2026-03", profit: 510000 },
];

const DEFAULT_FORM = {
  title: "",
  category: CATEGORY_OPTIONS[0],
  amount: "",
  paymentMethod: PAYMENT_METHOD_OPTIONS[0],
  vendor: "",
  date: DATE_TODAY,
  status: STATUS_OPTIONS[0],
  notes: "",
  receiptName: "",
  isRecurring: false,
  recurringFrequency: RECURRING_OPTIONS[1],
  nextDueDate: "",
};

function SafeChartContainer({ children, className, minHeight = 280 }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: minHeight });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    let frameId = 0;
    let observer;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const nextWidth = Math.max(0, Math.floor(rect.width));
      const nextHeight = Math.max(minHeight, Math.floor(rect.height));

      setSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
    };

    const schedule = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    };

    schedule();

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule);
      observer.observe(node);
    }

    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", schedule);
      if (observer) observer.disconnect();
    };
  }, [minHeight]);

  const isReady = size.width > 0 && size.height > 0;

  return (
    <div ref={containerRef} className={className} style={{ minHeight }}>
      {isReady ? (
        children(size)
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-(--color-menu-btn-hover)" />
      )}
    </div>
  );
}

function ExpensesPage() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [budgetByCategory, setBudgetByCategory] = useState(INITIAL_BUDGETS);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [viewingExpenseId, setViewingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState(DEFAULT_FORM);

  const [exportType, setExportType] = useState("Expense List");
  const [budgetInput, setBudgetInput] = useState({
    category: CATEGORY_OPTIONS[0],
    limit: INITIAL_BUDGETS[CATEGORY_OPTIONS[0]],
  });

  const [activityMessage, setActivityMessage] = useState("");

  const debouncedSearchTitle = useDebounce(searchTitle, 250);
  const debouncedSearchVendor = useDebounce(searchVendor, 250);

  const todayDate = useMemo(() => toDate(DATE_TODAY), []);

  useEffect(() => {
    if (!activityMessage) return undefined;

    const timerId = window.setTimeout(() => setActivityMessage(""), 2600);
    return () => window.clearTimeout(timerId);
  }, [activityMessage]);

  const filteredExpenses = useMemo(() => {
    const normalizedTitle = debouncedSearchTitle.trim().toLowerCase();
    const normalizedVendor = debouncedSearchVendor.trim().toLowerCase();

    return expenses
      .filter((expense) => {
        const expenseDate = toDate(expense.date);
        if (!expenseDate || !todayDate) return false;

        if (dateFilter === "Today" && !isSameDay(expenseDate, todayDate)) {
          return false;
        }

        if (dateFilter === "This Week") {
          const diff = getDiffDays(expense.date, DATE_TODAY);
          if (diff < -6 || diff > 0) return false;
        }

        if (
          dateFilter === "This Month" &&
          !isSameMonth(expenseDate, todayDate)
        ) {
          return false;
        }

        if (dateFilter === "Custom") {
          const customStart = toDate(customRange.start);
          const customEnd = toDate(customRange.end);

          if (customStart && expenseDate < customStart) return false;
          if (customEnd && expenseDate > customEnd) return false;
        }

        if (categoryFilter !== "All" && expense.category !== categoryFilter) {
          return false;
        }

        if (statusFilter !== "All" && expense.status !== statusFilter) {
          return false;
        }

        const titleMatches =
          !normalizedTitle ||
          expense.title.toLowerCase().includes(normalizedTitle);

        const vendorMatches =
          !normalizedVendor ||
          expense.vendor.toLowerCase().includes(normalizedVendor);

        return titleMatches && vendorMatches;
      })
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [
    categoryFilter,
    customRange.end,
    customRange.start,
    dateFilter,
    debouncedSearchTitle,
    debouncedSearchVendor,
    expenses,
    statusFilter,
    todayDate,
  ]);

  const expenseOverview = useMemo(() => {
    if (!todayDate) {
      return {
        totalToday: 0,
        totalMonth: 0,
        totalYear: 0,
        pendingAmount: 0,
        topCategory: "N/A",
      };
    }

    const totalToday = expenses
      .filter((expense) => isSameDay(toDate(expense.date), todayDate))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalMonth = expenses
      .filter((expense) => isSameMonth(toDate(expense.date), todayDate))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalYear = expenses
      .filter((expense) => isSameYear(toDate(expense.date), todayDate))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const pendingAmount = expenses
      .filter((expense) => expense.status === "Pending")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const topCategoryEntry = groupAmountBy(
      expenses,
      (expense) => expense.category,
    ).sort((left, right) => right.value - left.value)[0];

    return {
      totalToday,
      totalMonth,
      totalYear,
      pendingAmount,
      topCategory: topCategoryEntry
        ? `${topCategoryEntry.label} (${currencyFormat(topCategoryEntry.value)})`
        : "N/A",
    };
  }, [expenses, todayDate]);

  const categoryTotals = useMemo(
    () =>
      groupAmountBy(expenses, (expense) => expense.category).sort(
        (left, right) => right.value - left.value,
      ),
    [expenses],
  );

  const recurringExpenses = useMemo(
    () => expenses.filter((expense) => expense.isRecurring),
    [expenses],
  );

  const receipts = useMemo(
    () =>
      expenses
        .filter((expense) => expense.receiptName)
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 8),
    [expenses],
  );

  const monthlyTrendData = useMemo(() => {
    const grouped = groupAmountBy(expenses, (expense) =>
      expense.date.slice(0, 7),
    );
    return grouped
      .sort((left, right) => left.label.localeCompare(right.label))
      .map((row) => ({ month: row.label, amount: row.value }));
  }, [expenses]);

  const expensesByCategoryChart = useMemo(
    () =>
      categoryTotals.map((row) => ({
        name: row.label,
        value: row.value,
      })),
    [categoryTotals],
  );

  const highestCategoryData = useMemo(
    () =>
      categoryTotals.slice(0, 5).map((row) => ({
        category: row.label,
        amount: row.value,
      })),
    [categoryTotals],
  );

  const monthlyExpenseMap = useMemo(() => {
    const map = new Map();
    monthlyTrendData.forEach((row) => {
      map.set(row.month, row.amount);
    });
    return map;
  }, [monthlyTrendData]);

  const profitVsExpenseData = useMemo(() => {
    const months = new Set([
      ...PROFIT_MONTHLY.map((entry) => entry.month),
      ...monthlyTrendData.map((entry) => entry.month),
    ]);

    return Array.from(months)
      .sort((left, right) => left.localeCompare(right))
      .map((month) => {
        const profit =
          PROFIT_MONTHLY.find((entry) => entry.month === month)?.profit || 0;
        const expense = monthlyExpenseMap.get(month) || 0;

        return {
          month,
          profit,
          expense,
          margin: profit - expense,
        };
      });
  }, [monthlyExpenseMap, monthlyTrendData]);

  const dailyReportRows = useMemo(
    () =>
      groupAmountBy(filteredExpenses, (expense) => expense.date)
        .sort((left, right) => right.label.localeCompare(left.label))
        .map((row) => ({ date: row.label, total: row.value })),
    [filteredExpenses],
  );

  const monthlyReportRows = useMemo(
    () =>
      groupAmountBy(filteredExpenses, (expense) => expense.date.slice(0, 7))
        .sort((left, right) => right.label.localeCompare(left.label))
        .map((row) => ({ month: row.label, total: row.value })),
    [filteredExpenses],
  );

  const categoryReportRows = useMemo(
    () =>
      groupAmountBy(filteredExpenses, (expense) => expense.category)
        .sort((left, right) => right.value - left.value)
        .map((row) => ({ category: row.label, total: row.value })),
    [filteredExpenses],
  );

  const budgetUsageRows = useMemo(() => {
    const monthExpenses = expenses.filter((expense) =>
      todayDate ? isSameMonth(toDate(expense.date), todayDate) : false,
    );

    const monthCategoryTotals = groupAmountBy(
      monthExpenses,
      (expense) => expense.category,
    );

    return CATEGORY_OPTIONS.map((category) => {
      const limit = toNumber(budgetByCategory[category]);
      const spent =
        monthCategoryTotals.find((row) => row.label === category)?.value || 0;
      const usage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        category,
        limit,
        spent,
        usage,
        remaining: limit - spent,
      };
    });
  }, [budgetByCategory, expenses, todayDate]);

  const expenseAlerts = useMemo(() => {
    const alerts = [];

    const exceeded = budgetUsageRows.filter(
      (row) => row.limit > 0 && row.spent > row.limit,
    );

    exceeded.forEach((row) => {
      alerts.push({
        id: `BUDGET-${row.category}`,
        tone: "danger",
        title: "Expenses exceed budget",
        message: `${row.category} is ${currencyFormat(
          row.spent - row.limit,
        )} over the monthly budget.`,
      });
    });

    const avgByCategory = new Map();
    const countByCategory = new Map();

    expenses.forEach((expense) => {
      avgByCategory.set(
        expense.category,
        (avgByCategory.get(expense.category) || 0) + expense.amount,
      );
      countByCategory.set(
        expense.category,
        (countByCategory.get(expense.category) || 0) + 1,
      );
    });

    const unusual = expenses
      .filter((expense) => {
        const count = countByCategory.get(expense.category) || 1;
        const average = (avgByCategory.get(expense.category) || 0) / count;
        return expense.amount > average * 1.8 && expense.amount > 15000;
      })
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 3);

    unusual.forEach((expense) => {
      alerts.push({
        id: `UNUSUAL-${expense.id}`,
        tone: "warning",
        title: "Unusual spending detected",
        message: `${expense.title} (${currencyFormat(expense.amount)}) is above normal for ${expense.category}.`,
      });
    });

    const recurringDue = recurringExpenses
      .filter((expense) => {
        if (!expense.nextDueDate) return false;
        const diff = getDiffDays(expense.nextDueDate, DATE_TODAY);
        return diff >= 0 && diff <= 5;
      })
      .slice(0, 4);

    recurringDue.forEach((expense) => {
      alerts.push({
        id: `DUE-${expense.id}`,
        tone: "info",
        title: "Recurring payment due",
        message: `${expense.title} is due on ${expense.nextDueDate}.`,
      });
    });

    return alerts;
  }, [budgetUsageRows, expenses, recurringExpenses]);

  const exportRows = useMemo(() => {
    if (exportType === "Daily Expense Report") {
      return dailyReportRows.map((row) => ({
        date: row.date,
        total: row.total,
      }));
    }

    if (exportType === "Monthly Expense Report") {
      return monthlyReportRows.map((row) => ({
        month: row.month,
        total: row.total,
      }));
    }

    if (exportType === "Category-wise Report") {
      return categoryReportRows.map((row) => ({
        category: row.category,
        total: row.total,
      }));
    }

    if (exportType === "Profit vs Expense Report") {
      return profitVsExpenseData.map((row) => ({
        month: row.month,
        profit: row.profit,
        expense: row.expense,
        margin: row.margin,
      }));
    }

    return filteredExpenses.map((expense) => ({
      expenseId: expense.id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor,
      date: expense.date,
      status: expense.status,
      notes: expense.notes,
      recurring: expense.isRecurring ? "Yes" : "No",
      receipt: expense.receiptName,
    }));
  }, [
    categoryReportRows,
    dailyReportRows,
    exportType,
    filteredExpenses,
    monthlyReportRows,
    profitVsExpenseData,
  ]);

  const viewingExpense = useMemo(
    () => expenses.find((expense) => expense.id === viewingExpenseId) || null,
    [expenses, viewingExpenseId],
  );

  const resetForm = () => {
    setExpenseForm(DEFAULT_FORM);
    setEditingExpenseId(null);
  };

  const openAddForm = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      ...DEFAULT_FORM,
      date: DATE_TODAY,
    });
    setFormOpen(true);
  };

  const openEditForm = (expense) => {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      title: expense.title,
      category: expense.category,
      amount: String(expense.amount),
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor,
      date: expense.date,
      status: expense.status,
      notes: expense.notes,
      receiptName: expense.receiptName,
      isRecurring: expense.isRecurring,
      recurringFrequency: expense.recurringFrequency || RECURRING_OPTIONS[1],
      nextDueDate: expense.nextDueDate || "",
    });
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    resetForm();
  };

  const onFormChange = (field, value) => {
    setExpenseForm((prev) => ({ ...prev, [field]: value }));
  };

  const onReceiptUpload = (event) => {
    const file = event.target.files?.[0];
    onFormChange("receiptName", file ? file.name : "");
  };

  const onSaveExpense = (event) => {
    event.preventDefault();

    const title = expenseForm.title.trim();
    const vendor = expenseForm.vendor.trim();
    const amount = toNumber(expenseForm.amount);

    if (!title || !vendor || !expenseForm.date || amount <= 0) {
      setActivityMessage(
        "Please fill required fields: title, vendor, date, and amount.",
      );
      return;
    }

    const nextDueDate =
      expenseForm.isRecurring && expenseForm.nextDueDate
        ? expenseForm.nextDueDate
        : "";

    const payload = {
      title,
      category: expenseForm.category,
      amount,
      paymentMethod: expenseForm.paymentMethod,
      vendor,
      date: expenseForm.date,
      status: expenseForm.status,
      notes: expenseForm.notes.trim(),
      receiptName: expenseForm.receiptName,
      isRecurring: expenseForm.isRecurring,
      recurringFrequency: expenseForm.recurringFrequency,
      nextDueDate,
    };

    if (editingExpenseId) {
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpenseId
            ? { ...expense, ...payload }
            : expense,
        ),
      );
      setActivityMessage("Expense updated successfully.");
    } else {
      setExpenses((prev) => [{ id: createExpenseId(), ...payload }, ...prev]);
      setActivityMessage("Expense added successfully.");
    }

    closeFormModal();
  };

  const onDeleteExpense = (expenseId) => {
    const confirmed = window.confirm("Delete this expense record?");
    if (!confirmed) return;

    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
    setActivityMessage("Expense deleted.");
  };

  const onSetBudgetLimit = (event) => {
    event.preventDefault();

    const limit = toNumber(budgetInput.limit);
    setBudgetByCategory((prev) => ({
      ...prev,
      [budgetInput.category]: limit,
    }));

    setActivityMessage(`${budgetInput.category} budget updated.`);
  };

  const onExportCsv = () => {
    const csv = makeCsv(exportRows);

    downloadBlob(
      csv,
      `expense-report-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );

    setActivityMessage("CSV exported successfully.");
  };

  const onExportExcel = () => {
    const columns = exportRows.length ? Object.keys(exportRows[0]) : [];
    const lines = [columns.join("\t")];

    exportRows.forEach((row) => {
      lines.push(columns.map((column) => String(row[column] ?? "")).join("\t"));
    });

    downloadBlob(
      lines.join("\n"),
      `expense-report-${new Date().toISOString().slice(0, 10)}.xls`,
      "application/vnd.ms-excel",
    );

    setActivityMessage("Excel exported successfully.");
  };

  const onExportPdf = () => {
    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) return;

    const rows = exportRows.slice(0, 40);
    const columns = rows.length ? Object.keys(rows[0]) : [];

    const tableHead = columns
      .map(
        (column) =>
          `<th style="padding:8px;border-bottom:1px solid #d1d5db;text-align:left;">${column}</th>`,
      )
      .join("");

    const tableBody = rows
      .map((row) => {
        const cells = columns
          .map(
            (column) =>
              `<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${String(
                row[column] ?? "",
              )}</td>`,
          )
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#111827;">
          <h2 style="margin:0 0 8px 0;">Expense Management Report</h2>
          <p style="margin:0 0 16px 0;color:#6b7280;">Generated at ${formatDateTime()}</p>
          <table style="border-collapse:collapse;width:100%;font-size:13px;">
            <thead><tr>${tableHead}</tr></thead>
            <tbody>${tableBody}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    setActivityMessage("PDF export opened in print dialog.");
  };

  const onPrint = () => {
    window.print();
    setActivityMessage("Print dialog opened.");
  };

  return (
    <div className="space-y-6">
      <section
        className={`${panelClassName} flex flex-wrap items-start justify-between gap-4`}
      >
        <div>
          <h2 className="text-xl font-semibold text-(--color-main-text)">
            Expense Management
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted-text)">
            Record, track, and analyze shop expenses including rent, utility
            bills, supplier payments, salaries, maintenance, and marketing
            costs.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
        >
          Add Expense
        </button>
      </section>

      {activityMessage ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {activityMessage}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Expenses Today
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {currencyFormat(expenseOverview.totalToday)}
          </p>
        </article>

        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Expenses This Month
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {currencyFormat(expenseOverview.totalMonth)}
          </p>
        </article>

        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Total Expenses This Year
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {currencyFormat(expenseOverview.totalYear)}
          </p>
        </article>

        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Pending Payments
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {currencyFormat(expenseOverview.pendingAmount)}
          </p>
        </article>

        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Top Expense Category
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-(--color-main-text)">
            {expenseOverview.topCategory}
          </p>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">
          Expense Search & Filters
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Search Expense Title
            <input
              type="text"
              value={searchTitle}
              onChange={(event) => setSearchTitle(event.target.value)}
              placeholder="e.g. Electricity Bill"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Vendor / Supplier
            <input
              type="text"
              value={searchVendor}
              onChange={(event) => setSearchVendor(event.target.value)}
              placeholder="e.g. Tech Parts Lanka"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Category
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              <option value="All">All</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              <option value="All">All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Date Filter
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              {DATE_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {dateFilter === "Custom" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Date From
              <input
                type="date"
                value={customRange.start}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    start: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Date To
              <input
                type="date"
                value={customRange.end}
                onChange={(event) =>
                  setCustomRange((prev) => ({
                    ...prev,
                    end: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
              />
            </label>
          </div>
        ) : null}

        <div className="rounded-lg border border-(--color-border) bg-slate-50 px-4 py-3 text-sm text-(--color-muted-text)">
          Showing{" "}
          <span className="font-semibold text-(--color-main-text)">
            {filteredExpenses.length}
          </span>{" "}
          expense records.
        </div>
      </section>

      <section className={`${panelClassName} space-y-3`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">
          Expense Categories
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categoryTotals.map((category) => (
            <article
              key={category.label}
              className="rounded-xl border border-(--color-border) bg-slate-50 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                {category.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-(--color-main-text)">
                {currencyFormat(category.value)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">
          Expense List
        </h3>

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-4 py-3">Expense Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Supplier / Vendor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-t border-(--color-border)"
                >
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">
                    {expense.id}
                  </td>
                  <td className="px-4 py-3 text-(--color-main-text)">
                    {expense.title}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted-text)">
                    {expense.category}
                  </td>
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">
                    {currencyFormat(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted-text)">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-(--color-main-text)">
                    {expense.vendor}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted-text)">
                    {expense.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS_MAP[expense.status]}`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="max-w-55 truncate px-4 py-3 text-(--color-muted-text)">
                    {expense.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingExpenseId(expense.id)}
                        className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(expense)}
                        className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
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

        <div className="grid gap-3 xl:hidden">
          {filteredExpenses.map((expense) => (
            <article
              key={expense.id}
              className="rounded-xl border border-(--color-border) p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {expense.title}
                  </p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">
                    {expense.id}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS_MAP[expense.status]}`}
                >
                  {expense.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-(--color-muted-text)">
                  Category: {expense.category}
                </p>
                <p className="text-(--color-muted-text)">
                  Method: {expense.paymentMethod}
                </p>
                <p className="text-(--color-muted-text)">
                  Vendor: {expense.vendor}
                </p>
                <p className="text-(--color-muted-text)">
                  Date: {expense.date}
                </p>
                <p className="font-semibold text-(--color-main-text)">
                  {currencyFormat(expense.amount)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingExpenseId(expense.id)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text)"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => openEditForm(expense)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Recurring Expenses
          </h3>

          <div className="space-y-3">
            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-(--color-border) px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-(--color-main-text)">
                    {expense.title}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {expense.recurringFrequency}
                  </span>
                </div>
                <p className="mt-1 text-sm text-(--color-muted-text)">
                  {expense.category} • {currencyFormat(expense.amount)} • Next
                  due: {expense.nextDueDate || "-"}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Expense Receipts / Invoices
          </h3>

          <div className="space-y-2">
            {receipts.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--color-border) px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-(--color-main-text)">
                    {expense.title}
                  </p>
                  <p className="text-xs text-(--color-muted-text)">
                    {expense.receiptName} • {expense.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingExpenseId(expense.id)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text)"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Budget Tracking
          </h3>

          <form
            onSubmit={onSetBudgetLimit}
            className="grid gap-3 sm:grid-cols-[1fr,1fr,auto]"
          >
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Category
              <select
                value={budgetInput.category}
                onChange={(event) =>
                  setBudgetInput((prev) => ({
                    ...prev,
                    category: event.target.value,
                    limit: budgetByCategory[event.target.value] ?? 0,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Budget Limit (LKR)
              <input
                type="number"
                min="0"
                value={budgetInput.limit}
                onChange={(event) =>
                  setBudgetInput((prev) => ({
                    ...prev,
                    limit: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <button
              type="submit"
              className="self-end rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Set Budget
            </button>
          </form>

          <div className="space-y-3">
            {budgetUsageRows.map((row) => (
              <div
                key={row.category}
                className="rounded-xl border border-(--color-border) p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="font-medium text-(--color-main-text)">
                    {row.category}
                  </p>
                  <p className="text-(--color-muted-text)">
                    {currencyFormat(row.spent)} / {currencyFormat(row.limit)}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      row.usage >= 100
                        ? "bg-rose-500"
                        : row.usage >= 75
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(row.usage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-(--color-muted-text)">
                  Remaining: {currencyFormat(row.remaining)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Expense Alerts
          </h3>

          <div className="space-y-3">
            {expenseAlerts.length ? (
              expenseAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border px-4 py-3 ${
                    alert.tone === "danger"
                      ? "border-rose-200 bg-rose-50"
                      : alert.tone === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {alert.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                No critical expense alerts right now.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Expenses by Category
          </h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <PieChart width={width} height={height}>
                <Pie
                  data={expensesByCategoryChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                >
                  {expensesByCategoryChart.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Legend />
              </PieChart>
            )}
          </SafeChartContainer>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Monthly Expense Trends
          </h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </SafeChartContainer>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Highest Expense Categories
          </h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <BarChart
                width={width}
                height={height}
                data={highestCategoryData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {highestCategoryData.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </SafeChartContainer>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Profit vs Expense Report
          </h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <BarChart
                width={width}
                height={height}
                data={profitVsExpenseData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Legend />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </SafeChartContainer>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-(--color-main-text)">
            Expense Reports
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={exportType}
              onChange={(event) => setExportType(event.target.value)}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-main-text)"
            >
              <option>Expense List</option>
              <option>Daily Expense Report</option>
              <option>Monthly Expense Report</option>
              <option>Category-wise Report</option>
              <option>Profit vs Expense Report</option>
            </select>

            <button
              type="button"
              onClick={onExportCsv}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)"
            >
              Export Excel
            </button>

            <button
              type="button"
              onClick={onExportPdf}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)"
            >
              Export PDF
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="rounded-lg bg-(--color-accent) px-3 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Print
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-(--color-border)">
            <div className="border-b border-(--color-border) px-4 py-3">
              <h4 className="font-semibold text-(--color-main-text)">
                Daily Expense Report
              </h4>
            </div>
            <div className="max-h-60 overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReportRows.map((row) => (
                    <tr
                      key={row.date}
                      className="border-t border-(--color-border)"
                    >
                      <td className="px-4 py-2 text-(--color-main-text)">
                        {row.date}
                      </td>
                      <td className="px-4 py-2 font-medium text-(--color-main-text)">
                        {currencyFormat(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-(--color-border)">
            <div className="border-b border-(--color-border) px-4 py-3">
              <h4 className="font-semibold text-(--color-main-text)">
                Monthly Expense Report
              </h4>
            </div>
            <div className="max-h-60 overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <tr>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReportRows.map((row) => (
                    <tr
                      key={row.month}
                      className="border-t border-(--color-border)"
                    >
                      <td className="px-4 py-2 text-(--color-main-text)">
                        {row.month}
                      </td>
                      <td className="px-4 py-2 font-medium text-(--color-main-text)">
                        {currencyFormat(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-(--color-border)">
            <div className="border-b border-(--color-border) px-4 py-3">
              <h4 className="font-semibold text-(--color-main-text)">
                Category-wise Expense Report
              </h4>
            </div>
            <div className="max-h-60 overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <tr>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReportRows.map((row) => (
                    <tr
                      key={row.category}
                      className="border-t border-(--color-border)"
                    >
                      <td className="px-4 py-2 text-(--color-main-text)">
                        {row.category}
                      </td>
                      <td className="px-4 py-2 font-medium text-(--color-main-text)">
                        {currencyFormat(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-(--color-border)">
            <div className="border-b border-(--color-border) px-4 py-3">
              <h4 className="font-semibold text-(--color-main-text)">
                Profit vs Expense
              </h4>
            </div>
            <div className="max-h-60 overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <tr>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Profit</th>
                    <th className="px-4 py-2">Expense</th>
                    <th className="px-4 py-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {profitVsExpenseData.map((row) => (
                    <tr
                      key={row.month}
                      className="border-t border-(--color-border)"
                    >
                      <td className="px-4 py-2 text-(--color-main-text)">
                        {row.month}
                      </td>
                      <td className="px-4 py-2 font-medium text-emerald-700">
                        {currencyFormat(row.profit)}
                      </td>
                      <td className="px-4 py-2 font-medium text-rose-700">
                        {currencyFormat(row.expense)}
                      </td>
                      <td
                        className={`px-4 py-2 font-medium ${
                          row.margin >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {currencyFormat(row.margin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-(--color-main-text)">
                  {editingExpenseId ? "Edit Expense" : "Add Expense"}
                </h3>
                <p className="mt-1 text-sm text-(--color-muted-text)">
                  Save expense details with receipt, status, and recurring
                  setup.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm text-(--color-main-text)"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={onSaveExpense}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Expense Title
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(event) =>
                    onFormChange("title", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Expense Category
                <select
                  value={expenseForm.category}
                  onChange={(event) =>
                    onFormChange("category", event.target.value)
                  }
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Amount
                <input
                  type="number"
                  min="1"
                  value={expenseForm.amount}
                  onChange={(event) =>
                    onFormChange("amount", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Payment Method
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(event) =>
                    onFormChange("paymentMethod", event.target.value)
                  }
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                >
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Vendor / Supplier
                <input
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(event) =>
                    onFormChange("vendor", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Expense Date
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(event) => onFormChange("date", event.target.value)}
                  required
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Status
                <select
                  value={expenseForm.status}
                  onChange={(event) =>
                    onFormChange("status", event.target.value)
                  }
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text)">
                Receipt / Invoice Upload
                <input
                  type="file"
                  onChange={onReceiptUpload}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
                {expenseForm.receiptName ? (
                  <p className="text-xs text-(--color-muted-text)">
                    Selected: {expenseForm.receiptName}
                  </p>
                ) : null}
              </label>

              <label className="space-y-1 text-sm text-(--color-muted-text) sm:col-span-2">
                Notes
                <textarea
                  rows={3}
                  value={expenseForm.notes}
                  onChange={(event) =>
                    onFormChange("notes", event.target.value)
                  }
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-(--color-main-text) sm:col-span-2">
                <input
                  type="checkbox"
                  checked={expenseForm.isRecurring}
                  onChange={(event) =>
                    onFormChange("isRecurring", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-(--color-border)"
                />
                Mark as recurring expense
              </label>

              {expenseForm.isRecurring ? (
                <>
                  <label className="space-y-1 text-sm text-(--color-muted-text)">
                    Recurring Frequency
                    <select
                      value={expenseForm.recurringFrequency}
                      onChange={(event) =>
                        onFormChange("recurringFrequency", event.target.value)
                      }
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                    >
                      {RECURRING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-sm text-(--color-muted-text)">
                    Next Due Date
                    <input
                      type="date"
                      value={expenseForm.nextDueDate}
                      onChange={(event) =>
                        onFormChange("nextDueDate", event.target.value)
                      }
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
                    />
                  </label>
                </>
              ) : null}

              <div className="flex items-center justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-main-text)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
                >
                  {editingExpenseId ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewingExpense ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-(--color-main-text)">
                  Expense Details
                </h3>
                <p className="mt-1 text-sm text-(--color-muted-text)">
                  {viewingExpense.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingExpenseId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm text-(--color-main-text)"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Expense Title
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.title}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Category
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.category}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Amount
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {currencyFormat(viewingExpense.amount)}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Payment Method
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.paymentMethod}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Vendor
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.vendor}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.date}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS_MAP[viewingExpense.status]}`}
                >
                  {viewingExpense.status}
                </span>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Receipt / Invoice
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.receiptName || "-"}
                </p>
              </div>
              <div className="rounded-lg border border-(--color-border) p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  Notes
                </p>
                <p className="mt-1 text-sm font-medium text-(--color-main-text)">
                  {viewingExpense.notes || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ExpensesPage;
