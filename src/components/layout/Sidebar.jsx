import { createElement } from 'react'
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'POS', path: '/pos', icon: ShoppingCart },
  { label: 'Products', path: '/products', icon: Boxes },
  { label: 'Categories', path: '/categories', icon: Tags },
  { label: 'Inventory', path: '/inventory', icon: PackageSearch },
  { label: 'Repairs', path: '/repairs', icon: Wrench },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Warranty', path: '/warranty', icon: ShieldCheck },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Expenses', path: '/expenses', icon: ReceiptText },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-30 bg-(--color-sidebar-overlay) transition-opacity lg:hidden ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-label="Close sidebar overlay"
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar-bg) text-(--color-sidebar-text) shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-(--color-sidebar-divider) px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-(--color-accent) text-sm font-bold text-(--color-on-accent)">
              MS
            </div>
            <div>
              <p className="text-sm font-semibold">Mobile Shop POS</p>
              <p className="text-xs text-(--color-sidebar-muted)">Sidebar Menu</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--color-sidebar-link-text) hover:bg-(--color-sidebar-close-hover) lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto px-3 py-3" aria-label="Sidebar Navigation">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-(--color-sidebar-link-active-bg) text-(--color-sidebar-link-active-text)'
                    : 'text-(--color-sidebar-link-text) hover:bg-(--color-sidebar-link-hover-bg) hover:text-(--color-sidebar-link-hover-text)'
                }`
              }
            >
              {createElement(Icon, { size: 18, className: 'shrink-0' })}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
