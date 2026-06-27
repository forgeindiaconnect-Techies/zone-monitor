import React, { createContext, useState, useContext, useEffect } from 'react';
import { useBranch } from './BranchContext';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const VisitorContext = createContext(null);
const API_URL = `http://${window.location.hostname}:5000/api/visitors`;

export const VisitorProvider = ({ children }) => {
  const { activeBranch } = useBranch();
  const { addNotification } = useNotification();
  const { user: currentUser } = useAuth();
  
  const [allVisitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch visitors from backend
  const fetchVisitors = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      } else {
        console.error('Failed to fetch visitors');
      }
    } catch (err) {
      console.error('API connection error:', err);
      // Fallback to local storage if API is down
      const saved = localStorage.getItem('zmvms_visitors');
      if (saved) {
        setVisitors(JSON.parse(saved));
      } else {
        // Fallback dummy data if nothing exists
        setVisitors([{
          id: '1',
          visitorName: 'John Doe',
          mobileNumber: '1234567890',
          email: 'john@example.com',
          companyName: 'Acme Corp',
          hostName: 'Jane Smith',
          purpose: 'Meeting',
          visitDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          branch: 'Chennai Branch',
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    
    // Auto-refresh data every 5 seconds so Admin dashboard updates in real-time
    const interval = setInterval(fetchVisitors, 5000);
    return () => clearInterval(interval);
  }, []);

  const visitors = React.useMemo(() => {
    // If not restricted (Super Admin) and 'All Branches' is selected
    if (activeBranch === 'All Branches') return allVisitors;
    // Otherwise return visitors matching the active branch
    return allVisitors.filter(v => v.branch === activeBranch);
  }, [allVisitors, activeBranch]);

  const addVisitor = async (visitorData) => {
    // Only Super Admin uses the activeBranch from dropdown.
    // Admin, Security, and MD are locked to their own branch.
    const userBranch = currentUser && !['Super Admin'].includes(currentUser.role) 
      ? currentUser.branch 
      : (activeBranch === 'All Branches' ? 'Chennai' : activeBranch);
    
    const newVisitor = {
      ...visitorData,
      status: visitorData.status || 'Pending',
      branch: userBranch,
    };
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisitor)
      });
      
      if (response.ok) {
        const savedVisitor = await response.json();
        setVisitors([...allVisitors, savedVisitor]);
        addNotification('Visitor Registered', `${savedVisitor.visitorName} has been pre-registered.`, 'success');
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (err) {
      console.error(err);
      // Fallback for when backend is not running
      const fallbackVisitor = { ...newVisitor, id: Date.now().toString() };
      setVisitors([...allVisitors, fallbackVisitor]);
      addNotification('Visitor Registered (Offline)', `${fallbackVisitor.visitorName} saved locally.`, 'warning');
    }
  };

  const updateVisitorStatus = async (id, newStatus, approvalData = {}) => {
    const updates = { 
      status: newStatus,
      remarks: approvalData.remarks,
      approvedBy: approvalData.approvedBy
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedVisitor = await response.json();
        setVisitors(allVisitors.map(v => v.id === id ? updatedVisitor : v));
      } else {
         throw new Error('API Update failed');
      }
    } catch (err) {
      console.error(err);
      setVisitors(allVisitors.map(v => v.id === id ? { ...v, ...updates } : v));
    }
    
    if (newStatus === 'Approved') {
      addNotification('Visitor Approved', `Access granted for visitor ID: ${id}`, 'success');
    } else if (newStatus === 'Rejected') {
      addNotification('Visitor Rejected', `Access denied for visitor ID: ${id}`, 'error');
    }
  };

  const updateVisitorTracking = async (id, trackingData) => {
    try {
      const response = await fetch(`${API_URL}/${id}/zone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
      
      if (response.ok) {
        const updatedVisitor = await response.json();
        setVisitors(allVisitors.map(v => v.id === id ? updatedVisitor : v));
      } else {
         throw new Error('API Update failed');
      }
    } catch (err) {
      console.error(err);
      setVisitors(allVisitors.map(v => v.id === id ? { ...v, ...trackingData } : v));
    }
    
    if (trackingData.status === 'Inside') {
      addNotification('Visitor Entered', `Visitor entered ${trackingData.currentZone}`, 'info');
    } else if (trackingData.status === 'Exited') {
      addNotification('Visitor Exited', `Visitor exited the premises`, 'info');
    }
  };

  // Keep local storage updated as a backup
  useEffect(() => {
    if (allVisitors.length > 0) {
      localStorage.setItem('zmvms_visitors', JSON.stringify(allVisitors));
    }
  }, [allVisitors]);

  return (
    <VisitorContext.Provider value={{ visitors, allVisitors, addVisitor, updateVisitorStatus, updateVisitorTracking, loading }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitors = () => useContext(VisitorContext);
