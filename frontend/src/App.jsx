import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Sales from './pages/Sales'
import Construction from './pages/Construction'
import Office from './pages/Office'
import Management from './pages/Management'
import Settings from './pages/Settings'

// Sales sub-pages
import QuoteList from './pages/sales/QuoteList'
import QuoteCreate from './pages/sales/QuoteCreate'
import Schedule from './pages/sales/Schedule'
import BusinessCards from './pages/sales/BusinessCards'

// Construction sub-pages
import DailyReport from './pages/construction/DailyReport'
import SiteList from './pages/construction/SiteList'
import KYRecord from './pages/construction/KYRecord'
import Photos from './pages/construction/Photos'
import Inventory from './pages/construction/Inventory'

// Office sub-pages
import Expenses from './pages/office/Expenses'
import ExpenseRequest from './pages/office/ExpenseRequest'
import Income from './pages/office/Income'
import LeaveRequest from './pages/office/LeaveRequest'

// Management sub-pages
import Dashboard from './pages/management/Dashboard'
import MonthlyReport from './pages/management/MonthlyReport'

// Settings sub-pages
import Employees from './pages/settings/Employees'
import Clients from './pages/settings/Clients'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />

      {/* Main menu pages */}
      <Route path="/sales" element={
        <ProtectedRoute><Sales /></ProtectedRoute>
      } />
      <Route path="/construction" element={
        <ProtectedRoute><Construction /></ProtectedRoute>
      } />
      <Route path="/office" element={
        <ProtectedRoute><Office /></ProtectedRoute>
      } />
      <Route path="/management" element={
        <ProtectedRoute><Management /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />

      {/* Sales sub-pages */}
      <Route path="/sales/quotes" element={
        <ProtectedRoute><QuoteList /></ProtectedRoute>
      } />
      <Route path="/sales/quote-create" element={
        <ProtectedRoute><QuoteCreate /></ProtectedRoute>
      } />
      <Route path="/sales/schedule" element={
        <ProtectedRoute><Schedule /></ProtectedRoute>
      } />
      <Route path="/sales/cards" element={
        <ProtectedRoute><BusinessCards /></ProtectedRoute>
      } />
      <Route path="/sales/*" element={
        <ProtectedRoute><PlaceholderPage title="営業" backPath="/sales" /></ProtectedRoute>
      } />

      {/* Construction sub-pages */}
      <Route path="/construction/daily-report" element={
        <ProtectedRoute><DailyReport /></ProtectedRoute>
      } />
      <Route path="/construction/sites" element={
        <ProtectedRoute><SiteList /></ProtectedRoute>
      } />
      <Route path="/construction/ky" element={
        <ProtectedRoute><KYRecord /></ProtectedRoute>
      } />
      <Route path="/construction/photos" element={
        <ProtectedRoute><Photos /></ProtectedRoute>
      } />
      <Route path="/construction/inventory" element={
        <ProtectedRoute><Inventory /></ProtectedRoute>
      } />
      <Route path="/construction/*" element={
        <ProtectedRoute><PlaceholderPage title="工事" backPath="/construction" /></ProtectedRoute>
      } />

      {/* Office sub-pages */}
      <Route path="/office/expenses" element={
        <ProtectedRoute><Expenses /></ProtectedRoute>
      } />
      <Route path="/office/expense-request" element={
        <ProtectedRoute><ExpenseRequest /></ProtectedRoute>
      } />
      <Route path="/office/income" element={
        <ProtectedRoute><Income /></ProtectedRoute>
      } />
      <Route path="/office/leave-request" element={
        <ProtectedRoute><LeaveRequest /></ProtectedRoute>
      } />
      <Route path="/office/*" element={
        <ProtectedRoute><PlaceholderPage title="事務" backPath="/office" /></ProtectedRoute>
      } />

      {/* Management sub-pages */}
      <Route path="/management/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/management/monthly-report" element={
        <ProtectedRoute><MonthlyReport /></ProtectedRoute>
      } />
      <Route path="/management/*" element={
        <ProtectedRoute><PlaceholderPage title="経営" backPath="/management" /></ProtectedRoute>
      } />

      {/* Settings sub-pages */}
      <Route path="/settings/employees" element={
        <ProtectedRoute><Employees /></ProtectedRoute>
      } />
      <Route path="/settings/clients" element={
        <ProtectedRoute><Clients /></ProtectedRoute>
      } />
      <Route path="/settings/*" element={
        <ProtectedRoute><PlaceholderPage title="設定/マスタ" backPath="/settings" /></ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

// Temporary placeholder for sub-pages
function PlaceholderPage({ title, backPath = '/' }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden">
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(59, 130, 246, 0.2)',
          top: '-10%',
          left: '-10%',
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-bold text-white mb-2">準備中</h1>
          <p className="text-gray-400 mb-6">この機能は現在開発中です</p>
          <button
            onClick={() => navigate(backPath)}
            className="glass-button rounded-xl px-6 py-3 text-white hover:bg-white/20"
          >
            ← {title}に戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
