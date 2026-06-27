import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import MDDashboard from './dashboards/MDDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import SecurityDashboard from './dashboards/SecurityDashboard';
import VisitorDashboard from './dashboards/VisitorDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  // Route to specific dashboards based on the user's role
  if (!user) return null;

  switch (user.role) {
    case 'MD':
      return <MDDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Security':
      return <SecurityDashboard />;
    case 'Visitor':
      return <VisitorDashboard />;
    case 'Super Admin':
    default:
      return <SuperAdminDashboard />;
  }
};

export default DashboardRouter;
