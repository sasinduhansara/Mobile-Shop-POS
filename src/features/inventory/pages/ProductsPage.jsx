import { useMemo, useRef, useState } from 'react'
import { useDebounce } from '../../../hooks/useDebounce.js'
import { currencyFormat } from '../../../utils/currencyFormat.js'

const CATEGORY_OPTIONS = [
  'Mobile Phones',
  'Back Covers',
  'Chargers',
  'Cables',
  'Tempered Glass',
  'Headphones',
  'Speakers',
  'Subwoofers',
]

const BRAND_OPTIONS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Anker',
  'Baseus',
  'Sony',
  'JBL',
  'Ugreen',
]

const INITIAL_PRODUCTS = [
  {
    id: 'PRD-1001',
    name: 'iPhone 14 Pro Max',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=iPhone+14',
    category: 'Mobile Phones',
    brand: 'Apple',
    model: 'A2894',
    sku: 'APL-IP14PM-256-BLK',
    purchasePrice: 320000,
    sellingPrice: 385000,
    stockQty: 8,
    minStockAlert: 4,
    warrantyPeriod: 12,
    description: '256GB model, black color.',
    purchaseHistory: [
      { date: '2026-02-05', qty: 10, unitCost: 320000 },
      { date: '2026-02-22', qty: 6, unitCost: 319000 },
    ],
    salesHistory: [
      { date: '2026-03-08', qty: 2, unitPrice: 385000 },
      { date: '2026-03-09', qty: 1, unitPrice: 385000 },
    ],
    stockHistory: [
      { date: '2026-03-01', change: '+10', note: 'Opening stock' },
      { date: '2026-03-09', change: '-3', note: 'POS sales' },
    ],
  },
  {
    id: 'PRD-1002',
    name: 'Samsung Galaxy A55',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Galaxy+A55',
    category: 'Mobile Phones',
    brand: 'Samsung',
    model: 'SM-A556E',
    sku: 'SMS-A55-128-BLU',
    purchasePrice: 108000,
    sellingPrice: 124000,
    stockQty: 14,
    minStockAlert: 5,
    warrantyPeriod: 12,
    description: '128GB model, blue.',
    purchaseHistory: [{ date: '2026-02-11', qty: 20, unitCost: 108000 }],
    salesHistory: [{ date: '2026-03-08', qty: 3, unitPrice: 124000 }],
    stockHistory: [{ date: '2026-03-01', change: '+20', note: 'New shipment' }],
  },
  {
    id: 'PRD-1003',
    name: 'Anker 30W Fast Charger',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Anker+30W',
    category: 'Chargers',
    brand: 'Anker',
    model: 'A2633',
    sku: 'ANK-CHR-30W-WHT',
    purchasePrice: 6200,
    sellingPrice: 9500,
    stockQty: 47,
    minStockAlert: 15,
    warrantyPeriod: 6,
    description: 'Type-C fast charger adapter.',
    purchaseHistory: [{ date: '2026-02-18', qty: 60, unitCost: 6200 }],
    salesHistory: [{ date: '2026-03-07', qty: 6, unitPrice: 9500 }],
    stockHistory: [{ date: '2026-03-01', change: '+60', note: 'Restock' }],
  },
  {
    id: 'PRD-1004',
    name: 'Baseus Type-C Cable',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Type-C+Cable',
    category: 'Cables',
    brand: 'Baseus',
    model: 'CATKLF-B09',
    sku: 'BAS-CBL-TYPEC-1M',
    purchasePrice: 900,
    sellingPrice: 1800,
    stockQty: 9,
    minStockAlert: 12,
    warrantyPeriod: 3,
    description: '1 meter braided Type-C cable.',
    purchaseHistory: [{ date: '2026-02-25', qty: 20, unitCost: 900 }],
    salesHistory: [{ date: '2026-03-09', qty: 11, unitPrice: 1800 }],
    stockHistory: [{ date: '2026-03-01', change: '+20', note: 'Opening stock' }],
  },
  {
    id: 'PRD-1005',
    name: 'Tempered Glass (iPhone 14)',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Tempered+Glass',
    category: 'Tempered Glass',
    brand: 'Ugreen',
    model: 'TG-IP14',
    sku: 'UGR-TG-IP14',
    purchasePrice: 450,
    sellingPrice: 1200,
    stockQty: 0,
    minStockAlert: 10,
    warrantyPeriod: 0,
    description: '2.5D high transparency tempered glass.',
    purchaseHistory: [{ date: '2026-02-13', qty: 40, unitCost: 450 }],
    salesHistory: [{ date: '2026-03-08', qty: 40, unitPrice: 1200 }],
    stockHistory: [{ date: '2026-03-08', change: '-40', note: 'Bulk sales' }],
  },
  {
    id: 'PRD-1006',
    name: 'Sony WH-CH520',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Sony+CH520',
    category: 'Headphones',
    brand: 'Sony',
    model: 'WH-CH520',
    sku: 'SNY-HP-CH520',
    purchasePrice: 14900,
    sellingPrice: 21900,
    stockQty: 16,
    minStockAlert: 6,
    warrantyPeriod: 12,
    description: 'Wireless on-ear headphones.',
    purchaseHistory: [{ date: '2026-01-29', qty: 20, unitCost: 14900 }],
    salesHistory: [{ date: '2026-03-09', qty: 4, unitPrice: 21900 }],
    stockHistory: [{ date: '2026-03-01', change: '+20', note: 'New order' }],
  },
  {
    id: 'PRD-1007',
    name: 'JBL Flip 6',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=JBL+Flip+6',
    category: 'Speakers',
    brand: 'JBL',
    model: 'Flip 6',
    sku: 'JBL-SPK-FLIP6',
    purchasePrice: 28900,
    sellingPrice: 38900,
    stockQty: 6,
    minStockAlert: 5,
    warrantyPeriod: 12,
    description: 'Portable bluetooth speaker.',
    purchaseHistory: [{ date: '2026-02-02', qty: 8, unitCost: 28900 }],
    salesHistory: [{ date: '2026-03-07', qty: 2, unitPrice: 38900 }],
    stockHistory: [{ date: '2026-03-01', change: '+8', note: 'Opening stock' }],
  },
  {
    id: 'PRD-1008',
    name: 'Pioneer TS-WX130EA',
    image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Subwoofer',
    category: 'Subwoofers',
    brand: 'Pioneer',
    model: 'TS-WX130EA',
    sku: 'PNR-SUB-130EA',
    purchasePrice: 35000,
    sellingPrice: 45500,
    stockQty: 4,
    minStockAlert: 3,
    warrantyPeriod: 12,
    description: 'Compact active subwoofer.',
    purchaseHistory: [{ date: '2026-01-17', qty: 5, unitCost: 35000 }],
    salesHistory: [{ date: '2026-03-05', qty: 1, unitPrice: 45500 }],
    stockHistory: [{ date: '2026-03-01', change: '+5', note: 'Initial stock' }],
  },
]

const STOCK_FILTERS = [
  { label: 'All Stock', value: 'all' },
  { label: 'In Stock', value: 'in' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Out of Stock', value: 'out' },
]

const DEFAULT_FORM = {
  name: '',
  image: '',
  category: CATEGORY_OPTIONS[0],
  brand: BRAND_OPTIONS[0],
  model: '',
  sku: '',
  purchasePrice: '',
  sellingPrice: '',
  profitMargin: '0.0',
  stockQty: '0',
  minStockAlert: '5',
  warrantyPeriod: '12',
  description: '',
}

const getProfitMargin = (purchase, selling) => {
  const purchaseValue = Number(purchase)
  const sellingValue = Number(selling)

  if (!purchaseValue || purchaseValue <= 0) {
    return 0
  }

  return ((sellingValue - purchaseValue) / purchaseValue) * 100
}

const getStatus = (product) => (product.stockQty === 0 ? 'Out of Stock' : 'Active')

const isLowStock = (product) =>
  product.stockQty > 0 && product.stockQty <= product.minStockAlert

const getStatusBadgeClass = (product) => {
  if (product.stockQty === 0) return 'bg-rose-100 text-rose-700'
  if (isLowStock(product)) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function ProductsPage() {
  const fileInputRef = useRef(null)

  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [viewMode, setViewMode] = useState('table')
  const [searchName, setSearchName] = useState('')
  const [searchBarcode, setSearchBarcode] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [bulkPriceChange, setBulkPriceChange] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [formValues, setFormValues] = useState(DEFAULT_FORM)

  const [detailsProductId, setDetailsProductId] = useState(null)

  const [stockAdjustProductId, setStockAdjustProductId] = useState(null)
  const [stockAdjustmentValue, setStockAdjustmentValue] = useState('0')

  const debouncedNameSearch = useDebounce(searchName, 250)
  const debouncedBarcodeSearch = useDebounce(searchBarcode, 250)

  const brands = useMemo(() => {
    const set = new Set(BRAND_OPTIONS)
    products.forEach((product) => set.add(product.brand))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    const nameTerm = debouncedNameSearch.trim().toLowerCase()
    const barcodeTerm = debouncedBarcodeSearch.trim().toLowerCase()

    return products.filter((product) => {
      const matchesName =
        nameTerm.length === 0 || product.name.toLowerCase().includes(nameTerm)
      const matchesBarcode =
        barcodeTerm.length === 0 || product.sku.toLowerCase().includes(barcodeTerm)
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter
      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && product.stockQty > product.minStockAlert) ||
        (stockFilter === 'low' && isLowStock(product)) ||
        (stockFilter === 'out' && product.stockQty === 0)

      return (
        matchesName &&
        matchesBarcode &&
        matchesCategory &&
        matchesBrand &&
        matchesStock
      )
    })
  }, [
    products,
    debouncedNameSearch,
    debouncedBarcodeSearch,
    categoryFilter,
    brandFilter,
    stockFilter,
  ])

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIds.includes(product.id)),
    [products, selectedProductIds],
  )

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  const detailsProduct = useMemo(
    () => products.find((product) => product.id === detailsProductId) || null,
    [products, detailsProductId],
  )

  const stockAdjustProduct = useMemo(
    () => products.find((product) => product.id === stockAdjustProductId) || null,
    [products, stockAdjustProductId],
  )

  const resetToFirstPage = () => setCurrentPage(1)

  const onToggleProductSelect = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }

  const onToggleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedProducts.map((product) => product.id)
    const allSelected = currentPageIds.every((id) => selectedProductIds.includes(id))

    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
      return
    }

    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
  }

  const onOpenAddForm = () => {
    setEditingProductId(null)
    setFormValues(DEFAULT_FORM)
    setFormOpen(true)
  }

  const onOpenEditForm = (product) => {
    setEditingProductId(product.id)
    setFormValues({
      name: product.name,
      image: product.image,
      category: product.category,
      brand: product.brand,
      model: product.model,
      sku: product.sku,
      purchasePrice: String(product.purchasePrice),
      sellingPrice: String(product.sellingPrice),
      profitMargin: getProfitMargin(product.purchasePrice, product.sellingPrice).toFixed(1),
      stockQty: String(product.stockQty),
      minStockAlert: String(product.minStockAlert),
      warrantyPeriod: String(product.warrantyPeriod),
      description: product.description,
    })
    setFormOpen(true)
  }

  const onCloseForm = () => {
    setFormOpen(false)
    setEditingProductId(null)
    setFormValues(DEFAULT_FORM)
  }

  const onFormValueChange = (event) => {
    const { name, value } = event.target

    setFormValues((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'purchasePrice' || name === 'sellingPrice') {
        next.profitMargin = getProfitMargin(next.purchasePrice, next.sellingPrice).toFixed(1)
      }

      return next
    })
  }

  const onSubmitProductForm = (event) => {
    event.preventDefault()

    const purchasePrice = Number(formValues.purchasePrice)
    const sellingPrice = Number(formValues.sellingPrice)
    const stockQty = Number(formValues.stockQty)
    const minStockAlert = Number(formValues.minStockAlert)
    const warrantyPeriod = Number(formValues.warrantyPeriod)

    const payload = {
      id: editingProductId || `PRD-${Date.now()}`,
      name: formValues.name.trim(),
      image:
        formValues.image.trim() ||
        'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Product',
      category: formValues.category,
      brand: formValues.brand,
      model: formValues.model,
      sku: formValues.sku.trim(),
      purchasePrice,
      sellingPrice,
      stockQty,
      minStockAlert,
      warrantyPeriod,
      description: formValues.description,
      purchaseHistory: editingProductId
        ? products.find((item) => item.id === editingProductId)?.purchaseHistory || []
        : [{ date: new Date().toISOString().slice(0, 10), qty: stockQty, unitCost: purchasePrice }],
      salesHistory: editingProductId
        ? products.find((item) => item.id === editingProductId)?.salesHistory || []
        : [],
      stockHistory: editingProductId
        ? products.find((item) => item.id === editingProductId)?.stockHistory || []
        : [
            {
              date: new Date().toISOString().slice(0, 10),
              change: `+${stockQty}`,
              note: 'Initial stock entry',
            },
          ],
    }

    if (!payload.name || !payload.sku) {
      setFeedbackMessage('Product name and SKU are required.')
      return
    }

    if (editingProductId) {
      setProducts((prev) => prev.map((item) => (item.id === payload.id ? payload : item)))
      setFeedbackMessage('Product updated successfully.')
    } else {
      setProducts((prev) => [payload, ...prev])
      setFeedbackMessage('New product added successfully.')
    }

    onCloseForm()
  }

  const onDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId))
    if (detailsProductId === productId) {
      setDetailsProductId(null)
    }
    setFeedbackMessage('Product deleted.')
  }

  const onOpenStockAdjust = (productId) => {
    setStockAdjustProductId(productId)
    setStockAdjustmentValue('0')
  }

  const onApplyStockAdjustment = () => {
    if (!stockAdjustProduct) return

    const adjustment = Number(stockAdjustmentValue)
    if (!Number.isFinite(adjustment) || adjustment === 0) {
      setFeedbackMessage('Enter a valid stock adjustment value.')
      return
    }

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== stockAdjustProduct.id) return product

        const nextStock = Math.max(0, product.stockQty + adjustment)

        return {
          ...product,
          stockQty: nextStock,
          stockHistory: [
            {
              date: new Date().toISOString().slice(0, 10),
              change: `${adjustment > 0 ? '+' : ''}${adjustment}`,
              note: 'Manual stock adjustment',
            },
            ...product.stockHistory,
          ],
        }
      }),
    )

    setStockAdjustProductId(null)
    setStockAdjustmentValue('0')
    setFeedbackMessage('Stock adjusted successfully.')
  }

  const onPrintBarcode = (product) => {
    setFeedbackMessage(`Barcode label ready: ${product.sku}`)
  }

  const onBulkDelete = () => {
    if (selectedProductIds.length === 0) {
      setFeedbackMessage('Select products before bulk delete.')
      return
    }

    setProducts((prev) => prev.filter((product) => !selectedProductIds.includes(product.id)))
    setSelectedProductIds([])
    setFeedbackMessage('Selected products deleted.')
  }

  const onBulkUpdatePrices = () => {
    const percentage = Number(bulkPriceChange)

    if (!Number.isFinite(percentage) || percentage === 0) {
      setFeedbackMessage('Enter a valid percentage for bulk price update.')
      return
    }

    if (selectedProductIds.length === 0) {
      setFeedbackMessage('Select products before bulk price update.')
      return
    }

    setProducts((prev) =>
      prev.map((product) => {
        if (!selectedProductIds.includes(product.id)) return product

        const nextSellingPrice = Math.max(
          0,
          Math.round(product.sellingPrice * (1 + percentage / 100)),
        )

        return {
          ...product,
          sellingPrice: nextSellingPrice,
        }
      }),
    )

    setBulkPriceChange('')
    setFeedbackMessage('Bulk price update completed.')
  }

  const onExportProducts = () => {
    const targetRows = selectedProducts.length > 0 ? selectedProducts : filteredProducts

    if (targetRows.length === 0) {
      setFeedbackMessage('No products available to export.')
      return
    }

    const headers = [
      'name',
      'category',
      'brand',
      'model',
      'sku',
      'purchasePrice',
      'sellingPrice',
      'stockQty',
      'minStockAlert',
      'warrantyPeriod',
      'description',
    ]

    const rows = targetRows.map((product) =>
      [
        product.name,
        product.category,
        product.brand,
        product.model,
        product.sku,
        product.purchasePrice,
        product.sellingPrice,
        product.stockQty,
        product.minStockAlert,
        product.warrantyPeriod,
        product.description,
      ].join(','),
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'products-export.csv'
    link.click()

    URL.revokeObjectURL(url)
    setFeedbackMessage('Product list exported to CSV.')
  }

  const onImportProducts = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      const text = String(reader.result || '').trim()
      if (!text) {
        setFeedbackMessage('CSV file is empty.')
        return
      }

      const lines = text.split(/\r?\n/).filter(Boolean)
      if (lines.length < 2) {
        setFeedbackMessage('CSV has no data rows.')
        return
      }

      const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
      const getValue = (values, key) => {
        const index = headers.indexOf(key)
        return index >= 0 ? values[index] || '' : ''
      }

      const imported = lines.slice(1).map((line, index) => {
        const values = line.split(',').map((value) => value.trim())
        const purchasePrice = Number(getValue(values, 'purchaseprice') || 0)
        const sellingPrice = Number(getValue(values, 'sellingprice') || 0)
        const stockQty = Number(getValue(values, 'stockqty') || 0)

        return {
          id: `PRD-IMP-${Date.now()}-${index}`,
          name: getValue(values, 'name') || `Imported Product ${index + 1}`,
          image: 'https://dummyimage.com/160x160/e2e8f0/0f172a&text=Imported',
          category: getValue(values, 'category') || CATEGORY_OPTIONS[0],
          brand: getValue(values, 'brand') || BRAND_OPTIONS[0],
          model: getValue(values, 'model') || '-',
          sku: getValue(values, 'sku') || `IMP-${index + 1}`,
          purchasePrice,
          sellingPrice,
          stockQty,
          minStockAlert: Number(getValue(values, 'minstockalert') || 5),
          warrantyPeriod: Number(getValue(values, 'warrantyperiod') || 0),
          description: getValue(values, 'description') || 'Imported product',
          purchaseHistory: [
            {
              date: new Date().toISOString().slice(0, 10),
              qty: stockQty,
              unitCost: purchasePrice,
            },
          ],
          salesHistory: [],
          stockHistory: [
            {
              date: new Date().toISOString().slice(0, 10),
              change: `+${stockQty}`,
              note: 'Imported from CSV',
            },
          ],
        }
      })

      setProducts((prev) => [...imported, ...prev])
      setFeedbackMessage(`${imported.length} products imported from CSV.`)
      event.target.value = ''
    }

    reader.readAsText(file)
  }

  const allCurrentPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((product) => selectedProductIds.includes(product.id))

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Product Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Manage mobiles, accessories, and electronic products with stock, pricing,
              and warranty controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`h-9 rounded-lg px-3 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-(--color-accent) text-(--color-on-accent)'
                  : 'border border-(--color-border) bg-(--color-surface) text-(--color-main-text)'
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`h-9 rounded-lg px-3 text-sm font-medium ${
                viewMode === 'card'
                  ? 'bg-(--color-accent) text-(--color-on-accent)'
                  : 'border border-(--color-border) bg-(--color-surface) text-(--color-main-text)'
              }`}
            >
              Card View
            </button>
            <button
              type="button"
              onClick={onOpenAddForm}
              className="h-9 rounded-lg bg-(--color-main-text) px-3 text-sm font-medium text-white"
            >
              Add Product
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
              onClick={() => setFeedbackMessage('')}
              className="text-xs font-medium text-(--color-muted-text) hover:underline"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">Search & Filters</h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
            Search by Product Name
            <input
              value={searchName}
              onChange={(event) => {
                setSearchName(event.target.value)
                resetToFirstPage()
              }}
              placeholder="e.g. iPhone"
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
            Search by Barcode
            <input
              value={searchBarcode}
              onChange={(event) => {
                setSearchBarcode(event.target.value)
                resetToFirstPage()
              }}
              placeholder="SKU / Barcode"
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
            Category
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                resetToFirstPage()
              }}
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
            Brand
            <select
              value={brandFilter}
              onChange={(event) => {
                setBrandFilter(event.target.value)
                resetToFirstPage()
              }}
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
            Stock Level
            <select
              value={stockFilter}
              onChange={(event) => {
                setStockFilter(event.target.value)
                resetToFirstPage()
              }}
              className="h-10 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
            >
              {STOCK_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <h3 className="text-base font-semibold text-(--color-main-text)">Bulk Actions</h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onImportProducts}
            className="hidden"
          />

          <button
            type="button"
            onClick={onExportProducts}
            className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
          >
            Export Product List
          </button>

          <button
            type="button"
            onClick={onBulkDelete}
            className="h-9 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700"
          >
            Bulk Delete
          </button>

          <div className="flex items-center gap-2">
            <input
              value={bulkPriceChange}
              onChange={(event) => setBulkPriceChange(event.target.value)}
              placeholder="% e.g. 5 or -3"
              className="h-9 w-32 rounded-lg border border-(--color-border) px-3 text-sm"
            />
            <button
              type="button"
              onClick={onBulkUpdatePrices}
              className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
            >
              Bulk Update Prices
            </button>
          </div>

          <span className="text-xs text-(--color-muted-text)">
            Selected: {selectedProductIds.length}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                  <th className="pb-3 pr-2">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={onToggleSelectAllCurrentPage}
                    />
                  </th>
                  <th className="pb-3">Product Image</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Brand</th>
                  <th className="pb-3">SKU / Barcode</th>
                  <th className="pb-3">Purchase Price</th>
                  <th className="pb-3">Selling Price</th>
                  <th className="pb-3">Stock Quantity</th>
                  <th className="pb-3">Warranty Period</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-t border-(--color-border)">
                    <td className="py-3 pr-2 align-top">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => onToggleProductSelect(product.id)}
                      />
                    </td>
                    <td className="py-3 align-top">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg border border-(--color-border) object-cover"
                      />
                    </td>
                    <td className="py-3 align-top">
                      <button
                        type="button"
                        onClick={() => setDetailsProductId(product.id)}
                        className="text-left font-medium text-(--color-main-text) hover:underline"
                      >
                        {product.name}
                      </button>
                      <p className="mt-1 text-xs text-(--color-muted-text)">{product.model}</p>
                    </td>
                    <td className="py-3 align-top">{product.category}</td>
                    <td className="py-3 align-top">{product.brand}</td>
                    <td className="py-3 align-top font-mono text-xs">{product.sku}</td>
                    <td className="py-3 align-top">{currencyFormat(product.purchasePrice)}</td>
                    <td className="py-3 align-top">{currencyFormat(product.sellingPrice)}</td>
                    <td className="py-3 align-top">
                      <span className="font-medium">{product.stockQty}</span>
                      {isLowStock(product) && (
                        <p className="mt-1 text-xs text-amber-700">Low stock alert</p>
                      )}
                    </td>
                    <td className="py-3 align-top">
                      {product.warrantyPeriod > 0
                        ? `${product.warrantyPeriod} months`
                        : 'No warranty'}
                    </td>
                    <td className="py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                            product,
                          )}`}
                        >
                          {getStatus(product)}
                        </span>
                        {isLowStock(product) && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Low Stock
                          </span>
                        )}
                        {product.warrantyPeriod > 0 && (
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                            Warranty Available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditForm(product)}
                          className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(product.id)}
                          className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailsProductId(product.id)}
                          className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenStockAdjust(product.id)}
                          className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                        >
                          Adjust Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintBarcode(product)}
                          className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                        >
                          Print Barcode
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-lg border border-(--color-border) object-cover"
                  />

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleProductSelect(product.id)}
                      className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                    >
                      {selectedProductIds.includes(product.id) ? 'Unselect' : 'Select'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsProductId(product.id)}
                  className="mt-3 text-left text-sm font-semibold text-(--color-main-text) hover:underline"
                >
                  {product.name}
                </button>

                <p className="mt-1 text-xs text-(--color-muted-text)">
                  {product.category} • {product.brand}
                </p>
                <p className="mt-1 text-xs font-mono text-(--color-muted-text)">{product.sku}</p>

                <div className="mt-3 grid gap-1 text-xs text-(--color-main-text)">
                  <p>Purchase: {currencyFormat(product.purchasePrice)}</p>
                  <p>Selling: {currencyFormat(product.sellingPrice)}</p>
                  <p>Stock: {product.stockQty}</p>
                  <p>
                    Warranty:{' '}
                    {product.warrantyPeriod > 0
                      ? `${product.warrantyPeriod} months`
                      : 'No warranty'}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                      product,
                    )}`}
                  >
                    {getStatus(product)}
                  </span>
                  {isLowStock(product) && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Low Stock
                    </span>
                  )}
                  {product.warrantyPeriod > 0 && (
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                      Warranty Available
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenEditForm(product)}
                    className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product.id)}
                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenStockAdjust(product.id)}
                    className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                  >
                    Adjust
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <p className="py-6 text-sm text-(--color-muted-text)">No products found.</p>
        )}
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-(--color-muted-text)">
            Showing {startIndex + 1} - {Math.min(startIndex + pageSize, filteredProducts.length)}
            {' '}of {filteredProducts.length} products
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-(--color-muted-text)">
              Rows:
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setCurrentPage(1)
                }}
                className="ml-2 h-8 rounded-lg border border-(--color-border) px-2 text-sm"
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
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

      {isFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingProductId ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitProductForm}>
              <label className="grid gap-1 text-sm font-medium">
                Product Name
                <input
                  required
                  name="name"
                  value={formValues.name}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Product Image
                <input
                  name="image"
                  value={formValues.image}
                  onChange={onFormValueChange}
                  placeholder="Image URL"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category
                <select
                  name="category"
                  value={formValues.category}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Brand
                <input
                  list="brand-options"
                  name="brand"
                  value={formValues.brand}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
                <datalist id="brand-options">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Model
                <input
                  name="model"
                  value={formValues.model}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                SKU / Barcode
                <input
                  required
                  name="sku"
                  value={formValues.sku}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Purchase Price
                <input
                  type="number"
                  min="0"
                  name="purchasePrice"
                  value={formValues.purchasePrice}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Selling Price
                <input
                  type="number"
                  min="0"
                  name="sellingPrice"
                  value={formValues.sellingPrice}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Profit Margin
                <input
                  readOnly
                  name="profitMargin"
                  value={`${formValues.profitMargin}%`}
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-(--color-muted-text)"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Stock Quantity
                <input
                  type="number"
                  min="0"
                  name="stockQty"
                  value={formValues.stockQty}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Minimum Stock Alert
                <input
                  type="number"
                  min="0"
                  name="minStockAlert"
                  value={formValues.minStockAlert}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Warranty Period (Months)
                <input
                  type="number"
                  min="0"
                  name="warrantyPeriod"
                  value={formValues.warrantyPeriod}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="sm:col-span-2 grid gap-1 text-sm font-medium">
                Description
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={onFormValueChange}
                  rows={4}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
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
                  {editingProductId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockAdjustProduct && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-(--color-main-text)">Adjust Stock</h3>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              {stockAdjustProduct.name} ({stockAdjustProduct.sku})
            </p>
            <p className="mt-1 text-sm text-(--color-muted-text)">
              Current Stock: {stockAdjustProduct.stockQty}
            </p>

            <label className="mt-4 grid gap-1 text-sm font-medium">
              Stock Adjustment (+/-)
              <input
                value={stockAdjustmentValue}
                onChange={(event) => setStockAdjustmentValue(event.target.value)}
                className="h-10 rounded-lg border border-(--color-border) px-3"
              />
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStockAdjustProductId(null)}
                className="h-10 rounded-lg border border-(--color-border) px-4 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onApplyStockAdjustment}
                className="h-10 rounded-lg bg-(--color-accent) px-4 text-sm font-medium text-(--color-on-accent)"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsProduct && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">Product Details</h3>
              <button
                type="button"
                onClick={() => setDetailsProductId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
              <img
                src={detailsProduct.image}
                alt={detailsProduct.name}
                className="h-28 w-28 rounded-xl border border-(--color-border) object-cover"
              />

              <div>
                <h4 className="text-lg font-semibold text-(--color-main-text)">{detailsProduct.name}</h4>
                <p className="mt-1 text-sm text-(--color-muted-text)">
                  {detailsProduct.brand} • {detailsProduct.model}
                </p>
                <p className="mt-1 font-mono text-xs text-(--color-muted-text)">
                  {detailsProduct.sku}
                </p>
                <p className="mt-2 text-sm text-(--color-main-text)">
                  Selling: {currencyFormat(detailsProduct.sellingPrice)}
                </p>
              </div>
            </div>

            <section className="mt-5 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Product Specs</h5>
              <div className="mt-2 grid gap-1 text-sm text-(--color-main-text)">
                <p>Category: {detailsProduct.category}</p>
                <p>Brand: {detailsProduct.brand}</p>
                <p>Model: {detailsProduct.model}</p>
                <p>SKU / Barcode: {detailsProduct.sku}</p>
                <p>Description: {detailsProduct.description || 'N/A'}</p>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Purchase History</h5>
              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {detailsProduct.purchaseHistory.map((item, index) => (
                  <li key={`purchase-${index}`}>
                    {item.date} • Qty {item.qty} • {currencyFormat(item.unitCost)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Sales History</h5>
              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {detailsProduct.salesHistory.length === 0 && (
                  <li className="text-(--color-muted-text)">No sales history yet.</li>
                )}
                {detailsProduct.salesHistory.map((item, index) => (
                  <li key={`sales-${index}`}>
                    {item.date} • Qty {item.qty} • {currencyFormat(item.unitPrice)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Warranty Details</h5>
              <p className="mt-2 text-sm text-(--color-main-text)">
                {detailsProduct.warrantyPeriod > 0
                  ? `${detailsProduct.warrantyPeriod} months warranty available`
                  : 'No warranty available'}
              </p>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Stock History</h5>
              <ul className="mt-2 space-y-1 text-sm text-(--color-main-text)">
                {detailsProduct.stockHistory.map((item, index) => (
                  <li key={`stock-${index}`}>
                    {item.date} • {item.change} • {item.note}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Quick Actions</h5>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEditForm(detailsProduct)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  Edit Product
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(detailsProduct.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700"
                >
                  Delete Product
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStockAdjust(detailsProduct.id)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  Adjust Stock
                </button>
                <button
                  type="button"
                  onClick={() => onPrintBarcode(detailsProduct)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  Print Barcode Label
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
