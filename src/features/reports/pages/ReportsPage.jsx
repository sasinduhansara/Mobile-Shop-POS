import { useEffect, useMemo, useRef, useState } from 'react'
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
} from 'recharts'
import { currencyFormat } from '../../../utils/currencyFormat.js'

const panelClassName =
  'rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm'

const chartPalette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const DATE_RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
]

const REPORT_TYPE_OPTIONS = [
  { value: 'overview', label: 'Overview Dashboard' },
  { value: 'sales', label: 'Sales Report' },
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'repairs', label: 'Repair Report' },
  { value: 'customers', label: 'Customer Report' },
  { value: 'financial', label: 'Financial Report' },
]

const makeDate = (value) => new Date(`${value}T12:00:00`)

const formatDate = (value) => makeDate(value).toLocaleDateString('en-LK')

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const createOrder = ({
  id,
  date,
  customer,
  paymentMethod,
  supplier,
  product,
  category,
  quantity,
  unitPrice,
  unitCost,
}) => ({
  id,
  date,
  customer,
  paymentMethod,
  supplier,
  product,
  category,
  quantity,
  unitPrice,
  unitCost,
  total: quantity * unitPrice,
  profit: quantity * (unitPrice - unitCost),
})

const salesOrders = [
  createOrder({
    id: 'INV-7001',
    date: '2026-01-06',
    customer: 'N. Fernando',
    paymentMethod: 'Card',
    supplier: 'ABC Mobile Distributor',
    product: 'iPhone 14 Pro Max',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 385000,
    unitCost: 320000,
  }),
  createOrder({
    id: 'INV-7002',
    date: '2026-01-08',
    customer: 'P. Silva',
    paymentMethod: 'Cash',
    supplier: 'Smart Accessory House',
    product: 'Type-C Cable 1m',
    category: 'Accessories',
    quantity: 5,
    unitPrice: 1900,
    unitCost: 900,
  }),
  createOrder({
    id: 'INV-7003',
    date: '2026-01-12',
    customer: 'T. Raj',
    paymentMethod: 'Bank Transfer',
    supplier: 'Tech Parts Lanka',
    product: 'Battery Pack - Samsung A Series',
    category: 'Spare Parts',
    quantity: 2,
    unitPrice: 12800,
    unitCost: 8200,
  }),
  createOrder({
    id: 'INV-7004',
    date: '2026-01-15',
    customer: 'S. Jayasuriya',
    paymentMethod: 'Card',
    supplier: 'ABC Mobile Distributor',
    product: 'Samsung Galaxy A55',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 124000,
    unitCost: 108000,
  }),
  createOrder({
    id: 'INV-7005',
    date: '2026-01-20',
    customer: 'K. Deen',
    paymentMethod: 'Cash',
    supplier: 'Global Gadget Imports',
    product: 'JBL Flip 6',
    category: 'Electronic Items',
    quantity: 1,
    unitPrice: 38900,
    unitCost: 28900,
  }),
  createOrder({
    id: 'INV-7006',
    date: '2026-01-24',
    customer: 'R. Gamage',
    paymentMethod: 'QR',
    supplier: 'Smart Accessory House',
    product: 'Tempered Glass iPhone',
    category: 'Accessories',
    quantity: 8,
    unitPrice: 1200,
    unitCost: 380,
  }),
  createOrder({
    id: 'INV-7007',
    date: '2026-02-02',
    customer: 'M. Nawaz',
    paymentMethod: 'Cash',
    supplier: 'ABC Mobile Distributor',
    product: 'Redmi Note 13',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 79900,
    unitCost: 69000,
  }),
  createOrder({
    id: 'INV-7008',
    date: '2026-02-04',
    customer: 'D. Kalan',
    paymentMethod: 'Card',
    supplier: 'Smart Accessory House',
    product: 'Anker 30W Fast Charger',
    category: 'Accessories',
    quantity: 3,
    unitPrice: 9500,
    unitCost: 6200,
  }),
  createOrder({
    id: 'INV-7009',
    date: '2026-02-09',
    customer: 'F. Ahamed',
    paymentMethod: 'Bank Transfer',
    supplier: 'Global Gadget Imports',
    product: 'Sony WH-CH520',
    category: 'Electronic Items',
    quantity: 2,
    unitPrice: 21900,
    unitCost: 14900,
  }),
  createOrder({
    id: 'INV-7010',
    date: '2026-02-12',
    customer: 'H. Perera',
    paymentMethod: 'Cash',
    supplier: 'ABC Mobile Distributor',
    product: 'iPhone 14 Pro Max',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 385000,
    unitCost: 320000,
  }),
  createOrder({
    id: 'INV-7011',
    date: '2026-02-14',
    customer: 'S. Dilshan',
    paymentMethod: 'QR',
    supplier: 'Tech Parts Lanka',
    product: 'Charging Port - iPhone 12/13',
    category: 'Spare Parts',
    quantity: 3,
    unitPrice: 4600,
    unitCost: 3100,
  }),
  createOrder({
    id: 'INV-7012',
    date: '2026-02-18',
    customer: 'N. Fernando',
    paymentMethod: 'Card',
    supplier: 'Smart Accessory House',
    product: 'Power Bank 20,000mAh',
    category: 'Electronic Items',
    quantity: 2,
    unitPrice: 16200,
    unitCost: 9800,
  }),
  createOrder({
    id: 'INV-7013',
    date: '2026-02-21',
    customer: 'K. Deen',
    paymentMethod: 'Cash',
    supplier: 'Smart Accessory House',
    product: 'Silicon Back Cover',
    category: 'Accessories',
    quantity: 10,
    unitPrice: 1800,
    unitCost: 650,
  }),
  createOrder({
    id: 'INV-7014',
    date: '2026-02-26',
    customer: 'R. Gamage',
    paymentMethod: 'Card',
    supplier: 'ABC Mobile Distributor',
    product: 'Samsung Galaxy A55',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 124000,
    unitCost: 108000,
  }),
  createOrder({
    id: 'INV-7015',
    date: '2026-03-01',
    customer: 'M. Nawaz',
    paymentMethod: 'Cash',
    supplier: 'Smart Accessory House',
    product: 'Type-C Cable 1m',
    category: 'Accessories',
    quantity: 6,
    unitPrice: 1900,
    unitCost: 900,
  }),
  createOrder({
    id: 'INV-7016',
    date: '2026-03-03',
    customer: 'D. Kalan',
    paymentMethod: 'Card',
    supplier: 'Global Gadget Imports',
    product: 'JBL Flip 6',
    category: 'Electronic Items',
    quantity: 1,
    unitPrice: 38900,
    unitCost: 28900,
  }),
  createOrder({
    id: 'INV-7017',
    date: '2026-03-05',
    customer: 'F. Ahamed',
    paymentMethod: 'QR',
    supplier: 'Tech Parts Lanka',
    product: 'Battery Pack - Samsung A Series',
    category: 'Spare Parts',
    quantity: 2,
    unitPrice: 12800,
    unitCost: 8200,
  }),
  createOrder({
    id: 'INV-7018',
    date: '2026-03-06',
    customer: 'H. Perera',
    paymentMethod: 'Bank Transfer',
    supplier: 'ABC Mobile Distributor',
    product: 'Redmi Note 13',
    category: 'Mobile Phones',
    quantity: 2,
    unitPrice: 79900,
    unitCost: 69000,
  }),
  createOrder({
    id: 'INV-7019',
    date: '2026-03-08',
    customer: 'S. Dilshan',
    paymentMethod: 'Cash',
    supplier: 'Smart Accessory House',
    product: 'Anker 30W Fast Charger',
    category: 'Accessories',
    quantity: 2,
    unitPrice: 9500,
    unitCost: 6200,
  }),
  createOrder({
    id: 'INV-7020',
    date: '2026-03-09',
    customer: 'N. Fernando',
    paymentMethod: 'Card',
    supplier: 'ABC Mobile Distributor',
    product: 'iPhone 14 Pro Max',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 385000,
    unitCost: 320000,
  }),
  createOrder({
    id: 'INV-7021',
    date: '2026-03-10',
    customer: 'K. Deen',
    paymentMethod: 'Cash',
    supplier: 'Global Gadget Imports',
    product: 'Sony WH-CH520',
    category: 'Electronic Items',
    quantity: 1,
    unitPrice: 21900,
    unitCost: 14900,
  }),
  createOrder({
    id: 'INV-7022',
    date: '2026-03-11',
    customer: 'R. Gamage',
    paymentMethod: 'QR',
    supplier: 'Smart Accessory House',
    product: 'Tempered Glass iPhone',
    category: 'Accessories',
    quantity: 5,
    unitPrice: 1200,
    unitCost: 380,
  }),
  createOrder({
    id: 'INV-7023',
    date: '2026-03-12',
    customer: 'M. Nawaz',
    paymentMethod: 'Card',
    supplier: 'ABC Mobile Distributor',
    product: 'Samsung Galaxy A55',
    category: 'Mobile Phones',
    quantity: 1,
    unitPrice: 124000,
    unitCost: 108000,
  }),
  createOrder({
    id: 'INV-7024',
    date: '2026-03-12',
    customer: 'D. Kalan',
    paymentMethod: 'Cash',
    supplier: 'Smart Accessory House',
    product: 'Silicon Back Cover',
    category: 'Accessories',
    quantity: 6,
    unitPrice: 1800,
    unitCost: 650,
  }),
]

const inventoryItems = [
  {
    id: 'INV-1001',
    product: 'iPhone 14 Pro Max',
    category: 'Mobile Phones',
    currentStock: 7,
    minStock: 4,
    unitCost: 320000,
    lastUpdated: '2026-03-11',
  },
  {
    id: 'INV-1002',
    product: 'Samsung Galaxy A55',
    category: 'Mobile Phones',
    currentStock: 14,
    minStock: 5,
    unitCost: 108000,
    lastUpdated: '2026-03-11',
  },
  {
    id: 'INV-1003',
    product: 'Redmi Note 13',
    category: 'Mobile Phones',
    currentStock: 9,
    minStock: 5,
    unitCost: 69000,
    lastUpdated: '2026-03-10',
  },
  {
    id: 'INV-1004',
    product: 'Silicon Back Cover',
    category: 'Accessories',
    currentStock: 28,
    minStock: 15,
    unitCost: 650,
    lastUpdated: '2026-03-12',
  },
  {
    id: 'INV-1005',
    product: 'Anker 30W Fast Charger',
    category: 'Accessories',
    currentStock: 3,
    minStock: 8,
    unitCost: 6200,
    lastUpdated: '2026-03-12',
  },
  {
    id: 'INV-1006',
    product: 'Type-C Cable 1m',
    category: 'Accessories',
    currentStock: 0,
    minStock: 12,
    unitCost: 900,
    lastUpdated: '2026-03-11',
  },
  {
    id: 'INV-1007',
    product: 'Battery Pack - Samsung A Series',
    category: 'Spare Parts',
    currentStock: 6,
    minStock: 5,
    unitCost: 8200,
    lastUpdated: '2026-03-10',
  },
  {
    id: 'INV-1008',
    product: 'JBL Flip 6',
    category: 'Electronic Items',
    currentStock: 2,
    minStock: 4,
    unitCost: 28900,
    lastUpdated: '2026-03-09',
  },
]

const stockMovements = [
  {
    id: 'MOV-2001',
    date: '2026-03-12',
    product: 'Silicon Back Cover',
    category: 'Accessories',
    type: 'OUT',
    quantity: 6,
    reason: 'Sales',
  },
  {
    id: 'MOV-2002',
    date: '2026-03-11',
    product: 'Type-C Cable 1m',
    category: 'Accessories',
    type: 'OUT',
    quantity: 9,
    reason: 'Sales',
  },
  {
    id: 'MOV-2003',
    date: '2026-03-11',
    product: 'Anker 30W Fast Charger',
    category: 'Accessories',
    type: 'IN',
    quantity: 10,
    reason: 'Restock',
  },
  {
    id: 'MOV-2004',
    date: '2026-03-10',
    product: 'iPhone 14 Pro Max',
    category: 'Mobile Phones',
    type: 'OUT',
    quantity: 1,
    reason: 'Sales',
  },
  {
    id: 'MOV-2005',
    date: '2026-03-09',
    product: 'JBL Flip 6',
    category: 'Electronic Items',
    type: 'OUT',
    quantity: 1,
    reason: 'Sales',
  },
]

const repairJobs = [
  {
    id: 'REP-4001',
    date: '2026-03-12',
    customer: 'K. Deen',
    issue: 'Display replacement',
    status: 'Pending',
    revenue: 0,
  },
  {
    id: 'REP-4002',
    date: '2026-03-11',
    customer: 'N. Fernando',
    issue: 'Battery issue',
    status: 'Completed',
    revenue: 18500,
  },
  {
    id: 'REP-4003',
    date: '2026-03-10',
    customer: 'R. Gamage',
    issue: 'Charging port repair',
    status: 'In Progress',
    revenue: 0,
  },
  {
    id: 'REP-4004',
    date: '2026-03-07',
    customer: 'D. Kalan',
    issue: 'Speaker issue',
    status: 'Completed',
    revenue: 9800,
  },
  {
    id: 'REP-4005',
    date: '2026-03-03',
    customer: 'M. Nawaz',
    issue: 'Software issue',
    status: 'Delivered',
    revenue: 6500,
  },
  {
    id: 'REP-4006',
    date: '2026-02-25',
    customer: 'T. Raj',
    issue: 'Display replacement',
    status: 'Delivered',
    revenue: 22500,
  },
]

const customerRegistry = [
  { id: 'CUS-1001', name: 'N. Fernando', joinedDate: '2026-01-05' },
  { id: 'CUS-1002', name: 'K. Deen', joinedDate: '2026-01-15' },
  { id: 'CUS-1003', name: 'R. Gamage', joinedDate: '2026-02-01' },
  { id: 'CUS-1004', name: 'M. Nawaz', joinedDate: '2026-02-28' },
  { id: 'CUS-1005', name: 'D. Kalan', joinedDate: '2026-03-05' },
  { id: 'CUS-1006', name: 'F. Ahamed', joinedDate: '2026-03-08' },
  { id: 'CUS-1007', name: 'S. Dilshan', joinedDate: '2026-03-09' },
  { id: 'CUS-1008', name: 'H. Perera', joinedDate: '2026-03-10' },
]

const expenses = [
  { id: 'EXP-001', date: '2026-03-02', category: 'Rent', amount: 120000 },
  { id: 'EXP-002', date: '2026-03-05', category: 'Utilities', amount: 28500 },
  { id: 'EXP-003', date: '2026-03-09', category: 'Staff Salary', amount: 180000 },
  { id: 'EXP-004', date: '2026-03-11', category: 'Marketing', amount: 24000 },
  { id: 'EXP-005', date: '2026-03-12', category: 'Transport', amount: 8600 },
  { id: 'EXP-006', date: '2026-02-20', category: 'Maintenance', amount: 14300 },
]

const advancedCategoryOptions = [
  'All Categories',
  'Mobile Phones',
  'Accessories',
  'Spare Parts',
  'Electronic Items',
]

const paymentMethodOptions = ['All Methods', 'Cash', 'Card', 'QR', 'Bank Transfer']

const downloadHistorySeed = [
  {
    id: 'DL-9001',
    report: 'Sales Report',
    format: 'CSV',
    downloadedAt: '2026-03-11 18:10',
    user: 'Owner',
  },
  {
    id: 'DL-9002',
    report: 'Financial Report',
    format: 'Excel',
    downloadedAt: '2026-03-10 09:24',
    user: 'Owner',
  },
]

const formatDateTime = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const mins = String(dateObj.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${mins}`
}

const getDateRangeByPreset = (preset, customRange) => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (preset === 'today') {
    return { start: end, end, label: 'Today' }
  }

  if (preset === 'yesterday') {
    const start = new Date(end)
    start.setDate(start.getDate() - 1)
    return { start, end: start, label: 'Yesterday' }
  }

  if (preset === 'last7') {
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return { start, end, label: 'Last 7 Days' }
  }

  if (preset === 'last30') {
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    return { start, end, label: 'Last 30 Days' }
  }

  const customStart = customRange.start ? makeDate(customRange.start) : null
  const customEnd = customRange.end ? makeDate(customRange.end) : null

  if (!customStart && !customEnd) {
    return { start: null, end: null, label: 'All Dates' }
  }

  const normalizedStart = customStart || customEnd
  const normalizedEnd = customEnd || customStart

  if (!normalizedStart || !normalizedEnd) {
    return { start: null, end: null, label: 'All Dates' }
  }

  const finalStart = normalizedStart <= normalizedEnd ? normalizedStart : normalizedEnd
  const finalEnd = normalizedStart <= normalizedEnd ? normalizedEnd : normalizedStart

  return {
    start: finalStart,
    end: finalEnd,
    label: `${formatDate(formatDateTime(finalStart).slice(0, 10))} - ${formatDate(
      formatDateTime(finalEnd).slice(0, 10),
    )}`,
  }
}

const inDateRange = (value, range) => {
  const date = makeDate(value)

  if (range.start && date < range.start) return false
  if (range.end && date > range.end) return false

  return true
}

const toWeekStartDate = (value) => {
  const date = makeDate(value)
  const dayOffset = (date.getDay() + 6) % 7
  const monday = new Date(date)
  monday.setDate(monday.getDate() - dayOffset)
  return monday.toISOString().slice(0, 10)
}

const makeCsv = (rows) => {
  if (!rows.length) return ''

  const columns = Object.keys(rows[0])
  const header = columns.join(',')

  const values = rows.map((row) =>
    columns
      .map((column) => {
        const value = String(row[column] ?? '')
        if (/[",\n]/.test(value)) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(','),
  )

  return [header, ...values].join('\n')
}

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(href)
}

function SafeChartContainer({ minHeight = 280, className = '', children }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: minHeight })

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined

    let frame = 0
    let observer

    const measure = () => {
      const rect = node.getBoundingClientRect()
      const nextWidth = Math.max(0, Math.floor(rect.width))
      const nextHeight = Math.max(minHeight, Math.floor(rect.height))

      setSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      )
    }

    const onResize = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measure)
    }

    onResize()

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(onResize)
      observer.observe(node)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      if (observer) observer.disconnect()
    }
  }, [minHeight])

  const ready = size.width > 0 && size.height > 0

  return (
    <div ref={containerRef} className={className} style={{ minHeight }}>
      {ready ? (
        children(size)
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-(--color-menu-btn-hover)" />
      )}
    </div>
  )
}

function ReportsPage() {
  const [datePreset, setDatePreset] = useState('last30')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Methods')
  const [customerFilter, setCustomerFilter] = useState('All Customers')
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers')

  const [exportReportType, setExportReportType] = useState('overview')
  const [downloadHistory, setDownloadHistory] = useState(downloadHistorySeed)

  const customers = useMemo(() => {
    const uniqueNames = new Set(customerRegistry.map((customer) => customer.name))
    return ['All Customers', ...Array.from(uniqueNames).sort()]
  }, [])

  const suppliers = useMemo(() => {
    const uniqueNames = new Set(salesOrders.map((order) => order.supplier))
    return ['All Suppliers', ...Array.from(uniqueNames).sort()]
  }, [])

  const activeDateRange = useMemo(
    () => getDateRangeByPreset(datePreset, customRange),
    [datePreset, customRange],
  )

  const advancedFilteredOrders = useMemo(
    () =>
      salesOrders.filter((order) => {
        const categoryOk =
          categoryFilter === 'All Categories' || order.category === categoryFilter
        const paymentMethodOk =
          paymentMethodFilter === 'All Methods' ||
          order.paymentMethod === paymentMethodFilter
        const customerOk =
          customerFilter === 'All Customers' || order.customer === customerFilter
        const supplierOk =
          supplierFilter === 'All Suppliers' || order.supplier === supplierFilter

        return categoryOk && paymentMethodOk && customerOk && supplierOk
      }),
    [categoryFilter, customerFilter, paymentMethodFilter, supplierFilter],
  )

  const filteredSalesOrders = useMemo(
    () => advancedFilteredOrders.filter((order) => inDateRange(order.date, activeDateRange)),
    [advancedFilteredOrders, activeDateRange],
  )

  const filteredRepairs = useMemo(
    () => repairJobs.filter((repair) => inDateRange(repair.date, activeDateRange)),
    [activeDateRange],
  )

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => inDateRange(expense.date, activeDateRange)),
    [activeDateRange],
  )

  const filteredCustomers = useMemo(
    () =>
      customerRegistry.filter((customer) =>
        inDateRange(customer.joinedDate, activeDateRange),
      ),
    [activeDateRange],
  )

  const summaryCards = useMemo(() => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const salesToday = advancedFilteredOrders
      .filter((order) => isSameDay(makeDate(order.date), today))
      .reduce((sum, order) => sum + order.total, 0)

    const salesThisMonth = advancedFilteredOrders
      .filter((order) => makeDate(order.date) >= monthStart)
      .reduce((sum, order) => sum + order.total, 0)

    const totalOrders = filteredSalesOrders.length

    const totalProfit = filteredSalesOrders.reduce(
      (sum, order) => sum + order.profit,
      0,
    )

    const totalRepairRevenue = filteredRepairs.reduce(
      (sum, repair) => sum + repair.revenue,
      0,
    )

    const totalCustomers = new Set(filteredSalesOrders.map((order) => order.customer)).size

    return [
      { label: 'Total Sales Today', value: currencyFormat(salesToday) },
      { label: 'Total Sales This Month', value: currencyFormat(salesThisMonth) },
      { label: 'Total Orders', value: totalOrders.toString() },
      { label: 'Total Profit', value: currencyFormat(totalProfit) },
      { label: 'Total Repair Revenue', value: currencyFormat(totalRepairRevenue) },
      { label: 'Total Customers', value: totalCustomers.toString() },
    ]
  }, [advancedFilteredOrders, filteredRepairs, filteredSalesOrders])

  const groupedSales = useMemo(() => {
    const buckets = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map(),
      yearly: new Map(),
      paymentMethod: new Map(),
      customer: new Map(),
      category: new Map(),
      product: new Map(),
    }

    filteredSalesOrders.forEach((order) => {
      const dayKey = order.date
      const weekKey = toWeekStartDate(order.date)
      const monthKey = order.date.slice(0, 7)
      const yearKey = order.date.slice(0, 4)

      const setTotal = (map, key, amount) =>
        map.set(key, (map.get(key) || 0) + amount)

      setTotal(buckets.daily, dayKey, order.total)
      setTotal(buckets.weekly, weekKey, order.total)
      setTotal(buckets.monthly, monthKey, order.total)
      setTotal(buckets.yearly, yearKey, order.total)
      setTotal(buckets.paymentMethod, order.paymentMethod, order.total)
      setTotal(buckets.customer, order.customer, order.total)
      setTotal(buckets.category, order.category, order.total)

      const existingProduct = buckets.product.get(order.product) || {
        product: order.product,
        category: order.category,
        quantity: 0,
        revenue: 0,
      }

      existingProduct.quantity += order.quantity
      existingProduct.revenue += order.total
      buckets.product.set(order.product, existingProduct)
    })

    const mapToRows = (map, keyLabel) =>
      Array.from(map.entries())
        .sort((left, right) => String(left[0]).localeCompare(String(right[0])))
        .map(([key, value]) => ({ [keyLabel]: key, revenue: value }))

    const productRows = Array.from(buckets.product.values())

    return {
      daily: mapToRows(buckets.daily, 'period'),
      weekly: mapToRows(buckets.weekly, 'period'),
      monthly: mapToRows(buckets.monthly, 'period'),
      yearly: mapToRows(buckets.yearly, 'period'),
      paymentMethod: mapToRows(buckets.paymentMethod, 'method'),
      customer: mapToRows(buckets.customer, 'customer'),
      category: mapToRows(buckets.category, 'category'),
      product: productRows,
    }
  }, [filteredSalesOrders])

  const salesTrendData = useMemo(() => {
    const source = groupedSales.daily.length
      ? groupedSales.daily
      : [{ period: 'No Data', revenue: 0 }]

    return source.slice(-12).map((entry) => ({
      label: entry.period === 'No Data' ? entry.period : entry.period.slice(5),
      revenue: entry.revenue,
    }))
  }, [groupedSales.daily])

  const topProducts = useMemo(
    () =>
      [...groupedSales.product]
        .sort((left, right) => right.quantity - left.quantity)
        .slice(0, 6),
    [groupedSales.product],
  )

  const leastProducts = useMemo(
    () =>
      [...groupedSales.product]
        .sort((left, right) => left.quantity - right.quantity)
        .slice(0, 5),
    [groupedSales.product],
  )

  const categorySalesData = useMemo(
    () =>
      groupedSales.category.length
        ? groupedSales.category.map((row) => ({
            name: row.category,
            value: row.revenue,
          }))
        : [{ name: 'No Data', value: 1 }],
    [groupedSales.category],
  )

  const inventorySummary = useMemo(() => {
    const categoryAppliedInventory =
      categoryFilter === 'All Categories'
        ? inventoryItems
        : inventoryItems.filter((item) => item.category === categoryFilter)

    const totalProducts = categoryAppliedInventory.length
    const totalStockQuantity = categoryAppliedInventory.reduce(
      (sum, item) => sum + item.currentStock,
      0,
    )

    const lowStockItems = categoryAppliedInventory.filter(
      (item) => item.currentStock > 0 && item.currentStock <= item.minStock,
    )

    const outOfStockItems = categoryAppliedInventory.filter(
      (item) => item.currentStock <= 0,
    )

    const inventoryValue = categoryAppliedInventory.reduce(
      (sum, item) => sum + item.currentStock * item.unitCost,
      0,
    )

    const movementReport = stockMovements.filter((entry) =>
      categoryFilter === 'All Categories' ? true : entry.category === categoryFilter,
    )

    return {
      items: categoryAppliedInventory,
      totalProducts,
      totalStockQuantity,
      lowStockItems,
      outOfStockItems,
      inventoryValue,
      movementReport,
    }
  }, [categoryFilter])

  const repairSummary = useMemo(() => {
    const totalRepairJobs = filteredRepairs.length
    const completedRepairs = filteredRepairs.filter(
      (repair) => repair.status === 'Completed' || repair.status === 'Delivered',
    ).length
    const pendingRepairs = filteredRepairs.filter(
      (repair) => repair.status === 'Pending' || repair.status === 'In Progress',
    ).length

    const repairRevenue = filteredRepairs.reduce(
      (sum, repair) => sum + repair.revenue,
      0,
    )

    const issueMap = new Map()
    filteredRepairs.forEach((repair) => {
      issueMap.set(repair.issue, (issueMap.get(repair.issue) || 0) + 1)
    })

    const mostCommonIssues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4)

    return {
      totalRepairJobs,
      completedRepairs,
      pendingRepairs,
      repairRevenue,
      mostCommonIssues,
    }
  }, [filteredRepairs])

  const customerSummary = useMemo(() => {
    const spendMap = new Map()
    const purchaseCountMap = new Map()

    filteredSalesOrders.forEach((order) => {
      spendMap.set(order.customer, (spendMap.get(order.customer) || 0) + order.total)
      purchaseCountMap.set(
        order.customer,
        (purchaseCountMap.get(order.customer) || 0) + 1,
      )
    })

    const repeatCustomers = Array.from(purchaseCountMap.values()).filter(
      (count) => count > 1,
    ).length

    const topCustomers = Array.from(spendMap.entries())
      .map(([name, totalSpent]) => ({ name, totalSpent }))
      .sort((left, right) => right.totalSpent - left.totalSpent)
      .slice(0, 5)

    const purchaseTrend = groupedSales.monthly.map((entry) => ({
      month: entry.period,
      spending: entry.revenue,
    }))

    return {
      totalCustomers: spendMap.size,
      newCustomers: filteredCustomers.length,
      repeatCustomers,
      topCustomers,
      purchaseTrend,
    }
  }, [filteredCustomers.length, filteredSalesOrders, groupedSales.monthly])

  const financialSummary = useMemo(() => {
    const salesRevenue = filteredSalesOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    )

    const repairRevenue = filteredRepairs.reduce(
      (sum, repair) => sum + repair.revenue,
      0,
    )

    const revenue = salesRevenue + repairRevenue

    const grossProfit =
      filteredSalesOrders.reduce((sum, order) => sum + order.profit, 0) +
      repairRevenue * 0.45

    const expenseTotal = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    )

    const netIncome = revenue - expenseTotal

    return {
      revenue,
      grossProfit,
      expenseTotal,
      netIncome,
      barData: [
        { metric: 'Revenue', amount: revenue },
        { metric: 'Profit', amount: grossProfit },
        { metric: 'Expenses', amount: expenseTotal },
        { metric: 'Net Income', amount: netIncome },
      ],
    }
  }, [filteredExpenses, filteredRepairs, filteredSalesOrders])

  const getRowsByReportType = (reportType) => {
    if (reportType === 'overview') {
      return summaryCards.map((item) => ({ metric: item.label, value: item.value }))
    }

    if (reportType === 'sales') {
      return filteredSalesOrders.map((order) => ({
        invoice: order.id,
        date: order.date,
        customer: order.customer,
        product: order.product,
        category: order.category,
        paymentMethod: order.paymentMethod,
        supplier: order.supplier,
        quantity: order.quantity,
        revenue: order.total,
        profit: order.profit,
      }))
    }

    if (reportType === 'inventory') {
      return inventorySummary.items.map((item) => ({
        product: item.product,
        category: item.category,
        currentStock: item.currentStock,
        minimumStock: item.minStock,
        unitCost: item.unitCost,
        stockValue: item.currentStock * item.unitCost,
      }))
    }

    if (reportType === 'repairs') {
      return filteredRepairs.map((repair) => ({
        repairId: repair.id,
        date: repair.date,
        customer: repair.customer,
        issue: repair.issue,
        status: repair.status,
        revenue: repair.revenue,
      }))
    }

    if (reportType === 'customers') {
      return customerSummary.topCustomers.map((customer) => ({
        customer: customer.name,
        totalSpending: customer.totalSpent,
      }))
    }

    return [
      {
        revenue: financialSummary.revenue,
        profit: financialSummary.grossProfit,
        expenses: financialSummary.expenseTotal,
        netIncome: financialSummary.netIncome,
      },
    ]
  }

  const trackDownload = (format) => {
    const reportLabel =
      REPORT_TYPE_OPTIONS.find((item) => item.value === exportReportType)?.label ||
      'Report'

    setDownloadHistory((prev) => {
      const now = formatDateTime(new Date())
      const id = `DL-${Date.now()}`

      return [
        {
          id,
          report: reportLabel,
          format,
          downloadedAt: now,
          user: 'Owner',
        },
        ...prev,
      ].slice(0, 20)
    })
  }

  const onExportCsv = () => {
    const rows = getRowsByReportType(exportReportType)
    const csv = makeCsv(rows)

    downloadFile(
      csv,
      `${exportReportType}-report-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;',
    )

    trackDownload('CSV')
  }

  const onExportExcel = () => {
    const rows = getRowsByReportType(exportReportType)
    const columns = rows.length ? Object.keys(rows[0]) : []
    const tabular = [columns.join('\t')]

    rows.forEach((row) => {
      tabular.push(columns.map((column) => String(row[column] ?? '')).join('\t'))
    })

    downloadFile(
      tabular.join('\n'),
      `${exportReportType}-report-${new Date().toISOString().slice(0, 10)}.xls`,
      'application/vnd.ms-excel',
    )

    trackDownload('Excel')
  }

  const onExportPdf = () => {
    const rows = getRowsByReportType(exportReportType)
    const reportLabel =
      REPORT_TYPE_OPTIONS.find((item) => item.value === exportReportType)?.label ||
      'Report'

    const win = window.open('', '_blank', 'width=980,height=720')
    if (!win) return

    const previewRows = rows.slice(0, 20)
    const columns = previewRows.length ? Object.keys(previewRows[0]) : []

    const tableHead = columns
      .map((column) => `<th style="text-align:left;padding:8px;border-bottom:1px solid #d1d5db;">${column}</th>`)
      .join('')

    const tableBody = previewRows
      .map((row) => {
        const cells = columns
          .map(
            (column) =>
              `<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${String(
                row[column] ?? '',
              )}</td>`,
          )
          .join('')

        return `<tr>${cells}</tr>`
      })
      .join('')

    win.document.write(`
      <html>
        <head>
          <title>${reportLabel}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
          <h2 style="margin:0 0 8px 0;">${reportLabel}</h2>
          <p style="margin:0 0 20px 0; color:#6b7280;">Generated on ${formatDateTime(
            new Date(),
          )}</p>
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead><tr>${tableHead}</tr></thead>
            <tbody>${tableBody}</tbody>
          </table>
        </body>
      </html>
    `)

    win.document.close()
    win.focus()
    win.print()

    trackDownload('PDF')
  }

  const onPrintPage = () => {
    window.print()
    trackDownload('Print')
  }

  return (
    <div className="space-y-6">
      <section className={panelClassName}>
        <h2 className="text-xl font-semibold text-(--color-main-text)">
          Reports & Analytics
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--color-muted-text)">
          Business insights across sales, inventory, repairs, customers, and
          financial performance.
        </p>
      </section>

      <section className={`${panelClassName} space-y-5`}>
        <div className="flex flex-wrap items-center gap-2">
          {DATE_RANGE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setDatePreset(preset.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                datePreset === preset.value
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-(--color-border) text-(--color-main-text) hover:bg-(--color-menu-btn-hover)'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {datePreset === 'custom' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              From
              <input
                type="date"
                value={customRange.start}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, start: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text) outline-none focus:border-blue-400"
              />
            </label>
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              To
              <input
                type="date"
                value={customRange.end}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, end: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text) outline-none focus:border-blue-400"
              />
            </label>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Product Category
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              {advancedCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Payment Method
            <select
              value={paymentMethodFilter}
              onChange={(event) => setPaymentMethodFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              {paymentMethodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Customer
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              {customers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Supplier
            <select
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-main-text)"
            >
              {suppliers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--color-border) bg-slate-50 px-4 py-3 text-sm">
          <p className="text-(--color-muted-text)">
            Active Range: <span className="font-medium text-(--color-main-text)">{activeDateRange.label}</span>
          </p>
          <p className="text-(--color-muted-text)">
            Orders matched: <span className="font-semibold text-(--color-main-text)">{filteredSalesOrders.length}</span>
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className={panelClassName}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-muted-text)">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className={`${panelClassName} min-w-0 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-(--color-main-text)">Export & Print Reports</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={exportReportType}
              onChange={(event) => setExportReportType(event.target.value)}
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-main-text)"
            >
              {REPORT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onExportCsv}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={onPrintPage}
              className="rounded-lg bg-(--color-accent) px-3 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Print Reports
            </button>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Sales Trend Chart</h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </SafeChartContainer>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Product Sales Chart</h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="product"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </SafeChartContainer>
        </article>

        <article className={`${panelClassName} min-w-0`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Category Sales Pie Chart</h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <PieChart width={width} height={height}>
                <Pie
                  data={categorySalesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartPalette[index % chartPalette.length]}
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
          <h3 className="text-lg font-semibold text-(--color-main-text)">Revenue Bar Chart</h3>
          <SafeChartContainer className="mt-4 h-72 min-w-0" minHeight={260}>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={financialSummary.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip formatter={(value) => currencyFormat(value)} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {financialSummary.barData.map((entry, index) => (
                    <Cell
                      key={entry.metric}
                      fill={chartPalette[index % chartPalette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </SafeChartContainer>
        </article>
      </section>

      <section className={`${panelClassName} min-w-0 space-y-4`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">Sales Reports</h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              Daily Sales Report
            </p>
            <p className="mt-2 text-sm text-(--color-main-text)">{groupedSales.daily.length} entries</p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              Weekly Sales Report
            </p>
            <p className="mt-2 text-sm text-(--color-main-text)">{groupedSales.weekly.length} entries</p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              Monthly Sales Report
            </p>
            <p className="mt-2 text-sm text-(--color-main-text)">{groupedSales.monthly.length} entries</p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              Yearly Sales Report
            </p>
            <p className="mt-2 text-sm text-(--color-main-text)">{groupedSales.yearly.length} entries</p>
          </article>
        </div>

        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesOrders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">{order.id}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{order.date}</td>
                  <td className="px-4 py-3 text-(--color-main-text)">{order.customer}</td>
                  <td className="px-4 py-3 text-(--color-main-text)">{order.product}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{order.category}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{order.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">
                    {currencyFormat(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} min-w-0 space-y-3`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Product Sales Analysis</h3>
          <p className="text-sm text-(--color-muted-text)">
            Top selling products, least selling products, category sales, and
            revenue contribution.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Top Selling Products</p>
              <div className="mt-3 space-y-2 text-sm">
                {topProducts.slice(0, 4).map((item) => (
                  <div key={item.product} className="flex items-center justify-between gap-2">
                    <span className="text-(--color-main-text)">{item.product}</span>
                    <span className="font-medium text-(--color-main-text)">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Least Selling Products</p>
              <div className="mt-3 space-y-2 text-sm">
                {leastProducts.map((item) => (
                  <div key={item.product} className="flex items-center justify-between gap-2">
                    <span className="text-(--color-main-text)">{item.product}</span>
                    <span className="font-medium text-(--color-main-text)">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-(--color-border)">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {groupedSales.category.map((row) => (
                  <tr key={row.category} className="border-t border-(--color-border)">
                    <td className="px-4 py-3 text-(--color-main-text)">{row.category}</td>
                    <td className="px-4 py-3 font-medium text-(--color-main-text)">
                      {currencyFormat(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${panelClassName} min-w-0 space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Inventory Reports</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Current Inventory Levels</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">{inventorySummary.totalStockQuantity}</p>
            </div>
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Inventory Valuation</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
                {currencyFormat(inventorySummary.inventoryValue)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-amber-700">Low Stock Report</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">
                {inventorySummary.lowStockItems.length}
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-rose-700">Out Of Stock Report</p>
              <p className="mt-2 text-2xl font-semibold text-rose-700">
                {inventorySummary.outOfStockItems.length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-(--color-border)">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <tr>
                  <th className="px-4 py-3">Stock Movement Report</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {inventorySummary.movementReport.map((movement) => (
                  <tr key={movement.id} className="border-t border-(--color-border)">
                    <td className="px-4 py-3 text-(--color-main-text)">{movement.product}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          movement.type === 'IN'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-(--color-main-text)">{movement.quantity}</td>
                    <td className="px-4 py-3 text-(--color-muted-text)">{movement.reason}</td>
                    <td className="px-4 py-3 text-(--color-muted-text)">{movement.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} min-w-0 space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Repair Reports</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Total Repair Jobs</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">{repairSummary.totalRepairJobs}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">Completed Repairs</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">{repairSummary.completedRepairs}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-amber-700">Pending Repairs</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">{repairSummary.pendingRepairs}</p>
            </div>
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Repair Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
                {currencyFormat(repairSummary.repairRevenue)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Most Common Repair Issues</p>
            <div className="mt-3 space-y-2 text-sm">
              {repairSummary.mostCommonIssues.map((item) => (
                <div key={item.issue} className="flex items-center justify-between">
                  <span className="text-(--color-main-text)">{item.issue}</span>
                  <span className="font-medium text-(--color-main-text)">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className={`${panelClassName} min-w-0 space-y-4`}>
          <h3 className="text-lg font-semibold text-(--color-main-text)">Customer Reports</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">New Customers</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">{customerSummary.newCustomers}</p>
            </div>
            <div className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Repeat Customers</p>
              <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">{customerSummary.repeatCustomers}</p>
            </div>
            <div className="rounded-xl border border-(--color-border) p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Top Customers By Spending</p>
              <div className="mt-3 space-y-2 text-sm">
                {customerSummary.topCustomers.map((customer) => (
                  <div key={customer.name} className="flex items-center justify-between">
                    <span className="text-(--color-main-text)">{customer.name}</span>
                    <span className="font-medium text-(--color-main-text)">
                      {currencyFormat(customer.totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className={`${panelClassName} min-w-0 space-y-4`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">Financial Reports</h3>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Revenue Report</p>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              {currencyFormat(financialSummary.revenue)}
            </p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Profit Report</p>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              {currencyFormat(financialSummary.grossProfit)}
            </p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Expense Report</p>
            <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
              {currencyFormat(financialSummary.expenseTotal)}
            </p>
          </article>
          <article className="rounded-xl border border-(--color-border) p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Net Income Report</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                financialSummary.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {currencyFormat(financialSummary.netIncome)}
            </p>
          </article>
        </div>

        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3 text-(--color-main-text)">{expense.category}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{expense.date}</td>
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">
                    {currencyFormat(expense.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${panelClassName} min-w-0 space-y-4`}>
        <h3 className="text-lg font-semibold text-(--color-main-text)">Report Download History</h3>

        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Download ID</th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Downloaded At</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody>
              {downloadHistory.map((entry) => (
                <tr key={entry.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3 font-medium text-(--color-main-text)">{entry.id}</td>
                  <td className="px-4 py-3 text-(--color-main-text)">{entry.report}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {entry.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{entry.downloadedAt}</td>
                  <td className="px-4 py-3 text-(--color-main-text)">{entry.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
