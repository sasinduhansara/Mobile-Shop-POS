import { useMemo, useState } from 'react'
import { currencyFormat } from '../../../utils/currencyFormat.js'

const products = [
  { id: 1, name: 'iPhone 14 Pro Max', category: 'Smartphones', price: 385000, stock: 8 },
  { id: 2, name: 'Samsung Galaxy A55', category: 'Smartphones', price: 124000, stock: 15 },
  { id: 3, name: 'Google Pixel 8', category: 'Smartphones', price: 214000, stock: 9 },
  { id: 4, name: 'AirPods Pro 2', category: 'Accessories', price: 89000, stock: 24 },
  { id: 5, name: 'Anker 30W Charger', category: 'Accessories', price: 9500, stock: 47 },
  { id: 6, name: 'Power Bank 20,000mAh', category: 'Accessories', price: 15000, stock: 32 },
  { id: 7, name: 'Galaxy Watch 6', category: 'Wearables', price: 98000, stock: 11 },
  { id: 8, name: 'Redmi Buds 5', category: 'Wearables', price: 17900, stock: 28 },
]

const categories = ['All', ...new Set(products.map((product) => product.category))]
const paymentMethods = ['Cash', 'Card', 'QR']

function POSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cartItems, setCartItems] = useState([])
  const [manualDiscount, setManualDiscount] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('Cash')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
  })
  const [receiptPreview, setReceiptPreview] = useState('')

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems],
  )

  const parsedDiscount = Number(manualDiscount)
  const discountAmount =
    Number.isFinite(parsedDiscount) && parsedDiscount > 0 ? parsedDiscount : 0
  const appliedDiscount = Math.min(discountAmount, subtotal)
  const total = subtotal - appliedDiscount

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }

      return [...prev, { ...product, qty: 1 }]
    })
  }

  const increaseQty = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      ),
    )
  }

  const decreaseQty = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item) => item.qty > 0),
    )
  }

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const onCustomerInfoChange = (event) => {
    const { name, value } = event.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const onGenerateReceipt = () => {
    if (cartItems.length === 0) {
      setReceiptPreview('No items in cart. Add products to generate a receipt.')
      return
    }

    const receiptLines = [
      'Mobile Shop POS Receipt',
      `Date: ${new Date().toLocaleString()}`,
      `Customer: ${customerInfo.name || 'Walk-in Customer'}`,
      `Phone: ${customerInfo.phone || 'N/A'}`,
      `Payment: ${selectedPayment}`,
      '',
      ...cartItems.map(
        (item) =>
          `${item.name} x${item.qty} = ${currencyFormat(item.price * item.qty)}`,
      ),
      '',
      `Subtotal: ${currencyFormat(subtotal)}`,
      `Discount: -${currencyFormat(appliedDiscount)}`,
      `Total: ${currencyFormat(total)}`,
    ]

    setReceiptPreview(receiptLines.join('\n'))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-(--color-main-text)">POS Counter</h2>
        <p className="mt-2 text-sm text-(--color-muted-text)">
          Search products, build cart, update quantities, collect payment, and generate
          receipt.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-4 min-w-0">
          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
                Product Search
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by product or category"
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text) outline-none focus:border-(--color-accent)"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
                Category Filter
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text) outline-none focus:border-(--color-accent)"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">Product Grid</h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
                >
                  <p className="text-sm font-semibold text-(--color-main-text)">{product.name}</p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">{product.category}</p>
                  <p className="mt-2 text-sm font-semibold text-(--color-main-text)">
                    {currencyFormat(product.price)}
                  </p>
                  <p className="mt-1 text-xs text-(--color-muted-text)">Stock: {product.stock}</p>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="mt-3 h-9 w-full rounded-lg bg-(--color-accent) px-3 text-sm font-medium text-(--color-on-accent) hover:opacity-90"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="mt-4 text-sm text-(--color-muted-text)">
                No products found for the current search/filter.
              </p>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">Cart</h3>

            <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cartItems.length === 0 && (
                <p className="text-sm text-(--color-muted-text)">No items added yet.</p>
              )}

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-(--color-main-text)">{item.name}</p>
                      <p className="mt-1 text-xs text-(--color-muted-text)">
                        {currencyFormat(item.price)} each
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-(--color-border)">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.id)}
                        className="h-8 w-8 text-sm text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-medium text-(--color-main-text)">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => increaseQty(item.id)}
                        className="h-8 w-8 text-sm text-(--color-main-text) hover:bg-(--color-menu-btn-hover)"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-(--color-main-text)">
                      {currencyFormat(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
            <h3 className="text-base font-semibold text-(--color-main-text)">
              Subtotal / Total
            </h3>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
                Customer Name
                <input
                  name="name"
                  value={customerInfo.name}
                  onChange={onCustomerInfoChange}
                  placeholder="Enter customer name"
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text) outline-none focus:border-(--color-accent)"
                />
              </label>

              <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
                Phone Number
                <input
                  name="phone"
                  value={customerInfo.phone}
                  onChange={onCustomerInfoChange}
                  placeholder="Enter phone number"
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text) outline-none focus:border-(--color-accent)"
                />
              </label>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-(--color-muted-text)">Subtotal</span>
                <span className="font-medium text-(--color-main-text)">
                  {currencyFormat(subtotal)}
                </span>
              </div>

              <label className="grid gap-1 text-sm font-medium text-(--color-main-text)">
                Discount (LKR)
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={manualDiscount}
                  onChange={(event) => setManualDiscount(event.target.value)}
                  placeholder="Enter discount amount"
                  className="h-10 rounded-lg border border-(--color-border) px-3 text-sm text-(--color-main-text) outline-none focus:border-(--color-accent)"
                />
              </label>

              <div className="flex items-center justify-between">
                <span className="text-(--color-muted-text)">Discount</span>
                <span className="font-medium text-(--color-main-text)">
                  -{currencyFormat(appliedDiscount)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-(--color-border) pt-2">
                <span className="font-semibold text-(--color-main-text)">Total</span>
                <span className="text-lg font-semibold text-(--color-main-text)">
                  {currencyFormat(total)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-(--color-main-text)">Payment Buttons</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedPayment(method)}
                    className={`h-9 rounded-lg border text-sm font-medium transition ${
                      selectedPayment === method
                        ? 'border-(--color-accent) bg-(--color-accent) text-(--color-on-accent)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-main-text) hover:bg-(--color-menu-btn-hover)'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onGenerateReceipt}
              className="mt-4 h-10 w-full rounded-lg bg-(--color-main-text) text-sm font-semibold text-white hover:opacity-90"
            >
              Receipt Button
            </button>

            {receiptPreview && (
              <pre className="mt-4 max-h-56 overflow-auto rounded-xl border border-(--color-border) bg-(--color-menu-btn-hover) p-3 text-xs leading-5 text-(--color-main-text)">
                {receiptPreview}
              </pre>
            )}
          </article>
        </aside>
      </section>
    </div>
  )
}

export default POSPage
