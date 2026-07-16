import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

const SubscriptionModals = () => {
  const { user, logout } = useAuth();
  
  // lock, choose_plan, payment, success
  const [mode, setMode] = useState(user?.isExpired && user?.role !== 'SaaS Super Admin' ? 'lock' : 'none');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const handleLock = (e) => {
      if (user?.role !== 'SaaS Super Admin') {
        setMode('lock');
      }
    };
    const handleOpenModal = (e) => {
      setMode('choose_plan');
    };
    
    window.addEventListener('subscription-lock', handleLock);
    window.addEventListener('open-upgrade-modal', handleOpenModal);
    
    return () => {
      window.removeEventListener('subscription-lock', handleLock);
      window.removeEventListener('open-upgrade-modal', handleOpenModal);
    };
  }, [user]);

  // If not locked and no modal is active, render nothing
  if (mode === 'none') return null;

  const plans = [
    { name: 'Basic', price: 999, features: ['500 Visitors / Month', '2 Branches', '5 Security Users'], color: 'green' },
    { name: 'Standard', price: 2999, features: ['Unlimited Visitors', '10 Branches', '20 Security Users'], color: 'blue' },
    { name: 'Enterprise', price: 6999, features: ['Unlimited Everything', 'Priority Support', 'Advanced Analytics'], color: 'purple' }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setMode('payment');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const url = `${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://zone-monitor.onrender.com')}/api/company/request-upgrade`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Company-Id': user?.companyId
        },
        body: JSON.stringify({
          requestedPlan: selectedPlan.name,
          amount: selectedPlan.price,
          durationDays: 30
        })
      });
      
      if (response.ok) {
        setTransactionId('TXN' + Math.floor(Math.random() * 1000000));
        setMode('success');
      } else {
        alert('Failed to send upgrade request.');
        setMode('choose_plan');
      }
    } catch (err) {
      alert('Network error while processing payment.');
      setMode('choose_plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (user?.isExpired && user?.role !== 'SaaS Super Admin') {
      setMode('lock');
    } else {
      setMode('none');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* 1. LOCK SCREEN */}
      {mode === 'lock' && (
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">⚠ Trial Expired</h2>
          <p className="text-gray-600 mb-6">
            Your subscription has ended. Please upgrade your plan to continue using the Visitor Management System.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Current Plan</span>
              <span className="font-bold text-gray-900">{user?.subscription || 'One Day Trial'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Expired On</span>
              <span className="font-bold text-red-600">
                {user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setMode('choose_plan')}
              className="w-full bg-[#1E1B6E] text-white rounded-xl py-3.5 font-bold hover:bg-indigo-900 transition-colors shadow-lg shadow-indigo-200"
            >
              Upgrade Now
            </button>
            <button
              onClick={logout}
              className="w-full bg-white text-gray-700 border border-gray-300 rounded-xl py-3.5 font-bold hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* 2. CHOOSE PLAN */}
      {mode === 'choose_plan' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-5xl w-full shadow-2xl overflow-y-auto hide-scrollbar max-h-[90vh]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Upgrade Your Plan</h2>
            <p className="text-gray-500 text-lg">Choose the best plan for your company.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className="border-2 border-slate-100 hover:border-slate-300 rounded-2xl p-6 flex flex-col transition-all hover:shadow-xl bg-white">
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-${plan.color}-100 text-${plan.color}-700 mb-4`}>
                    <div className={`w-2 h-2 rounded-full bg-${plan.color}-500`}></div>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-500 font-medium">/ Month</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className={`text-${plan.color}-500 shrink-0 mt-0.5`} size={18} />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg ${
                    plan.name === 'Enterprise' ? 'bg-purple-600 hover:bg-purple-700' :
                    plan.name === 'Standard' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
          
          {!user?.isExpired && (
            <div className="mt-8 text-center">
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* 3. PAYMENT METHOD */}
      {mode === 'payment' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <CreditCard className="text-gray-400" size={28} />
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-medium">Selected Plan</span>
              <span className="font-bold text-gray-900 text-lg">{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-medium">Duration</span>
              <span className="font-bold text-gray-900">30 Days</span>
            </div>
            <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Price</span>
              <span className="font-black text-[#1E1B6E] text-xl">₹{selectedPlan?.price}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 mb-4">Choose Payment Method</h3>
          <form onSubmit={handlePaymentSubmit}>
            <div className="space-y-3 mb-8">
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                <label key={method} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="paymentMethod" value={method} defaultChecked={method === 'UPI'} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                  <span className="font-medium text-gray-700">{method}</span>
                </label>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#1E1B6E] text-white rounded-xl py-4 font-bold hover:bg-indigo-900 transition-colors shadow-lg flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                `Proceed Payment (₹${selectedPlan?.price})`
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode('choose_plan')}
              disabled={isProcessing}
              className="w-full mt-4 text-gray-500 hover:text-gray-800 font-medium py-2"
            >
              Back to Plans
            </button>
          </form>
        </div>
      )}

      {/* 4. SUCCESS */}
      {mode === 'success' && (
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Transaction ID</span>
              <span className="font-bold text-gray-900 text-sm">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Plan</span>
              <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">₹{selectedPlan?.price}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-8 px-4 font-medium">
            Your request has been sent to the SaaS Administrator for approval.
          </p>
          
          <button
            onClick={handleClose}
            className="w-full bg-[#1E1B6E] text-white rounded-xl py-3.5 font-bold hover:bg-indigo-900 transition-colors shadow-lg"
          >
            OK
          </button>
        </div>
      )}
      
    </div>
  );
};

export default SubscriptionModals;
