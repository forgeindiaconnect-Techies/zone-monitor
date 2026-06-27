import React, { useState } from 'react';
import { useVisitors } from '../../context/VisitorContext';
import { useBlacklist } from '../../context/BlacklistContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, User, Calendar, FileText, Camera, IdCard, Info, Search } from 'lucide-react';

const VisitorForm = () => {
  const { addVisitor, allVisitors } = useVisitors();
  const { isBlacklisted } = useBlacklist();
  const navigate = useNavigate();
  
  const [hosts, setHosts] = useState([
    'John Doe (Director)',
    'Jane Smith (HR Manager)',
    'Robert Chen (IT Dept)',
    'Sarah Johnson (Operations)',
    'Admin Desk'
  ]);
  
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [newHostName, setNewHostName] = useState('');
  
  const [formData, setFormData] = useState({
    visitorName: '',
    mobileNumber: '',
    email: '',
    companyName: '',
    hostName: '',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    expectedArrivalTime: '',
    hostNotes: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlacklisted(formData.mobileNumber)) {
      alert("Registration Blocked: This mobile number is on the Blacklist.");
      return;
    }
    addVisitor(formData);
    navigate('/visitors');
  };

  // Reusable input class
  const inputClassName = "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[var(--color-brand-indigo)] focus:border-[var(--color-brand-indigo)] outline-none transition-shadow placeholder-gray-300";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/visitors')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Visitor</h1>
          <p className="text-gray-500 mt-1">Pre-register a visitor for seamless facility access.</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 hidden md:block">
        <div className="flex items-center justify-between relative px-8">
          <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-gray-100 -z-10"></div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-indigo)] text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
            <span className="text-xs font-semibold text-[var(--color-brand-indigo)] uppercase tracking-wider">Personal Info</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border-2 border-white flex items-center justify-center font-bold text-sm">2</div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Visit Details</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border-2 border-white flex items-center justify-center font-bold text-sm">3</div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Documents</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 border-2 border-white flex items-center justify-center font-bold text-sm">4</div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Review</span>
          </div>
        </div>
      </div>

      {/* Info Tip Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 text-purple-800 shadow-sm">
        <Info className="flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-medium text-sm">Automated QR Pass Generation</p>
          <p className="text-xs opacity-80 mt-1">Fields marked with an asterisk (*) are mandatory. Once approved, the visitor will automatically receive a QR Code Entry Pass via SMS/Email.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        

        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input required type="text" name="visitorName" value={formData.visitorName} onChange={handleChange} className={inputClassName} placeholder="e.g., Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>Mobile Number *</span>
                  <span className="text-[10px] text-gray-400">Auto-fills for returning visitors</span>
                </label>
                <input 
                  required 
                  type="tel" 
                  name="mobileNumber" 
                  value={formData.mobileNumber} 
                  onChange={handleChange} 
                  className={inputClassName} 
                  placeholder="e.g., 9876543210" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClassName} placeholder="e.g., jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={inputClassName} placeholder="e.g., Tech Corp" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Visit Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Visit Details</h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                  <span>Host Name *</span>
                  <button 
                    type="button" 
                    onClick={() => setIsHostModalOpen(true)}
                    className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-indigo)] hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-100 transition-colors"
                  >
                    + Add Host
                  </button>
                </label>
                <select required name="hostName" value={formData.hostName} onChange={handleChange} className={`${inputClassName} bg-white`}>
                  <option value="">Select Host</option>
                  {hosts.map(host => (
                    <option key={host} value={host}>{host}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit *</label>
                <select required name="purpose" value={formData.purpose} onChange={handleChange} className={`${inputClassName} bg-white`}>
                  <option value="">Select Purpose</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Interview">Interview</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Visit Date *</label>
                <input required type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Arrival Time</label>
                <input type="time" name="expectedArrivalTime" value={formData.expectedArrivalTime} onChange={handleChange} className={inputClassName} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes for Host (Optional)</label>
                <textarea name="hostNotes" value={formData.hostNotes} onChange={handleChange} rows="3" className={inputClassName} placeholder="Any specific instructions, parking requests, or context for the meeting..."></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Documents & Verification */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Documents & Verification</h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
                  <Camera className="text-gray-400 group-hover:text-blue-600 transition-colors" size={28} />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Capture / Upload Photo</p>
                <p className="text-xs text-gray-400 mt-1">Live capture or JPEG/PNG up to 5MB</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
                  <IdCard className="text-gray-400 group-hover:text-blue-600 transition-colors" size={28} />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Upload ID Proof</p>
                <p className="text-xs text-gray-400 mt-1">Aadhar, PAN, or Driving License</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={() => navigate('/visitors')} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-8 py-3 bg-[var(--color-brand-indigo)] text-white font-bold rounded-lg hover:bg-[var(--color-brand-indigo-light)] transition-colors flex items-center space-x-2 shadow-md">
            <Save size={20} />
            <span>Generate Visitor Pass</span>
          </button>
        </div>
      </form>

      {/* Add Host Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="text-[var(--color-brand-indigo)]" size={18} />
                Add New Host
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setIsHostModalOpen(false);
                  setNewHostName('');
                }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Host Name & Department</label>
              <input 
                type="text" 
                autoFocus
                value={newHostName} 
                onChange={(e) => setNewHostName(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] transition-all" 
                placeholder="e.g. Mike Smith (Sales)" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newHostName.trim() !== '') {
                      setHosts([...hosts, newHostName.trim()]);
                      setFormData({...formData, hostName: newHostName.trim()});
                      setIsHostModalOpen(false);
                      setNewHostName('');
                    }
                  }
                }}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => {
                  setIsHostModalOpen(false);
                  setNewHostName('');
                }} 
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (newHostName.trim() !== '') {
                    setHosts([...hosts, newHostName.trim()]);
                    setFormData({...formData, hostName: newHostName.trim()});
                    setIsHostModalOpen(false);
                    setNewHostName('');
                  }
                }}
                className="px-4 py-2 bg-[var(--color-brand-indigo)] hover:bg-[var(--color-brand-indigo-light)] text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                Add Host
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default VisitorForm;
