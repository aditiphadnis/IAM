import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  ChevronDown, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Info,
  Globe,
  Lock,
  Zap,
  LayoutGrid,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Building,
  Edit2,
  ArrowUpDown,
  Calendar
} from 'lucide-react';

interface TenantInstance {
  id: string;
  name: string;
  isMsp: boolean;
  isOffshoreRestricted: boolean;
  isCdmPhase3: boolean;
  logoUrl?: string;
  status: 'Success' | 'Failed' | 'Pending';
  failureMessage?: string;
  onboardedAt: string;
  updatedAt: string;
}

const INITIAL_TENANTS: TenantInstance[] = [
  { 
    id: 't1', 
    name: 'Element 5', 
    isMsp: false, 
    isOffshoreRestricted: true, 
    isCdmPhase3: true, 
    status: 'Success', 
    onboardedAt: '2023-10-15',
    updatedAt: '2023-10-15'
  },
  { 
    id: 't2', 
    name: 'LHC Group', 
    isMsp: true, 
    isOffshoreRestricted: false, 
    isCdmPhase3: true, 
    status: 'Success', 
    onboardedAt: '2024-01-20',
    updatedAt: '2024-02-10'
  },
  { 
    id: 't3', 
    name: 'Well Sky', 
    isMsp: false, 
    isOffshoreRestricted: false, 
    isCdmPhase3: false, 
    status: 'Failed', 
    failureMessage: 'Billing validation failed: Invalid tax identifier provided for regional entity.',
    onboardedAt: '2024-03-05',
    updatedAt: '2024-03-05'
  },
  { 
    id: 't4', 
    name: 'Centerwell', 
    isMsp: true, 
    isOffshoreRestricted: true, 
    isCdmPhase3: true, 
    status: 'Success', 
    onboardedAt: '2024-04-12',
    updatedAt: '2024-04-15'
  },
  { 
    id: 't5', 
    name: 'Vivie', 
    isMsp: false, 
    isOffshoreRestricted: false, 
    isCdmPhase3: true, 
    status: 'Success', 
    onboardedAt: '2024-05-18',
    updatedAt: '2024-05-18'
  },
  { 
    id: 't6', 
    name: 'Graham', 
    isMsp: false, 
    isOffshoreRestricted: true, 
    isCdmPhase3: false, 
    status: 'Success', 
    onboardedAt: '2024-06-02',
    updatedAt: '2024-06-10'
  }
];

const TenantOnboardingView: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState<TenantInstance[]>(INITIAL_TENANTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TenantInstance; direction: 'asc' | 'desc' } | null>({
    key: 'onboardedAt',
    direction: 'desc'
  });
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    isMsp: false,
    isOffshoreRestricted: false,
    isCdmPhase3: false,
    logo: null as File | null
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleSort = (key: keyof TenantInstance) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTenants = useMemo(() => {
    let result = tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [searchQuery, tenants, sortConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      isMsp: false,
      isOffshoreRestricted: false,
      isCdmPhase3: false,
      logo: null
    });
    setEditingId(null);
  };

  const handleEdit = (tenant: TenantInstance) => {
    setFormData({
      name: tenant.name,
      isMsp: tenant.isMsp,
      isOffshoreRestricted: tenant.isOffshoreRestricted,
      isCdmPhase3: tenant.isCdmPhase3,
      logo: null 
    });
    setEditingId(tenant.id);
    setActiveView('form');
  };

  const handleOnboard = () => {
    setIsProcessing(true);
    const now = new Date().toISOString();
    
    setTimeout(() => {
      const willFail = formData.name.toLowerCase().includes('fail');
      
      if (editingId) {
        setTenants(prev => prev.map(t => t.id === editingId ? {
          ...t,
          name: formData.name,
          isMsp: formData.isMsp,
          isOffshoreRestricted: formData.isOffshoreRestricted,
          isCdmPhase3: formData.isCdmPhase3,
          status: willFail ? 'Failed' : 'Success',
          failureMessage: willFail ? 'Validation error: System detected conflicting offshore restriction policy.' : undefined,
          updatedAt: now.split('T')[0]
        } : t));
      } else {
        const newTenant: TenantInstance = {
          id: `t-${Date.now()}`,
          name: formData.name,
          isMsp: formData.isMsp,
          isOffshoreRestricted: formData.isOffshoreRestricted,
          isCdmPhase3: formData.isCdmPhase3,
          status: willFail ? 'Failed' : 'Success',
          failureMessage: willFail ? 'Validation error: System detected conflicting offshore restriction policy.' : undefined,
          onboardedAt: now.split('T')[0],
          updatedAt: now.split('T')[0]
        };
        setTenants([newTenant, ...tenants]);
      }

      setIsProcessing(false);
      setActiveView('list');
      resetForm();
    }, 3000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tenant Onboarding</h1>
          <p className="mt-3 text-slate-500 text-lg leading-relaxed">
            Provision and configure new organizational units with enterprise security parameters.
          </p>
        </div>
        
        {activeView === 'list' && (
          <button 
            onClick={() => { resetForm(); setActiveView('form'); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <PlusCircle size={20} />
            Onboard New Tenant
          </button>
        )}
      </div>

      {activeView === 'list' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tenants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl transition-all outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredAndSortedTenants.length} Managed Tenants
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tenant name</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">MSP</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">CDM P3</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Offshore</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th 
                    className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort('onboardedAt')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Onboarded Date
                      <ArrowUpDown size={12} className={sortConfig?.key === 'onboardedAt' ? 'text-indigo-600' : ''} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Updated Date
                      <ArrowUpDown size={12} className={sortConfig?.key === 'updatedAt' ? 'text-indigo-600' : ''} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{tenant.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {tenant.isMsp ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-extrabold border border-blue-100">YES</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-bold border border-slate-200">NO</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {tenant.isCdmPhase3 ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-extrabold border border-emerald-100">YES</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-bold border border-slate-200">NO</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {tenant.isOffshoreRestricted ? (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-extrabold border border-orange-100">YES</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-bold border border-slate-200">NO</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold border flex items-center gap-1.5 ${
                          tenant.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          tenant.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {tenant.status === 'Success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {tenant.status.toUpperCase()}
                        </span>
                        {tenant.failureMessage && (
                          <div className="group/msg relative">
                            <AlertCircle size={12} className="text-red-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                              {tenant.failureMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[11px] font-bold text-slate-600">{formatDate(tenant.onboardedAt)}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Onboarded</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[11px] font-bold text-slate-600">{formatDate(tenant.updatedAt)}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Updated</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(tenant)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Edit Tenant"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => { setActiveView('list'); resetForm(); }}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Discard and Go Back
          </button>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-12 py-10 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {editingId ? 'Edit Tenant Details' : 'System Provisioning'}
              </h2>
              <p className="text-slate-500 font-medium mt-1">Submit global configuration parameters for the organization.</p>
            </div>

            <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={14} /> Tenant name
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Phoenix Medical Group"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                    />
                    {!editingId && <p className="text-[10px] text-slate-400 font-bold ml-1 italic">Type "fail" to test failure state simulation.</p>}
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Lock size={14} /> Security & Classification
                    </label>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => setFormData({...formData, isMsp: !formData.isMsp})}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          formData.isMsp ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${formData.isMsp ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <LayoutGrid size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">MSP Account</p>
                            <p className="text-[10px] text-slate-500 font-medium">Managed Service Provider context</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isMsp ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                          {formData.isMsp && <Check size={14} className="text-white" />}
                        </div>
                      </button>

                      <button 
                        onClick={() => setFormData({...formData, isOffshoreRestricted: !formData.isOffshoreRestricted})}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          formData.isOffshoreRestricted ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${formData.isOffshoreRestricted ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Globe size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Offshore Restricted</p>
                            <p className="text-[10px] text-slate-500 font-medium">No offshore access permitted</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isOffshoreRestricted ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-200'}`}>
                          {formData.isOffshoreRestricted && <Check size={14} className="text-white" />}
                        </div>
                      </button>

                      <button 
                        onClick={() => setFormData({...formData, isCdmPhase3: !formData.isCdmPhase3})}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          formData.isCdmPhase3 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${formData.isCdmPhase3 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">CDM Phase 3</p>
                            <p className="text-[10px] text-slate-500 font-medium">Enable advanced data modeling</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isCdmPhase3 ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                          {formData.isCdmPhase3 && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} /> Brand Assets
                    </label>
                    <div className="group relative">
                      <Info size={16} className="text-slate-300 hover:text-indigo-500 cursor-help transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 w-56 p-4 bg-slate-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed">
                        <p className="font-bold border-b border-white/20 pb-2 mb-2 uppercase tracking-widest">Logo Requirements</p>
                        <ul className="space-y-1 opacity-80 list-disc pl-3">
                          <li>Accepted formats: JPEG, JPG, PNG</li>
                          <li>Optimal Resolution: 512 x 512 px</li>
                          <li>Transparent background preferred</li>
                          <li>Max file size: 2MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="h-full flex flex-col">
                    <label className={`flex-1 flex flex-col items-center justify-center border-4 border-dashed rounded-[3rem] transition-all cursor-pointer group ${
                      formData.logo ? 'bg-slate-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50'
                    }`}>
                      <input type="file" className="hidden" accept=".jpeg,.jpg,.png" onChange={handleFileChange} />
                      
                      {formData.logo ? (
                        <div className="flex flex-col items-center p-8 text-center animate-in zoom-in duration-300">
                          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100 mb-4 border border-indigo-50 relative">
                            <ImageIcon size={40} />
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full border-4 border-white">
                              <Check size={12} />
                            </div>
                          </div>
                          <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{formData.logo.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ready for upload</p>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setFormData({...formData, logo: null}); }}
                            className="mt-6 text-xs font-bold text-red-500 hover:underline"
                          >
                            Remove and Replace
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center p-12 text-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all mb-6">
                            <ImageIcon size={32} />
                          </div>
                          <p className="font-bold text-slate-900 text-lg">Click to Upload Logo</p>
                          <p className="text-sm text-slate-500 mt-2 max-w-[180px]">Drag and drop or click to browse files</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Info size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px]">
                    Provisioning involves regional database setup and key vault isolation. Process time: ~5-6 mins.
                  </p>
                </div>
                
                <button 
                  onClick={handleOnboard}
                  disabled={!formData.name || isProcessing}
                  className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-4"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {isProcessing ? 'Onboarding Provisioned...' : (editingId ? 'Update & Confirm' : 'Onboard & Confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantOnboardingView;