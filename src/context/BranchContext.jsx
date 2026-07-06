import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const branches = ['All Branches', 'HEAD OFFICE(KRISHNAGIRI)', 'BANGALORE', 'THIRUPATTUR', 'DHARMAPURI(PALACODE)'];
  const [activeBranch, setActiveBranch] = useState('All Branches');

  useEffect(() => {
    // Only Super Admin can view All Branches. Everyone else is locked to their assigned branch.
    if (user && !['Super Admin'].includes(user.role)) {
      setActiveBranch(user.branch);
    } else if (!user) {
      setActiveBranch('All Branches');
    }
  }, [user]);

  return (
    <BranchContext.Provider value={{ branches, activeBranch, setActiveBranch }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
