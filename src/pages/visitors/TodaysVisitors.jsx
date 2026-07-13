import React, { useState, useEffect } from 'react';
import { Users, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';

const API_URL = `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/visitors`;

const TodaysVisitors = () => {
  const { user: currentUser } = useAuth();
  const { activeBranch } = useBranch();
  
  const [data, setData] = useState({ totalVisitorsToday: 0, teamBreakdown: [] });
  const [loading, setLoading] = useState(true);

  // Determine which branch to query based on user role
  const queryBranch = currentUser && !['Super Admin'].includes(currentUser.role) 
    ? currentUser.branch 
    : activeBranch;

  const fetchData = async () => {
    try {
      let fetchUrl = `${API_URL}/todays-summary`;
      if (queryBranch && queryBranch !== 'All Branches') {
        fetchUrl += `?branchId=${encodeURIComponent(queryBranch)}`;
      }
      
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching todays visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 5 seconds to show real-time count
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [queryBranch]);

  return (
    <div className="animate-in fade-in duration-500 max-w-xl mx-auto pt-8">
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Visitor Count by Host</h2>
          <p className="text-sm text-gray-500 mt-1">Today's Live Summary</p>
        </div>

        {/* List Body */}
        <div className="px-8 py-6">
          {loading && data.teamBreakdown.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Loading live data...</div>
          ) : data.teamBreakdown.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-medium">No visitors registered today.</div>
          ) : (
            <div className="space-y-4">
              {data.teamBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[var(--color-brand-indigo)] group-hover:bg-indigo-100 transition-colors">
                      <UserCheck size={18} />
                    </div>
                    <span className="text-gray-800 font-semibold text-lg">{item.hostName}</span>
                  </div>
                  <div className="text-gray-600 font-medium">
                    <span className="text-xl text-gray-900 font-bold mr-1">{item.count}</span>
                    <span className="text-sm">Visitors</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Total */}
        <div className="px-8 py-5 bg-[var(--color-brand-indigo)] text-white">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-100">Total Visitors:</span>
            <span className="text-3xl font-black">{loading ? '...' : data.totalVisitorsToday}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysVisitors;
