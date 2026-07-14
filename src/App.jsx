import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VisitorProvider } from './context/VisitorContext';
import { ZoneProvider } from './context/ZoneContext';
import { BlacklistProvider } from './context/BlacklistContext';
import { NotificationProvider } from './context/NotificationContext';
import { BranchProvider } from './context/BranchContext';
import { AttendanceProvider } from './context/AttendanceContext';
import ToastContainer from './components/notifications/ToastContainer';
import { ShieldAlert } from 'lucide-react';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/dashboards/NotificationsPage';
import VisitorList from './pages/visitors/VisitorList';
import VisitorForm from './pages/visitors/VisitorForm';
import ReturningVisitor from './pages/visitors/ReturningVisitor';
import VisitorPass from './pages/public/VisitorPass';
import ApprovalList from './pages/approvals/ApprovalList';
import ApprovalDetails from './pages/approvals/ApprovalDetails';
import ZoneList from './pages/zones/ZoneList';
import EntryExitLogs from './pages/tracking/EntryExitLogs';
import LiveMonitoring from './pages/tracking/LiveMonitoring';
import BlacklistList from './pages/blacklist/BlacklistList';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import AttendanceLog from './pages/tracking/AttendanceLog';
import Settings from './pages/settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if unauthorized
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pass/:visitId" element={<VisitorPass />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="notifications" element={<ProtectedRoute allowedRoles={['SaaS Super Admin', 'Super Admin', 'MD', 'Admin', 'Branch Admin', 'Security']}><NotificationsPage /></ProtectedRoute>} />
        
        {/* User Management */}
        <Route path="users" element={<ProtectedRoute allowedRoles={['Super Admin']}><UserList /></ProtectedRoute>} />
        <Route path="users/new" element={<ProtectedRoute allowedRoles={['Super Admin']}><UserForm /></ProtectedRoute>} />
        
        {/* Visitor Management */}
        <Route path="visitors" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><VisitorList /></ProtectedRoute>} />
        <Route path="visitors/new" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><VisitorForm /></ProtectedRoute>} />
        <Route path="visitors/returning" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><ReturningVisitor /></ProtectedRoute>} />
        
        {/* Approvals Module */}
        <Route path="approvals" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin']}><ApprovalList /></ProtectedRoute>} />
        <Route path="approvals/:id" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin']}><ApprovalDetails /></ProtectedRoute>} />
        
        {/* Other Modules */}
        <Route path="live-monitoring" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><LiveMonitoring /></ProtectedRoute>} />
        <Route path="zones" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><ZoneList /></ProtectedRoute>} />
        <Route path="tracking" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><EntryExitLogs /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin']}><AttendanceLog /></ProtectedRoute>} />
        <Route path="blacklist" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Security']}><BlacklistList /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin']}><ReportsDashboard /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['Super Admin', 'MD', 'Admin', 'Visitor']}><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

function App() {
  const [lockoutMessage, setLockoutMessage] = useState(null);

  useEffect(() => {
    const handleLockout = (e) => {
      setLockoutMessage(e.detail);
    };
    window.addEventListener('subscription-lock', handleLockout);
    return () => window.removeEventListener('subscription-lock', handleLockout);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <BranchProvider>
          <AttendanceProvider>
            <VisitorProvider>
              <ZoneProvider>
                <BlacklistProvider>
                  <Router>
                    {lockoutMessage && (
                      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-200">
                          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <ShieldAlert size={36} />
                          </div>
                          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Access Restrained</h2>
                          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            {lockoutMessage}
                          </p>
                          <div className="space-y-3">
                            <button 
                              onClick={() => {
                                setLockoutMessage(null);
                                localStorage.removeItem('zmvms_user');
                                window.location.href = '/login';
                              }}
                              className="w-full bg-[#1E1B6E] hover:bg-opacity-95 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
                            >
                              Sign Out & Switch Account
                            </button>
                            <button 
                              onClick={() => setLockoutMessage(null)}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-all border border-slate-200"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <AppRoutes />
                    <ToastContainer />
                  </Router>
                </BlacklistProvider>
              </ZoneProvider>
            </VisitorProvider>
          </AttendanceProvider>
        </BranchProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
