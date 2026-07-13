import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/visitors/team-visitors`;

const TeamVisitorWidget = ({ branch }) => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today'); // 'Today', 'This Week', 'This Month'

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}?filter=${encodeURIComponent(filter)}`;
        if (branch && branch !== 'All Branches') {
          url += `&branchId=${encodeURIComponent(branch)}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setTeamData(data);
        }
      } catch (error) {
        console.error('Failed to fetch team visitors', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [branch, filter]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Users size={18} className="text-[var(--color-brand-indigo)]" />
          Visitors by Team
        </h3>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-[var(--color-brand-indigo)]"
        >
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>
      </div>
      
      <div className="p-5 flex-1 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
        ) : teamData.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 text-sm">
            No visitors found for this period.
          </div>
        ) : (
          <div className="space-y-4">
            {teamData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-[var(--color-brand-indigo)] flex items-center justify-center font-bold text-xs">
                    {item.team.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.team}</p>
                    <p className="text-xs text-gray-500">Members Visited</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamVisitorWidget;
