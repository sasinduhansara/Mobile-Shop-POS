import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import CustomersPage from '../features/customers/pages/CustomersPage.jsx'
import ProductsPage from '../features/inventory/pages/ProductsPage.jsx'
import POSPage from '../features/pos/pages/POSPage.jsx'
import RepairListPage from '../features/repairs/pages/RepairListPage.jsx'
import ReportsPage from '../features/reports/pages/ReportsPage.jsx'
import CategoriesPage from '../pages/CategoriesPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ExpensesPage from '../pages/ExpensesPage.jsx'
import InventoryPage from '../pages/InventoryPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import SuppliersPage from '../pages/SuppliersPage.jsx'
import WarrantyPage from '../pages/WarrantyPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/repairs" element={<RepairListPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/warranty" element={<WarrantyPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
