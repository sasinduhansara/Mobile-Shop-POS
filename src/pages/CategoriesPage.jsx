import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce.js'

const INITIAL_CATEGORIES = [
  {
    id: 'CAT-100',
    name: 'Mobile Phones',
    code: 'MOB',
    parentId: null,
    icon: '📱',
    image: '',
    description: 'Smartphones and mobile devices.',
    displayOrder: 1,
    status: 'Active',
    createdDate: '2026-01-05',
  },
  {
    id: 'CAT-101',
    name: 'Samsung',
    code: 'SAM',
    parentId: 'CAT-100',
    icon: '🔷',
    image: '',
    description: 'Samsung mobile devices and variants.',
    displayOrder: 2,
    status: 'Active',
    createdDate: '2026-01-05',
  },
  {
    id: 'CAT-102',
    name: 'Apple',
    code: 'APL',
    parentId: 'CAT-100',
    icon: '🍎',
    image: '',
    description: 'Apple iPhone models and related devices.',
    displayOrder: 3,
    status: 'Active',
    createdDate: '2026-01-05',
  },
  {
    id: 'CAT-200',
    name: 'Accessories',
    code: 'ACC',
    parentId: null,
    icon: '🎧',
    image: '',
    description: 'Mobile accessories and add-ons.',
    displayOrder: 4,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-201',
    name: 'Back Covers',
    code: 'COV',
    parentId: 'CAT-200',
    icon: '🧩',
    image: '',
    description: 'Phone cases and protective covers.',
    displayOrder: 5,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-202',
    name: 'Chargers',
    code: 'CHR',
    parentId: 'CAT-200',
    icon: '🔌',
    image: '',
    description: 'Fast chargers and charging adapters.',
    displayOrder: 6,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-203',
    name: 'Cables',
    code: 'CAB',
    parentId: 'CAT-200',
    icon: '🧵',
    image: '',
    description: 'USB, Type-C, Lightning, and data cables.',
    displayOrder: 7,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-204',
    name: 'Tempered Glass',
    code: 'TGL',
    parentId: 'CAT-200',
    icon: '🛡️',
    image: '',
    description: 'Screen protectors and tempered glass.',
    displayOrder: 8,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-205',
    name: 'Headphones',
    code: 'HPH',
    parentId: 'CAT-200',
    icon: '🎧',
    image: '',
    description: 'Wired and wireless headphones.',
    displayOrder: 9,
    status: 'Active',
    createdDate: '2026-01-10',
  },
  {
    id: 'CAT-206',
    name: 'Speakers',
    code: 'SPK',
    parentId: 'CAT-200',
    icon: '🔊',
    image: '',
    description: 'Portable and home speakers.',
    displayOrder: 10,
    status: 'Inactive',
    createdDate: '2026-01-10',
  },
]

const PRODUCT_LIBRARY = [
  { id: 'P-001', name: 'iPhone 14 Pro Max', sku: 'APL-IP14PM', categoryCode: 'APL' },
  { id: 'P-002', name: 'iPhone 13', sku: 'APL-IP13', categoryCode: 'APL' },
  { id: 'P-003', name: 'Samsung A55', sku: 'SAM-A55', categoryCode: 'SAM' },
  { id: 'P-004', name: 'Samsung S24', sku: 'SAM-S24', categoryCode: 'SAM' },
  { id: 'P-005', name: 'Silicon Back Cover', sku: 'COV-SLC-01', categoryCode: 'COV' },
  { id: 'P-006', name: 'Leather Back Cover', sku: 'COV-LTH-02', categoryCode: 'COV' },
  { id: 'P-007', name: 'Fast Charger 25W', sku: 'CHR-25W-01', categoryCode: 'CHR' },
  { id: 'P-008', name: 'Fast Charger 45W', sku: 'CHR-45W-02', categoryCode: 'CHR' },
  { id: 'P-009', name: 'Type-C Cable 1m', sku: 'CAB-TC-1M', categoryCode: 'CAB' },
  { id: 'P-010', name: 'Type-C Cable 2m', sku: 'CAB-TC-2M', categoryCode: 'CAB' },
  { id: 'P-011', name: 'Tempered Glass iPhone', sku: 'TGL-IP-01', categoryCode: 'TGL' },
  { id: 'P-012', name: 'Tempered Glass Samsung', sku: 'TGL-SAM-02', categoryCode: 'TGL' },
  { id: 'P-013', name: 'Sony WH-CH520', sku: 'HPH-SONY-01', categoryCode: 'HPH' },
  { id: 'P-014', name: 'JBL Tune 720BT', sku: 'HPH-JBL-02', categoryCode: 'HPH' },
]

const STATUS_OPTIONS = ['Active', 'Inactive']

const SORT_OPTIONS = [
  { label: 'Display Order', value: 'order' },
  { label: 'Category Name (A-Z)', value: 'name-asc' },
  { label: 'Category Name (Z-A)', value: 'name-desc' },
  { label: 'Product Count (High-Low)', value: 'count-desc' },
  { label: 'Product Count (Low-High)', value: 'count-asc' },
]

const escapeCsvCell = (value) => {
  const stringValue = String(value ?? '')
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const normalizeCategoryCode = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getNextDisplayOrder = (list) =>
  list.reduce((max, category) => Math.max(max, category.displayOrder), 0) + 1

const buildChildrenMap = (list) => {
  const childrenMap = new Map()

  list.forEach((category) => {
    const key = category.parentId || '__root__'
    if (!childrenMap.has(key)) {
      childrenMap.set(key, [])
    }
    childrenMap.get(key).push(category.id)
  })

  return childrenMap
}

const collectDescendantIds = (categoryId, childrenMap) => {
  const childIds = childrenMap.get(categoryId) || []
  const all = []

  childIds.forEach((childId) => {
    all.push(childId)
    all.push(...collectDescendantIds(childId, childrenMap))
  })

  return all
}

const createDefaultFormValues = (nextOrder) => ({
  name: '',
  code: '',
  parentId: '',
  icon: '📦',
  image: '',
  description: '',
  displayOrder: String(nextOrder),
  status: 'Active',
})

function CategoriesPage() {
  const navigate = useNavigate()
  const importInputRef = useRef(null)

  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [parentFilter, setParentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('order')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [formValues, setFormValues] = useState(createDefaultFormValues(getNextDisplayOrder(INITIAL_CATEGORIES)))

  const [detailsCategoryId, setDetailsCategoryId] = useState(null)
  const [dragCategoryId, setDragCategoryId] = useState(null)

  const debouncedSearch = useDebounce(searchTerm, 220)

  const categoryById = useMemo(() => {
    const map = new Map()
    categories.forEach((category) => map.set(category.id, category))
    return map
  }, [categories])

  const childrenMap = useMemo(() => buildChildrenMap(categories), [categories])

  const productCountByCode = useMemo(() => {
    const map = new Map()
    PRODUCT_LIBRARY.forEach((product) => {
      const current = map.get(product.categoryCode) || 0
      map.set(product.categoryCode, current + 1)
    })
    return map
  }, [])

  const codesByCategoryId = useMemo(() => {
    const memo = new Map()

    const collectCodes = (categoryId) => {
      if (memo.has(categoryId)) {
        return memo.get(categoryId)
      }

      const category = categoryById.get(categoryId)
      if (!category) {
        return []
      }

      const childIds = childrenMap.get(categoryId) || []
      const codes = [category.code]

      childIds.forEach((childId) => {
        codes.push(...collectCodes(childId))
      })

      memo.set(categoryId, codes)
      return codes
    }

    categories.forEach((category) => collectCodes(category.id))
    return memo
  }, [categories, categoryById, childrenMap])

  const productCountByCategoryId = useMemo(() => {
    const map = new Map()

    categories.forEach((category) => {
      const codes = codesByCategoryId.get(category.id) || []
      const total = codes.reduce(
        (sum, code) => sum + (productCountByCode.get(code) || 0),
        0,
      )
      map.set(category.id, total)
    })

    return map
  }, [categories, codesByCategoryId, productCountByCode])

  const productsByCategoryId = useMemo(() => {
    const map = new Map()

    categories.forEach((category) => {
      const codes = new Set(codesByCategoryId.get(category.id) || [category.code])
      const matchingProducts = PRODUCT_LIBRARY.filter((product) =>
        codes.has(product.categoryCode),
      )
      map.set(category.id, matchingProducts)
    })

    return map
  }, [categories, codesByCategoryId])

  const rootCategories = useMemo(
    () =>
      categories
        .filter((category) => !category.parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [categories],
  )

  const filteredCategories = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()

    return categories.filter((category) => {
      const parent = categoryById.get(category.parentId)

      const matchesSearch =
        term.length === 0 ||
        category.name.toLowerCase().includes(term) ||
        category.code.toLowerCase().includes(term)

      const matchesParent =
        parentFilter === 'all' ||
        (parentFilter === 'root' && !category.parentId) ||
        category.parentId === parentFilter

      const productCount = productCountByCategoryId.get(category.id) || 0

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.status === 'Active') ||
        (statusFilter === 'inactive' && category.status === 'Inactive') ||
        (statusFilter === 'empty' && productCount === 0)

      return matchesSearch && matchesParent && matchesStatus && (!parent || true)
    })
  }, [
    categories,
    categoryById,
    debouncedSearch,
    parentFilter,
    statusFilter,
    productCountByCategoryId,
  ])

  const sortedCategories = useMemo(() => {
    const list = [...filteredCategories]

    list.sort((a, b) => {
      if (sortBy === 'order') {
        return a.displayOrder - b.displayOrder
      }

      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }

      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name)
      }

      const countA = productCountByCategoryId.get(a.id) || 0
      const countB = productCountByCategoryId.get(b.id) || 0

      if (sortBy === 'count-desc') {
        return countB - countA
      }

      if (sortBy === 'count-asc') {
        return countA - countB
      }

      return 0
    })

    return list
  }, [filteredCategories, sortBy, productCountByCategoryId])

  const allVisibleSelected =
    sortedCategories.length > 0 &&
    sortedCategories.every((category) => selectedCategoryIds.includes(category.id))

  const detailsCategory =
    categories.find((category) => category.id === detailsCategoryId) || null

  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedCategoryIds.includes(category.id)),
    [categories, selectedCategoryIds],
  )

  const invalidParentIds = useMemo(() => {
    if (!editingCategoryId) {
      return new Set()
    }

    return new Set([
      editingCategoryId,
      ...collectDescendantIds(editingCategoryId, childrenMap),
    ])
  }, [editingCategoryId, childrenMap])

  const parentOptionsForForm = useMemo(
    () =>
      categories
        .filter((category) => !invalidParentIds.has(category.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, invalidParentIds],
  )

  const reorderByDisplayOrder = (list) =>
    [...list]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((category, index) => ({
        ...category,
        displayOrder: index + 1,
      }))

  const onToggleCategorySelect = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const onToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedCategoryIds((prev) =>
        prev.filter((id) => !sortedCategories.some((category) => category.id === id)),
      )
      return
    }

    setSelectedCategoryIds((prev) =>
      Array.from(new Set([...prev, ...sortedCategories.map((category) => category.id)])),
    )
  }

  const onOpenAddForm = () => {
    setEditingCategoryId(null)
    setFormValues(createDefaultFormValues(getNextDisplayOrder(categories)))
    setFormOpen(true)
  }

  const onOpenEditForm = (category) => {
    setEditingCategoryId(category.id)
    setFormValues({
      name: category.name,
      code: category.code,
      parentId: category.parentId || '',
      icon: category.icon || '📦',
      image: category.image || '',
      description: category.description || '',
      displayOrder: String(category.displayOrder),
      status: category.status,
    })
    setFormOpen(true)
  }

  const onCloseForm = () => {
    setFormOpen(false)
    setEditingCategoryId(null)
    setFormValues(createDefaultFormValues(getNextDisplayOrder(categories)))
  }

  const onFormValueChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmitCategory = (event) => {
    event.preventDefault()

    const normalizedCode = normalizeCategoryCode(formValues.code || formValues.name)

    if (!formValues.name.trim() || !normalizedCode) {
      setFeedbackMessage('Category name and code are required.')
      return
    }

    const duplicateCode = categories.some(
      (category) =>
        category.code === normalizedCode && category.id !== editingCategoryId,
    )

    if (duplicateCode) {
      setFeedbackMessage('Category code already exists.')
      return
    }

    const payload = {
      id: editingCategoryId || `CAT-${Date.now()}`,
      name: formValues.name.trim(),
      code: normalizedCode,
      parentId: formValues.parentId || null,
      icon: formValues.icon.trim() || '📦',
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      displayOrder: Math.max(1, Number(formValues.displayOrder) || 1),
      status: STATUS_OPTIONS.includes(formValues.status) ? formValues.status : 'Active',
      createdDate:
        categories.find((category) => category.id === editingCategoryId)?.createdDate ||
        new Date().toISOString().slice(0, 10),
    }

    if (editingCategoryId) {
      setCategories((prev) =>
        reorderByDisplayOrder(
          prev.map((category) =>
            category.id === editingCategoryId ? payload : category,
          ),
        ),
      )
      setFeedbackMessage('Category updated successfully.')
    } else {
      setCategories((prev) => reorderByDisplayOrder([...prev, payload]))
      setFeedbackMessage('Category created successfully.')
    }

    onCloseForm()
  }

  const onDeleteCategory = (categoryId) => {
    const descendants = collectDescendantIds(categoryId, childrenMap)
    const idsToDelete = new Set([categoryId, ...descendants])

    setCategories((prev) =>
      reorderByDisplayOrder(
        prev.filter((category) => !idsToDelete.has(category.id)),
      ),
    )

    setSelectedCategoryIds((prev) => prev.filter((id) => !idsToDelete.has(id)))

    if (detailsCategoryId && idsToDelete.has(detailsCategoryId)) {
      setDetailsCategoryId(null)
    }

    setFeedbackMessage(
      descendants.length > 0
        ? 'Category and child categories deleted.'
        : 'Category deleted.',
    )
  }

  const onBulkDelete = () => {
    if (selectedCategoryIds.length === 0) {
      setFeedbackMessage('Select categories before bulk delete.')
      return
    }

    const idsToDelete = new Set()
    selectedCategoryIds.forEach((id) => {
      idsToDelete.add(id)
      collectDescendantIds(id, childrenMap).forEach((childId) => idsToDelete.add(childId))
    })

    setCategories((prev) =>
      reorderByDisplayOrder(
        prev.filter((category) => !idsToDelete.has(category.id)),
      ),
    )

    setSelectedCategoryIds([])

    if (detailsCategoryId && idsToDelete.has(detailsCategoryId)) {
      setDetailsCategoryId(null)
    }

    setFeedbackMessage('Selected categories deleted.')
  }

  const onExportCategories = () => {
    const rows = selectedCategories.length > 0 ? selectedCategories : sortedCategories

    if (rows.length === 0) {
      setFeedbackMessage('No categories available to export.')
      return
    }

    const headers = [
      'name',
      'code',
      'parentCode',
      'icon',
      'image',
      'description',
      'displayOrder',
      'status',
      'createdDate',
      'productCount',
    ]

    const csvRows = rows.map((category) => {
      const parent = categoryById.get(category.parentId)
      return [
        category.name,
        category.code,
        parent?.code || '',
        category.icon || '',
        category.image || '',
        category.description || '',
        category.displayOrder,
        category.status,
        category.createdDate,
        productCountByCategoryId.get(category.id) || 0,
      ]
        .map(escapeCsvCell)
        .join(',')
    })

    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'categories-export.csv'
    link.click()

    URL.revokeObjectURL(url)
    setFeedbackMessage('Category list exported.')
  }

  const onImportCategories = (event) => {
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
        setFeedbackMessage('CSV has no rows to import.')
        return
      }

      const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
      const getColumn = (values, name) => {
        const index = headers.indexOf(name)
        return index >= 0 ? String(values[index] || '').trim() : ''
      }

      setCategories((prev) => {
        const codeToId = new Map(prev.map((category) => [category.code, category.id]))

        const imported = lines.slice(1).map((line, index) => {
          const values = line.split(',').map((value) => value.trim())
          const name = getColumn(values, 'name') || `Imported Category ${index + 1}`

          let code = normalizeCategoryCode(getColumn(values, 'code') || name)
          if (!code) {
            code = `CAT-${Date.now()}-${index}`
          }

          while (codeToId.has(code)) {
            code = `${code}-${index + 1}`
          }

          const parentCode = normalizeCategoryCode(getColumn(values, 'parentcode'))
          const status = getColumn(values, 'status') === 'Inactive' ? 'Inactive' : 'Active'

          const importedCategory = {
            id: `CAT-IMP-${Date.now()}-${index}`,
            name,
            code,
            parentId: parentCode ? codeToId.get(parentCode) || null : null,
            icon: getColumn(values, 'icon') || '📦',
            image: getColumn(values, 'image') || '',
            description: getColumn(values, 'description') || '',
            displayOrder:
              Math.max(
                1,
                Number(getColumn(values, 'displayorder')) || getNextDisplayOrder(prev) + index,
              ) ||
              getNextDisplayOrder(prev) + index,
            status,
            createdDate: getColumn(values, 'createddate') || new Date().toISOString().slice(0, 10),
          }

          codeToId.set(importedCategory.code, importedCategory.id)
          return importedCategory
        })

        setFeedbackMessage(`${imported.length} categories imported.`)
        event.target.value = ''

        return reorderByDisplayOrder([...prev, ...imported])
      })
    }

    reader.readAsText(file)
  }

  const onViewProductsInCategory = (categoryId) => {
    setDetailsCategoryId(categoryId)
  }

  const onAddProductToCategory = (category) => {
    navigate('/products', {
      state: { prefillCategoryCode: category.code, prefillCategoryName: category.name },
    })
  }

  const onDragStart = (categoryId) => {
    if (sortBy !== 'order') return
    setDragCategoryId(categoryId)
  }

  const onDropRow = (targetCategoryId) => {
    if (sortBy !== 'order') return

    if (!dragCategoryId || dragCategoryId === targetCategoryId) {
      setDragCategoryId(null)
      return
    }

    setCategories((prev) => {
      const ordered = [...prev].sort((a, b) => a.displayOrder - b.displayOrder)
      const sourceIndex = ordered.findIndex((category) => category.id === dragCategoryId)
      const targetIndex = ordered.findIndex((category) => category.id === targetCategoryId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return prev
      }

      const [moved] = ordered.splice(sourceIndex, 1)
      ordered.splice(targetIndex, 0, moved)

      return ordered.map((category, index) => ({
        ...category,
        displayOrder: index + 1,
      }))
    })

    setDragCategoryId(null)
    setFeedbackMessage('Category order updated.')
  }

  const renderHierarchy = (parentId, level = 0) => {
    const key = parentId || '__root__'
    const childIds = childrenMap.get(key) || []

    if (childIds.length === 0) {
      return null
    }

    const children = childIds
      .map((id) => categoryById.get(id))
      .filter(Boolean)
      .sort((a, b) => a.displayOrder - b.displayOrder)

    return (
      <ul className="space-y-2">
        {children.map((category) => {
          const count = productCountByCategoryId.get(category.id) || 0

          return (
            <li key={category.id}>
              <div
                className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2"
                style={{ marginLeft: `${level * 12}px` }}
              >
                <button
                  type="button"
                  onClick={() => setDetailsCategoryId(category.id)}
                  className="flex items-center gap-2 text-sm font-medium text-(--color-main-text) hover:underline"
                >
                  <span>{category.icon || '📦'}</span>
                  <span>{category.name}</span>
                </button>

                <span className="text-xs text-(--color-muted-text)">
                  {count} products
                </span>
              </div>

              {renderHierarchy(category.id, level + 1)}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-(--color-main-text)">
              Category Management
            </h2>
            <p className="mt-2 text-sm text-(--color-muted-text)">
              Create, organize, and manage category hierarchy for mobiles,
              accessories, and electronic products.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddForm}
            className="h-10 rounded-lg bg-(--color-main-text) px-4 text-sm font-medium text-white"
          >
            Add Category
          </button>
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

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
          <h3 className="text-base font-semibold text-(--color-main-text)">Category Hierarchy</h3>
          <p className="mt-1 text-xs text-(--color-muted-text)">
            Parent-child tree structure for categories.
          </p>

          <div className="mt-3 max-h-[540px] overflow-y-auto pr-1">
            {rootCategories.length === 0 ? (
              <p className="text-sm text-(--color-muted-text)">No categories available.</p>
            ) : (
              renderHierarchy(null)
            )}
          </div>
        </article>

        <div className="space-y-4 min-w-0">
          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">Search & Filter</h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
                Search by Category Name
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="e.g. Chargers"
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
                />
              </label>

              <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
                Parent Category
                <select
                  value={parentFilter}
                  onChange={(event) => setParentFilter(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
                >
                  <option value="all">All</option>
                  <option value="root">Root Categories</option>
                  {rootCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Hidden</option>
                  <option value="empty">Empty Category</option>
                </select>
              </label>

              <label className="grid min-w-0 gap-1 text-sm font-medium text-(--color-main-text)">
                Sort By
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-lg border border-(--color-border) px-3 text-sm outline-none focus:border-(--color-accent)"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">Bulk Actions</h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
              >
                Import Categories
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onImportCategories}
              />

              <button
                type="button"
                onClick={onExportCategories}
                className="h-9 rounded-lg border border-(--color-border) px-3 text-sm font-medium"
              >
                Export Category List
              </button>

              <button
                type="button"
                onClick={onBulkDelete}
                className="h-9 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700"
              >
                Delete Selected
              </button>

              <span className="text-xs text-(--color-muted-text)">
                Selected: {selectedCategoryIds.length}
              </span>
            </div>
          </article>

          {sortBy !== 'order' && (
            <p className="text-xs text-(--color-muted-text)">
              Drag & drop ordering works when sort is set to Display Order.
            </p>
          )}

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                    <th className="pb-3 pr-2">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={onToggleSelectAllVisible}
                      />
                    </th>
                    <th className="pb-3">Category Icon / Image</th>
                    <th className="pb-3">Category Name</th>
                    <th className="pb-3">Category Code</th>
                    <th className="pb-3">Parent Category</th>
                    <th className="pb-3">Number of Products</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedCategories.map((category) => {
                    const productCount = productCountByCategoryId.get(category.id) || 0
                    const parent = categoryById.get(category.parentId)
                    const isActive = category.status === 'Active'

                    return (
                      <tr
                        key={category.id}
                        draggable={sortBy === 'order'}
                        onDragStart={() => onDragStart(category.id)}
                        onDragOver={(event) => {
                          if (sortBy === 'order') {
                            event.preventDefault()
                          }
                        }}
                        onDrop={() => onDropRow(category.id)}
                        className="border-t border-(--color-border)"
                      >
                        <td className="py-3 pr-2 align-top">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={() => onToggleCategorySelect(category.id)}
                          />
                        </td>

                        <td className="py-3 align-top">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⋮⋮</span>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-11 w-11 rounded-lg border border-(--color-border) object-cover"
                              />
                            ) : (
                              <div className="grid h-11 w-11 place-items-center rounded-lg border border-(--color-border) bg-(--color-menu-btn-hover) text-base">
                                {category.icon || '📦'}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 align-top">
                          <button
                            type="button"
                            onClick={() => setDetailsCategoryId(category.id)}
                            className="font-medium text-(--color-main-text) hover:underline"
                          >
                            {category.name}
                          </button>
                          <p className="mt-1 text-xs text-(--color-muted-text)">
                            {category.description || 'No description'}
                          </p>
                        </td>

                        <td className="py-3 align-top font-mono text-xs">{category.code}</td>
                        <td className="py-3 align-top">{parent?.name || 'Root'}</td>
                        <td className="py-3 align-top">
                          <span className="font-medium">{productCount}</span>{' '}
                          <span className="text-(--color-muted-text)">products</span>
                        </td>
                        <td className="py-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isActive ? 'Active' : 'Hidden'}
                            </span>

                            {productCount === 0 && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Empty Category
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 align-top">{category.createdDate}</td>
                        <td className="py-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEditForm(category)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCategory(category.id)}
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailsCategoryId(category.id)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewProductsInCategory(category.id)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              View Products
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddProductToCategory(category)}
                              className="rounded-lg border border-(--color-border) px-2 py-1 text-xs"
                            >
                              Add Product
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {sortedCategories.length === 0 && (
              <p className="py-5 text-sm text-(--color-muted-text)">No categories found.</p>
            )}
          </article>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 p-4">
          <div className="mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={onCloseForm}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmitCategory}>
              <label className="grid gap-1 text-sm font-medium">
                Category Name
                <input
                  required
                  name="name"
                  value={formValues.name}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category Code
                <input
                  required
                  name="code"
                  value={formValues.code}
                  onChange={onFormValueChange}
                  placeholder="e.g. CHR"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Parent Category (optional)
                <select
                  name="parentId"
                  value={formValues.parentId}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                >
                  <option value="">None (Root)</option>
                  {parentOptionsForForm.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category Icon
                <input
                  name="icon"
                  value={formValues.icon}
                  onChange={onFormValueChange}
                  placeholder="emoji or short icon"
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Category Image URL
                <input
                  name="image"
                  value={formValues.image}
                  onChange={onFormValueChange}
                  placeholder="https://..."
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Display Order
                <input
                  type="number"
                  min="1"
                  name="displayOrder"
                  value={formValues.displayOrder}
                  onChange={onFormValueChange}
                  className="h-10 rounded-lg border border-(--color-border) px-3"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Status
                <select
                  name="status"
                  value={formValues.status}
                  onChange={onFormValueChange}
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
                Description
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={onFormValueChange}
                  rows={4}
                  className="rounded-lg border border-(--color-border) px-3 py-2"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
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
                  {editingCategoryId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsCategory && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-(--color-border) bg-(--color-surface) p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--color-main-text)">
                Category Details
              </h3>
              <button
                type="button"
                onClick={() => setDetailsCategoryId(null)}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <div className="flex items-start gap-3">
                {detailsCategory.image ? (
                  <img
                    src={detailsCategory.image}
                    alt={detailsCategory.name}
                    className="h-14 w-14 rounded-lg border border-(--color-border) object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-lg border border-(--color-border) bg-(--color-menu-btn-hover) text-xl">
                    {detailsCategory.icon || '📦'}
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-semibold text-(--color-main-text)">
                    {detailsCategory.name}
                  </h4>
                  <p className="mt-1 font-mono text-xs text-(--color-muted-text)">
                    {detailsCategory.code}
                  </p>
                  <p className="mt-1 text-sm text-(--color-muted-text)">
                    {detailsCategory.status === 'Active' ? 'Active' : 'Hidden'}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-(--color-main-text)">
                <p>
                  Parent Category:{' '}
                  {categoryById.get(detailsCategory.parentId)?.name || 'Root'}
                </p>
                <p>Display Order: {detailsCategory.displayOrder}</p>
                <p>Created Date: {detailsCategory.createdDate}</p>
                <p>
                  Total Products:{' '}
                  {productCountByCategoryId.get(detailsCategory.id) || 0}
                </p>
                <p>Description: {detailsCategory.description || 'N/A'}</p>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">
                Products in Category
              </h5>

              <ul className="mt-3 space-y-2">
                {(productsByCategoryId.get(detailsCategory.id) || []).length === 0 && (
                  <li className="text-sm text-(--color-muted-text)">
                    No products found in this category.
                  </li>
                )}

                {(productsByCategoryId.get(detailsCategory.id) || []).map((product) => (
                  <li
                    key={product.id}
                    className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2"
                  >
                    <p className="text-sm font-medium text-(--color-main-text)">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-(--color-muted-text)">
                      {product.sku}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <h5 className="font-semibold text-(--color-main-text)">Quick Actions</h5>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEditForm(detailsCategory)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  Edit Category
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(detailsCategory.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700"
                >
                  Delete Category
                </button>
                <button
                  type="button"
                  onClick={() => onViewProductsInCategory(detailsCategory.id)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  View Products
                </button>
                <button
                  type="button"
                  onClick={() => onAddProductToCategory(detailsCategory)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"
                >
                  Add New Product
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
