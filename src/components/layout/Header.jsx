import { ChevronDown, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-(--color-header-border) bg-(--color-header-bg) backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl min-w-0 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--color-menu-btn-border) text-(--color-menu-btn-text) hover:bg-(--color-menu-btn-hover) lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--color-header-subtitle)">
              Mobile Shop POS
            </p>
            <h1 className="text-base font-semibold text-(--color-header-title)">
              Management Panel
            </h1>
          </div>
        </div>

        <Link
          to="/profile"
          className="inline-flex shrink-0 items-center gap-3 rounded-xl border border-(--color-profile-border) bg-(--color-profile-bg) px-2.5 py-1.5 text-left hover:bg-(--color-menu-btn-hover)"
          aria-label="User profile"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-(--color-profile-avatar-bg) text-sm font-semibold text-(--color-profile-avatar-text)">
            SA
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-(--color-profile-text)">
              Shop Admin
            </p>
            <p className="text-xs text-(--color-profile-subtext)">Administrator</p>
          </div>

          <ChevronDown size={16} className="text-(--color-profile-subtext)" />
        </Link>
      </div>
    </header>
  )
}

export default Header
