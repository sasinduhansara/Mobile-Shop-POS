import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageSection from "../components/ui/PageSection.jsx";

const panelClassName =
  "rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm";

const kpiCards = [
  { label: "Today Sales", value: "LKR 148,500", trend: "+12.4%", tone: "up" },
  { label: "Orders Today", value: "46", trend: "+8.3%", tone: "up" },
  { label: "Pending Repairs", value: "19", trend: "+2", tone: "neutral" },
  { label: "Low Stock Items", value: "7", trend: "-1", tone: "down" },
  { label: "Total Products", value: "1,286", trend: "+14", tone: "up" },
  { label: "Repair Income", value: "LKR 62,300", trend: "+6.7%", tone: "up" },
];

const salesChartData = [
  { day: "Mon", sales: 86000 },
  { day: "Tue", sales: 91000 },
  { day: "Wed", sales: 104000 },
  { day: "Thu", sales: 97000 },
  { day: "Fri", sales: 121000 },
  { day: "Sat", sales: 139000 },
  { day: "Sun", sales: 148500 },
];

const monthlyIncomeTrend = [
  { month: "Jan", income: 1820000 },
  { month: "Feb", income: 1950000 },
  { month: "Mar", income: 2040000 },
  { month: "Apr", income: 2160000 },
  { month: "May", income: 2310000 },
  { month: "Jun", income: 2480000 },
];

const topSellingProducts = [
  {
    name: "iPhone 14 Pro Max",
    category: "Smartphone",
    qty: 32,
    revenue: "LKR 5,120,000",
  },
  {
    name: "Samsung A55",
    category: "Smartphone",
    qty: 28,
    revenue: "LKR 2,212,000",
  },
  {
    name: "AirPods Pro 2",
    category: "Accessories",
    qty: 52,
    revenue: "LKR 2,600,000",
  },
  {
    name: "Power Bank 20,000mAh",
    category: "Accessories",
    qty: 67,
    revenue: "LKR 1,005,000",
  },
];

const recentTransactions = [
  {
    id: "TXN-1048",
    customer: "N. Fernando",
    amount: "LKR 186,000",
    method: "Card",
    status: "Paid",
  },
  {
    id: "TXN-1047",
    customer: "P. Silva",
    amount: "LKR 12,500",
    method: "Cash",
    status: "Paid",
  },
  {
    id: "TXN-1046",
    customer: "A. Perera",
    amount: "LKR 8,200",
    method: "QR",
    status: "Pending",
  },
  {
    id: "TXN-1045",
    customer: "S. Jayasuriya",
    amount: "LKR 44,900",
    method: "Card",
    status: "Paid",
  },
];

const recentSales = [
  {
    invoice: "INV-562",
    customer: "K. Deen",
    total: "LKR 244,000",
    time: "10:42 AM",
  },
  {
    invoice: "INV-561",
    customer: "R. Gamage",
    total: "LKR 39,500",
    time: "10:18 AM",
  },
  {
    invoice: "INV-560",
    customer: "M. Nawaz",
    total: "LKR 18,000",
    time: "09:56 AM",
  },
  {
    invoice: "INV-559",
    customer: "D. Kalan",
    total: "LKR 9,900",
    time: "09:37 AM",
  },
];

const recentRepairs = [
  {
    jobId: "REP-228",
    device: "iPhone 13",
    issue: "Display replacement",
    status: "In Progress",
    eta: "Today 5:30 PM",
  },
  {
    jobId: "REP-227",
    device: "Samsung S21",
    issue: "Battery issue",
    status: "Pending",
    eta: "Tomorrow",
  },
  {
    jobId: "REP-226",
    device: "Redmi Note 12",
    issue: "Charging port",
    status: "Completed",
    eta: "Ready",
  },
  {
    jobId: "REP-225",
    device: "iPad Air",
    issue: "Speaker issue",
    status: "In Progress",
    eta: "Tue",
  },
];

const warrantyExpiringSoon = [
  {
    customer: "K. Fernando",
    product: "Samsung A34",
    daysLeft: 7,
    level: "High",
  },
  {
    customer: "M. Silva",
    product: "OnePlus Nord CE",
    daysLeft: 12,
    level: "Medium",
  },
  { customer: "T. Madushan", product: "iPhone 13", daysLeft: 20, level: "Low" },
  { customer: "R. Perera", product: "AirPods 3", daysLeft: 28, level: "Low" },
];

const toneClassMap = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-(--color-muted-text)",
};

const paymentStatusClasses = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
};

const repairStatusClasses = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const warrantyLevelClasses = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

function SafeResponsiveContainer({ children, className, minHeight }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: minHeight });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

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

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleMeasure);
      observer.observe(node);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleMeasure);
      if (observer) {
        observer.disconnect();
      }
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

function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Dashboard"
        description="Mobile Shop POS live overview with sales, repairs, stock alerts, and performance metrics."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <article key={card.label} className={`${panelClassName} p-4`}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-muted-text)">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              {card.value}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${toneClassMap[card.tone]}`}
            >
              {card.trend}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className={`${panelClassName} min-w-0 xl:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-(--color-main-text)">
              Sales Chart
            </h3>
            <span className="rounded-full bg-(--color-menu-btn-hover) px-3 py-1 text-xs font-medium text-(--color-muted-text)">
              Last 7 Days
            </span>
          </div>

          <SafeResponsiveContainer
            className="mt-4 h-64 w-full min-w-0 min-h-64"
            minHeight={240}
          >
            {({ width, height }) => (
              <BarChart width={width} height={height} data={salesChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-text)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-text)", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="var(--color-accent)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </SafeResponsiveContainer>
        </article>

        <div className="space-y-4 min-w-0">
          <article className={panelClassName}>
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Monthly Income
            </h3>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              LKR 2,480,000
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              +8.6% from last month
            </p>

            <SafeResponsiveContainer
              className="mt-4 h-20 w-full min-w-0 min-h-20"
              minHeight={80}
            >
              {({ width, height }) => (
                <LineChart
                  width={width}
                  height={height}
                  data={monthlyIncomeTrend}
                >
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-accent)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  />
                </LineChart>
              )}
            </SafeResponsiveContainer>
          </article>

          <article className={panelClassName}>
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Best Selling Category
            </h3>
            <p className="mt-2 text-xl font-semibold text-(--color-main-text)">
              Smartphones
            </p>
            <p className="mt-1 text-sm text-(--color-muted-text)">
              312 units sold this month
            </p>
            <p className="mt-4 text-xs font-medium text-emerald-600">
              Revenue: LKR 18,740,000
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className={panelClassName}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Recent Transactions
          </h3>
          <ul className="mt-4 space-y-3">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {transaction.customer}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      paymentStatusClasses[transaction.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {transaction.id} • {transaction.method}
                </p>
                <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                  {transaction.amount}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className={panelClassName}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Recent Repairs
          </h3>
          <ul className="mt-4 space-y-3">
            {recentRepairs.map((repair) => (
              <li
                key={repair.jobId}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {repair.device}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      repairStatusClasses[repair.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {repair.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {repair.issue}
                </p>
                <p className="mt-1 text-xs font-medium text-(--color-muted-text)">
                  ETA: {repair.eta}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className={panelClassName}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Warranty Expiring Soon
          </h3>
          <ul className="mt-4 space-y-3">
            {warrantyExpiringSoon.map((item) => (
              <li
                key={`${item.customer}-${item.product}`}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {item.customer}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      warrantyLevelClasses[item.level] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.level}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {item.product}
                </p>
                <p className="mt-1 text-xs font-medium text-(--color-muted-text)">
                  {item.daysLeft} days remaining
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-3">
        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Top Selling Products
          </h3>

          <div className="mt-4 space-y-3 sm:hidden">
            {topSellingProducts.map((product) => (
              <article
                key={`${product.name}-mobile`}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-(--color-main-text)">
                      {product.name}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {product.category}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-(--color-main-text)">
                    {product.qty}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-(--color-main-text)">
                  {product.revenue}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((product) => (
                  <tr
                    key={product.name}
                    className="border-t border-(--color-border)"
                  >
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-(--color-main-text)">
                        {product.name}
                      </p>
                      <p className="text-xs text-(--color-muted-text)">
                        {product.category}
                      </p>
                    </td>
                    <td className="w-16 py-2.5 pr-3 text-(--color-main-text)">
                      {product.qty}
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-(--color-main-text)">
                      {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Recent Sales
          </h3>
          <ul className="mt-4 space-y-3">
            {recentSales.map((sale) => (
              <li
                key={sale.invoice}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-(--color-main-text)">
                    {sale.invoice}
                  </p>
                  <p className="text-xs text-(--color-muted-text)">
                    {sale.time}
                  </p>
                </div>
                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {sale.customer}
                </p>
                <p className="mt-1 text-sm font-semibold text-(--color-main-text)">
                  {sale.total}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-base font-semibold text-(--color-main-text)">
            Recent Repairs
          </h3>

          <ul className="mt-4 space-y-3 sm:hidden">
            {recentRepairs.map((repair) => (
              <li
                key={`${repair.jobId}-mobile`}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-(--color-main-text)">
                      {repair.jobId}
                    </p>
                    <p className="truncate text-xs text-(--color-muted-text)">
                      {repair.device}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      repairStatusClasses[repair.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {repair.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-(--color-muted-text)">
                  ETA: {repair.eta}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <th className="pb-2">Job</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentRepairs.map((repair) => (
                  <tr
                    key={`${repair.jobId}-table`}
                    className="border-t border-(--color-border)"
                  >
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-(--color-main-text)">
                        {repair.jobId}
                      </p>
                      <p className="text-xs text-(--color-muted-text)">
                        {repair.device}
                      </p>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          repairStatusClasses[repair.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {repair.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-(--color-main-text)">
                      {repair.eta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
