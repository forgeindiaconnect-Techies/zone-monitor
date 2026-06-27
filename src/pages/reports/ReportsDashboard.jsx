import React, { useState } from 'react';
import { useVisitors } from '../../context/VisitorContext';
import { useZones } from '../../context/ZoneContext';
import { useBlacklist } from '../../context/BlacklistContext';
import { Download, FileText, FileSpreadsheet, ShieldCheck, Map, Building2, Users, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateTimeSpent } from '../../utils/timeUtils';

const ReportsDashboard = () => {
  const { allVisitors } = useVisitors();
  const { zones } = useZones();
  const { blacklisted } = useBlacklist();
  
  const { user } = useAuth();
  
  // Apply Strict Branch Filtering
  // If the user is assigned to a specific branch, they should ONLY see that branch's data, regardless of their role.
  const filteredVisitors = user?.branch && user.branch !== 'All'
    ? allVisitors.filter(v => v.branch === user.branch)
    : allVisitors;

  const [activeTab, setActiveTab] = useState('visitor');
  const [selectedZone, setSelectedZone] = useState(null);

  // Generic CSV Exporter
  const exportCSV = (data, filename) => {
    if (!data || !data.length) return alert("No data to export!");
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print(); // Simple browser print implementation for PDF
  };

  // 1. Visitor Report Data
  const visitorReportData = filteredVisitors.map(v => {
    const isCheckedOut = ['Exited', 'Completed'].includes(v.status);
    const displayExitTime = isCheckedOut ? (v.exitTime || 'N/A') : 'N/A';

    return {
      "Visitor": v.visitorName,
      "Branch": v.branch,
      "Purpose": v.purpose,
      "Entry": v.entryTime || 'N/A',
      "Exit": displayExitTime,
      "Time Spent": calculateTimeSpent(v.visitDate, v.entryTime, v.exitTime, v.status),
      "Status": v.status
    };
  });

  // 2. Zone Report Data
  const zoneReportData = zones.map(z => {
    const visitorsInZone = filteredVisitors.filter(v => v.currentZone === z.name && v.status === 'Inside').length;
    
    // Calculate Average Time
    let totalMinutes = 0;
    let logCount = 0;

    filteredVisitors.forEach(v => {
      if (v.zoneLogs && v.zoneLogs.length > 0) {
        v.zoneLogs.forEach(log => {
          if (log.zoneName === z.name && log.durationMinutes !== undefined && log.durationMinutes !== null) {
            totalMinutes += log.durationMinutes;
            logCount += 1;
          }
        });
      }
    });

    const averageTime = logCount > 0 ? `${Math.round(totalMinutes / logCount)} Min` : 'N/A';

    return {
      "Zone": z.name,
      "Visitors": visitorsInZone,
      "Average Time": averageTime
    };
  });

  // 3. Branch Report Data
  const uniqueBranches = [...new Set(filteredVisitors.map(v => v.branch).filter(Boolean))];
  const branchReportData = uniqueBranches.map(branch => {
    const branchVisitors = filteredVisitors.filter(v => v.branch === branch);
    const todayStr = new Date().toISOString().split('T')[0];
    const visitorsToday = branchVisitors.filter(v => v.visitDate === todayStr).length;
    const inside = branchVisitors.filter(v => v.status === 'Inside').length;
    const completed = branchVisitors.filter(v => ['Completed', 'Exited'].includes(v.status)).length;

    return {
      "Branch": branch,
      "Visitors Today": visitorsToday,
      "Inside": inside,
      "Completed": completed
    };
  });

  const renderTable = (data) => {
    if (!data.length) return <p className="text-gray-500 py-8 text-center">No records found for this report.</p>;
    
    const headers = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider">
              {headers.map(h => <th key={h} className="px-6 py-4 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                {headers.map(h => <td key={`${i}-${h}`} className="px-6 py-4 text-sm text-gray-700">{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'visitor': return visitorReportData;
      case 'zone': return zoneReportData;
      case 'branch': return branchReportData;
      default: return [];
    }
  };

  // Security Report Aggregates
  const totalVisitors = filteredVisitors.length;
  // Let's assume 'Approved' includes anything that progressed past Pending
  const approvedVisitors = filteredVisitors.filter(v => ['Approved', 'Inside', 'Exited', 'Completed'].includes(v.status)).length;
  const rejectedVisitors = filteredVisitors.filter(v => v.status === 'Rejected').length;
  const insideVisitors = filteredVisitors.filter(v => v.status === 'Inside').length;
  const checkedOutVisitors = filteredVisitors.filter(v => ['Exited', 'Completed'].includes(v.status)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print-friendly">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export data across all modules.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => exportCSV(activeTab === 'security' ? [
              { "Total Visitors": totalVisitors, "Approved": approvedVisitors, "Rejected": rejectedVisitors, "Inside": insideVisitors, "Checked Out": checkedOutVisitors }
            ] : getActiveData(), `${activeTab}_report`)}
            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors flex items-center space-x-2 border border-green-200"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
          <button 
            onClick={exportPDF}
            className="px-4 py-2 bg-[var(--color-brand-indigo)] text-white hover:bg-[var(--color-brand-indigo-light)] font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto print:hidden">
          <button 
            onClick={() => setActiveTab('visitor')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'visitor' ? 'border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={16}/> Visitor Report
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <ShieldCheck size={16}/> Security Report
          </button>
          <button 
            onClick={() => setActiveTab('zone')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'zone' ? 'border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Map size={16}/> Zone Report
          </button>
          <button 
            onClick={() => setActiveTab('branch')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === 'branch' ? 'border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Building2 size={16}/> Branch Report
          </button>
        </div>

        {/* Report Content */}
        {activeTab === 'security' && (
          <div className="p-8 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-gray-900 mb-2">{totalVisitors}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Visitors</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-green-600 mb-2">{approvedVisitors}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Approved</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-red-600 mb-2">{rejectedVisitors}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Rejected</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-[var(--color-brand-indigo)] mb-2">{insideVisitors}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inside</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-gray-700 mb-2">{checkedOutVisitors}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Checked Out</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zone' && (
          <div className="p-6 sm:p-8 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {zoneReportData.map((z, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Map size={80} className="text-[var(--color-brand-indigo)]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-[var(--color-brand-indigo)]">
                      <Map size={18} />
                    </div>
                    {z.Zone}
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Currently Inside</p>
                        <p className="text-3xl font-black text-gray-900 leading-none">{z.Visitors}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedZone(z.Zone)}
                        className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[var(--color-brand-indigo)] border border-indigo-100 hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm"
                        title="View visitors in this zone"
                      >
                        <Users size={18}/>
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Average Duration</p>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <Clock size={16} className={z["Average Time"] === 'N/A' ? 'text-gray-400' : 'text-orange-500'}/>
                        <span className="text-sm font-bold text-gray-700">{z["Average Time"]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'branch' && (
          <div className="p-0">
            {renderTable(branchReportData)}
          </div>
        )}

        {activeTab === 'visitor' && (
          <div className="p-0">
            {renderTable(visitorReportData)}
          </div>
        )}
      </div>

      {/* Zone Details Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Map size={20} className="text-[var(--color-brand-indigo)]"/> 
                Visitors currently in {selectedZone}
              </h3>
              <button onClick={() => setSelectedZone(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {filteredVisitors.filter(v => v.currentZone === selectedZone && v.status === 'Inside').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No visitors currently in this zone.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVisitors.filter(v => v.currentZone === selectedZone && v.status === 'Inside').map(visitor => (
                    <div key={visitor.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-[var(--color-brand-indigo)] flex items-center justify-center font-bold">
                          {visitor.visitorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{visitor.visitorName}</p>
                          <p className="text-xs text-gray-500">{visitor.companyName || 'Independent'} • Host: {visitor.hostName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">Entered At</p>
                        <p className="text-sm font-semibold text-gray-700">{visitor.entryTime || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsDashboard;
