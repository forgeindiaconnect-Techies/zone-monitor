import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building, Users, UserCheck, CreditCard, Calendar, Activity, Check, X, ShieldAlert, Sparkles, Plus, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center space-x-4 transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const SaaSPlatformDashboard = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form states for creating a new company
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    adminName: '',
    email: '',
    mobileNumber: '',
    password: '',
    plan: 'One Day Trial'
  });
  const [showPassword, setShowPassword] = useState(false);

  // Mock payment simulator state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSimulation, setPaymentSimulation] = useState({
    companyCode: '',
    plan: 'Standard'
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name, code }

  const [isRegistering, setIsRegistering] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'X-Company-Id': user?.companyId || 'SYSTEM',
      'X-User-Id': user?.id || 'bootstrap-saas',
      'X-User-Role': user?.role || 'SaaS Super Admin'
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch companies
      const compRes = await fetch(`${API_BASE}/api/super-admin/companies`, {
        headers: getHeaders()
      });
      if (!compRes.ok) throw new Error('Failed to fetch companies');
      const compData = await compRes.json();
      setCompanies(compData);

      // Fetch analytics
      const analyticsRes = await fetch(`${API_BASE}/api/super-admin/analytics`, {
        headers: getHeaders()
      });
      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle delete company (with cascade)
  const handleDeleteCompany = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await fetch(`${API_BASE}/api/super-admin/companies/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete company');

      showToast(data.message, 'success');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
      setDeleteConfirm(null);
    }
  };

  // Toggle company active/inactive status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`${API_BASE}/api/super-admin/companies/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) throw new Error('Failed to update company status');
      showToast(`Company status updated to ${nextStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Update subscription tier
  const handlePlanChange = async (id, newPlan) => {
    try {
      const response = await fetch(`${API_BASE}/api/super-admin/companies/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ subscription: newPlan })
      });
      if (!response.ok) throw new Error('Failed to update company subscription');
      showToast(`Subscription plan updated to ${newPlan}`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Extend subscription expiration date by 30 days
  const handleExtendSubscription = async (id, currentExpiryStr) => {
    try {
      const currentExpiry = currentExpiryStr ? new Date(currentExpiryStr) : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + 30);

      const response = await fetch(`${API_BASE}/api/super-admin/companies/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ subscriptionExpiresAt: currentExpiry })
      });
      if (!response.ok) throw new Error('Failed to extend subscription expiry');
      showToast('Subscription extended by 30 days', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle register new company
  const handleRegisterCompany = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      showToast(`Registered successfully. Company Code: ${data.company.code}`, 'success');
      setShowCreateModal(false);
      setNewCompany({
        companyName: '',
        adminName: '',
        email: '',
        mobileNumber: '',
        password: '',
        plan: 'One Day Trial'
      });
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle mock payment simulation
  const handleMockPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/mock-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyCode: paymentSimulation.companyCode,
          plan: paymentSimulation.plan,
          paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment simulation failed');

      showToast(`Mock payment successful! Subscription activated for ${paymentSimulation.companyCode}.`, 'success');
      setShowPaymentModal(false);
      setPaymentSimulation({ companyCode: '', plan: 'Standard' });
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-1">
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-[9999] p-4 rounded-xl shadow-lg border flex items-center space-x-2 animate-in slide-in-from-top duration-300 ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <AlertCircle size={20} className={notification.type === 'error' ? 'text-red-600' : 'text-green-600'} />
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-[#1E1B6E]" />
            SaaS Platform Administration Portal
          </h1>
          <p className="text-gray-500 mt-1">Monitor, manage, and configure multi-tenant subscription accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl transition-colors border border-slate-200"
            title="Refresh statistics"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 bg-[#1E1B6E] hover:bg-opacity-90 text-white rounded-xl font-semibold shadow-sm transition-colors text-sm"
          >
            Simulate Payment
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 text-sm"
          >
            <Plus size={16} />
            Add Tenant
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2 text-red-800">
          <ShieldAlert size={20} className="text-red-600" />
          <span>Error loading data: {error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardCard 
          title="Total Registered Tenants" 
          value={analytics ? analytics.totalCompanies : '-'} 
          icon={Building} 
          colorClass="bg-blue-50 text-blue-600 border border-blue-100" 
        />
        <DashboardCard 
          title="Active Subscriptions" 
          value={analytics ? `${analytics.activeCompanies} / ${analytics.totalCompanies}` : '-'} 
          icon={UserCheck} 
          colorClass="bg-green-50 text-green-600 border border-green-100" 
          subtitle={`${analytics ? analytics.inactiveCompanies : 0} inactive/pending`}
        />
        <DashboardCard 
          title="Platform Visitors" 
          value={analytics ? analytics.totalVisitors : '-'} 
          icon={Users} 
          colorClass="bg-purple-50 text-purple-600 border border-purple-100" 
        />
        <DashboardCard 
          title="MRR (Mock billing)" 
          value={analytics ? `$${analytics.monthlyRevenue}` : '-'} 
          icon={CreditCard} 
          colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100" 
          subtitle={`Annual Projection: $${analytics ? analytics.annualRevenue : 0}`}
        />
        <DashboardCard 
          title="Inactive Tenants" 
          value={analytics ? analytics.inactiveCompanies : '-'} 
          icon={ShieldAlert} 
          colorClass="bg-red-50 text-red-600 border border-red-100" 
          subtitle="Awaiting activation"
        />
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tenant Companies</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage details, plans, active statuses, and expirations</p>
          </div>
          {analytics?.tiers && (
            <div className="flex space-x-4 text-xs font-semibold text-gray-600">
              <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100">1-Day Trial: {analytics.tiers.OneDayTrial}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full border">Basic: {analytics.tiers.Basic}</span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">Standard: {analytics.tiers.Standard}</span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">Enterprise: {analytics.tiers.Enterprise}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Company Name</th>
                <th className="px-6 py-4 font-medium">Company Code</th>
                <th className="px-6 py-4 font-medium">Plan Tier</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium text-center">Security Users</th>
                <th className="px-6 py-4 font-medium text-center">Visitors</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((comp) => (
                <tr key={comp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{comp.name}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 text-gray-700 px-2.5 py-1 rounded border border-slate-200 font-semibold">{comp.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={comp.subscription} 
                      onChange={(e) => handlePlanChange(comp._id, e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]"
                    >
                      <option value="One Day Trial">One Day Trial</option>
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{comp.subscriptionExpiresAt ? new Date(comp.subscriptionExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700 text-xs">{comp.userCount || 0}</td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700 text-xs">{comp.visitorCount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      comp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleStatus(comp._id, comp.status)}
                      className={`text-xs px-2.5 py-1 rounded border font-semibold transition-colors ${
                        comp.status === 'Active' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {comp.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleExtendSubscription(comp._id, comp.subscriptionExpiresAt)}
                      className="text-xs px-2.5 py-1 bg-indigo-50 text-[var(--color-brand-indigo)] border border-indigo-200 rounded font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      +30 Days
                    </button>
                    <button
                      onClick={() => {
                        if (comp.code === 'SYSTEM' || comp.code === 'FIC001') {
                          showToast(`'${comp.code}' is a system-protected tenant and cannot be deleted.`, 'error');
                          return;
                        }
                        setDeleteConfirm({ id: comp._id, name: comp.name, code: comp.code });
                      }}
                      className={`text-xs px-2.5 py-1 rounded border font-semibold transition-colors ${
                        comp.code === 'SYSTEM' || comp.code === 'FIC001'
                          ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600'
                      }`}
                      title={comp.code === 'SYSTEM' || comp.code === 'FIC001' ? 'System-protected tenant cannot be deleted' : `Delete ${comp.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No companies registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1E1B6E] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-md">Register New Tenant Company</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acme Industries"
                  value={newCompany.companyName}
                  onChange={(e) => setNewCompany({...newCompany, companyName: e.target.value})}
                  className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Plan Tier</label>
                  <select 
                    value={newCompany.plan}
                    onChange={(e) => setNewCompany({...newCompany, plan: e.target.value})}
                    className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]"
                  >
                    <option value="One Day Trial">One Day Trial (1 Day)</option>
                    <option value="Basic">Basic (30-Day Free Trial)</option>
                    <option value="Standard">Standard ($29/mo)</option>
                    <option value="Enterprise">Enterprise ($99/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Super Admin Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
                    value={newCompany.adminName}
                    onChange={(e) => setNewCompany({...newCompany, adminName: e.target.value})}
                    className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                  />
                  <p className="mt-1 text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Will be assigned the <span className="font-bold">Super Admin</span> role on their tenant dashboard
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Super Admin Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. admin@acme.com"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                  className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9876543210"
                    value={newCompany.mobileNumber}
                    onChange={(e) => setNewCompany({...newCompany, mobileNumber: e.target.value})}
                    className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Initial Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={newCompany.password}
                      onChange={(e) => setNewCompany({...newCompany, password: e.target.value})}
                      className="w-full text-sm border rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700 flex items-start gap-2">
                <span className="mt-0.5 text-indigo-500">ℹ️</span>
                <span>After creation, the tenant's Super Admin can log in with their email and password to access their own <strong>Super Admin Dashboard</strong>.</span>
              </div>
              <button 
                type="submit"
                disabled={isRegistering}
                className="w-full bg-[#1E1B6E] hover:bg-opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                {isRegistering ? 'Registering...' : 'Register Tenant & Create Super Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOCK PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1E1B6E] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-md">Mock Payment Simulator</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-white hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMockPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company Code to Upgrade</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ACM723"
                  value={paymentSimulation.companyCode}
                  onChange={(e) => setPaymentSimulation({...paymentSimulation, companyCode: e.target.value})}
                  className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Upgrade Plan</label>
                <select 
                  value={paymentSimulation.plan}
                  onChange={(e) => setPaymentSimulation({...paymentSimulation, plan: e.target.value})}
                  className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E1B6E]"
                >
                  <option value="Standard">Standard ($29/mo)</option>
                  <option value="Enterprise">Enterprise ($99/mo)</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                Simulate Stripe Success Callback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-md flex items-center gap-2">
                <ShieldAlert size={18} /> Confirm Permanent Deletion
              </h3>
              <button onClick={() => setDeleteConfirm(null)} className="text-white hover:text-red-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p className="font-bold mb-1">⚠️ This action cannot be undone!</p>
                <p>All data for this tenant will be <strong>permanently deleted</strong>, including:</p>
                <ul className="list-disc list-inside mt-1 text-xs space-y-0.5 text-red-700">
                  <li>All users (admin &amp; security staff)</li>
                  <li>All visitor records</li>
                  <li>Blacklist entries, zones, notifications</li>
                </ul>
              </div>
              <div className="bg-slate-50 border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Company to be deleted</p>
                <p className="font-bold text-gray-900 text-lg">{deleteConfirm.name}</p>
                <span className="font-mono text-xs bg-slate-200 text-gray-700 px-2 py-0.5 rounded">{deleteConfirm.code}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCompany}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaaSPlatformDashboard;
