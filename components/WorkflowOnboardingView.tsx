import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  PlusCircle, 
  Copy, 
  ArrowRight, 
  Search, 
  ChevronDown, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Building, 
  TestTube, 
  Zap, 
  Info,
  ShieldCheck,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  Settings,
  AlertCircle,
  RefreshCw,
  FileText,
  X,
  Edit2,
  ListPlus,
  Type,
  Calendar,
  Hash,
  Activity,
  ToggleLeft,
  Pencil
} from 'lucide-react';
import { BASE_TENANTS, WORKFLOW_SKUS } from '../constants_data';

interface ConfigField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'status' | 'boolean';
}

interface WorkflowInstance {
  id: string;
  name: string;
  type: string;
  tenant: string;
  env: 'QA' | 'Prod';
  lastUpdated: string;
  isArchived?: boolean;
  fields?: ConfigField[];
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <Type size={14} /> },
  { value: 'number', label: 'Number', icon: <Hash size={14} /> },
  { value: 'date', label: 'Date', icon: <Calendar size={14} /> },
  { value: 'status', label: 'Status', icon: <Activity size={14} /> },
  { value: 'boolean', label: 'Boolean', icon: <ToggleLeft size={14} /> },
];

const MOCK_WORKFLOWS: WorkflowInstance[] = [
  { id: 'w1', name: 'LHC-O2I-Primary', type: 'O2I', tenant: 'LHC', env: 'QA', lastUpdated: '2 hours ago' },
  { id: 'w2', name: 'Wellsky-RCD-Beta', type: 'RCD', tenant: 'Wellsky', env: 'QA', lastUpdated: '5 hours ago' },
  { id: 'w3', name: 'E5-Eligibility-Main', type: 'Eligibility', tenant: 'Element 5', env: 'Prod', lastUpdated: '1 day ago' },
  { id: 'w4', name: 'Viview-Auth-V2', type: 'Authorizations', tenant: 'Viview', env: 'Prod', lastUpdated: '3 days ago' },
];

const WorkflowOnboardingView: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'replicate' | 'create'>('list');
  const [viewFilter, setViewFilter] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>(MOCK_WORKFLOWS);

  // Replication State
  const [sourceTenant, setSourceTenant] = useState('');
  const [sourceWorkflowId, setSourceWorkflowId] = useState('');
  const [sourceEnv, setSourceEnv] = useState<'QA' | 'Prod'>('QA');
  const [targetEnv, setTargetEnv] = useState<'QA' | 'Prod'>('Prod');
  const [targetTenant, setTargetTenant] = useState('');
  const [targetDisplayName, setTargetDisplayName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Manual Creation State
  const [newWfName, setNewWfName] = useState('');
  const [newWfType, setNewWfType] = useState(WORKFLOW_SKUS[0]);
  const [customWfType, setCustomWfType] = useState('');
  const [newWfTenant, setNewWfTenant] = useState('');
  const [newWfEnv, setNewWfEnv] = useState<'QA' | 'Prod'>('QA');
  const [newFields, setNewFields] = useState<ConfigField[]>([{ id: '1', name: '', type: 'text' }]);

  // Editing state for existing workflows
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowInstance | null>(null);

  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter(w => viewFilter === 'active' ? !w.isArchived : w.isArchived)
      .filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        w.tenant.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, workflows, viewFilter]);

  const sourceWorkflows = useMemo(() => {
    return workflows.filter(w => w.tenant === sourceTenant && w.env === sourceEnv && !w.isArchived);
  }, [sourceTenant, sourceEnv, workflows]);

  const handleReplicate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sourceWf = workflows.find(w => w.id === sourceWorkflowId);
      if (sourceWf) {
        const newWf: WorkflowInstance = {
          ...sourceWf,
          id: `w-${Date.now()}`,
          name: targetDisplayName || `${sourceWf.name} (Replicated)`,
          tenant: targetTenant || sourceTenant,
          env: targetEnv,
          lastUpdated: 'Just now'
        };
        setWorkflows([newWf, ...workflows]);
      }
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveView('list');
        resetReplicationForm();
      }, 2000);
    }, 2000);
  };

  const handleManualCreate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const finalType = newWfType === 'Others' ? customWfType || 'OTHER' : newWfType;
      const newWf: WorkflowInstance = {
        id: `w-${Date.now()}`,
        name: newWfName,
        type: finalType,
        tenant: newWfTenant,
        env: newWfEnv,
        lastUpdated: 'Just now',
        fields: newFields.filter(f => f.name.trim() !== '')
      };
      setWorkflows([newWf, ...workflows]);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveView('list');
        resetCreateForm();
      }, 2000);
    }, 1500);
  };

  const resetReplicationForm = () => {
    setSourceTenant('');
    setSourceWorkflowId('');
    setSourceEnv('QA');
    setTargetEnv('Prod');
    setTargetTenant('');
    setTargetDisplayName('');
  };

  const resetCreateForm = () => {
    setNewWfName('');
    setNewWfType(WORKFLOW_SKUS[0]);
    setCustomWfType('');
    setNewWfTenant('');
    setNewWfEnv('QA');
    setNewFields([{ id: '1', name: '', type: 'text' }]);
  };

  const addField = () => {
    setNewFields([...newFields, { id: Date.now().toString(), name: '', type: 'text' }]);
  };

  const removeField = (id: string) => {
    if (newFields.length > 1) {
      setNewFields(newFields.filter(f => f.id !== id));
    }
  };

  const updateField = (id: string, updates: Partial<ConfigField>) => {
    setNewFields(newFields.map(f => {
      if (f.id === id) {
        let name = updates.name !== undefined ? updates.name.toUpperCase() : f.name;
        return { ...f, ...updates, name };
      }
      return f;
    }));
  };

  const handleUpdateName = (id: string, newName: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    setEditingWorkflow(null);
  };

  const handleArchive = (id: string) => {
    if (window.confirm("Archive this configuration? It will be moved to the 'Archived' view.")) {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isArchived: true } : w));
    }
  };

  const handleUnarchive = (id: string) => {
    if (window.confirm("Restore this configuration to the active list?")) {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isArchived: false } : w));
    }
  };

  const RenameModal = ({ workflow, onClose }: { workflow: WorkflowInstance, onClose: () => void }) => {
    const [newName, setNewName] = useState(workflow.name);
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Settings size={20} /></div>
              <h3 className="font-bold text-slate-900 text-xl tracking-tight">Manage Configuration</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Display Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
               <button 
                 onClick={() => {
                   if (workflow.isArchived) handleUnarchive(workflow.id);
                   else handleArchive(workflow.id);
                   onClose();
                 }}
                 className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                   workflow.isArchived 
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200' 
                    : 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-200'
                 }`}
               >
                 {workflow.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                 {workflow.isArchived ? 'Restore to Active List' : 'Archive this Workflow'}
               </button>
            </div>
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-white border border-slate-200 bg-slate-50">Cancel</button>
            <button onClick={() => handleUpdateName(workflow.id, newName)} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">Save Changes</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => { setActiveView('list'); resetCreateForm(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Define New Workflow Configuration</h2>
          <p className="text-sm text-slate-500">Manually onboard a new workflow schema and configuration fields.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Entity Details</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Workflow Name</label>
              <input 
                type="text" 
                value={newWfName}
                onChange={(e) => setNewWfName(e.target.value)}
                placeholder="e.g. O2I_PRIMARY_SYNC"
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Workflow Type (SKU)</label>
              <div className="space-y-3">
                <div className="relative">
                  <select 
                    value={newWfType}
                    onChange={(e) => setNewWfType(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl appearance-none font-bold text-slate-800 outline-none focus:border-blue-400 transition-all cursor-pointer"
                  >
                    {WORKFLOW_SKUS.map(sku => <option key={sku} value={sku}>{sku}</option>)}
                    <option value="Others">Others</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
                
                {newWfType === 'Others' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={customWfType}
                        onChange={(e) => setCustomWfType(e.target.value)}
                        placeholder="Type new workflow SKU..."
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-blue-100 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-400 transition-all"
                      />
                      <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Tenant</label>
              <div className="relative">
                <select 
                  value={newWfTenant}
                  onChange={(e) => setNewWfTenant(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl appearance-none font-bold text-slate-800 outline-none focus:border-blue-400 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Tenant</option>
                  {BASE_TENANTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Environment</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setNewWfEnv('QA')} className={`py-2 rounded-lg text-xs font-bold transition-all ${newWfEnv === 'QA' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>QA</button>
                <button onClick={() => setNewWfEnv('Prod')} className={`py-2 rounded-lg text-xs font-bold transition-all ${newWfEnv === 'Prod' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Prod</button>
              </div>
            </div>
          </div>
        </div>

        {/* Fields Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <ListPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Schema Configuration</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Define custom data fields</p>
                </div>
              </div>
              <button 
                onClick={addField}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95"
              >
                <PlusCircle size={16} /> Add Field
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2">
              {newFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Field Name (ALL CAPS)</label>
                    <input 
                      type="text" 
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      placeholder="e.g. CUSTOMER_ID"
                      className="w-full bg-transparent font-bold text-slate-800 outline-none border-b-2 border-slate-200 focus:border-indigo-500 transition-colors py-1"
                    />
                  </div>
                  <div className="w-48 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Data Type</label>
                    <div className="relative">
                      <select 
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-700 appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-50"
                      >
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeField(field.id)}
                    className="mt-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    disabled={newFields.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleManualCreate}
                disabled={!newWfName || !newWfTenant || (newWfType === 'Others' && !customWfType) || isProcessing}
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                {isProcessing ? 'Onboarding Config...' : 'Confirm & Onboard'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 z-[100]">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold">Onboarding Successful</p>
            <p className="text-xs opacity-90">The new workflow has been configured and onboarded.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderReplicationForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => { setActiveView('list'); resetReplicationForm(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Replicate Workflow Configuration</h2>
          <p className="text-sm text-slate-500">Clone and deploy workflow settings across tenants and environments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Configuration */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <RefreshCw size={120} />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Search size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Source Configuration</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Source Organization (Tenant)</label>
              <div className="relative group">
                <select 
                  value={sourceTenant} 
                  onChange={(e) => { setSourceTenant(e.target.value); setSourceWorkflowId(''); }}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm cursor-pointer hover:border-indigo-300"
                >
                  <option value="" disabled>Choose Source Tenant</option>
                  {BASE_TENANTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Source Environment</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button onClick={() => setSourceEnv('QA')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${sourceEnv === 'QA' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-400 hover:text-slate-600'}`}>
                  <TestTube size={16} /> QA Environment
                </button>
                <button onClick={() => setSourceEnv('Prod')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${sourceEnv === 'Prod' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Zap size={16} /> Production
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Configuration to Copy</label>
              <div className="relative group">
                <select 
                  value={sourceWorkflowId} 
                  disabled={!sourceTenant}
                  onChange={(e) => {
                    setSourceWorkflowId(e.target.value);
                    const selected = workflows.find(w => w.id === e.target.value);
                    if (selected) {
                      setTargetDisplayName(`${selected.name} (Copy)`);
                    }
                  }}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-300"
                >
                  <option value="" disabled>Choose Workflow Configuration</option>
                  {sourceWorkflows.map(wf => <option key={wf.id} value={wf.id}>{wf.name} ({wf.type})</option>)}
                  {sourceTenant && sourceWorkflows.length === 0 && <option disabled>No configurations found in this environment</option>}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Target Configuration */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ArrowRight size={120} />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Building size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Target Configuration</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Organization (Tenant)</label>
              <div className="relative group">
                <select 
                  value={targetTenant} 
                  onChange={(e) => setTargetTenant(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm cursor-pointer hover:border-blue-300"
                >
                  <option value="">Replicate to same Tenant ({sourceTenant || 'None'})</option>
                  {BASE_TENANTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-600 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Workflow Display Name</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={targetDisplayName}
                  onChange={(e) => setTargetDisplayName(e.target.value)}
                  placeholder="Enter custom workflow name..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm hover:border-blue-300"
                />
                <FileText className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold ml-1">The name assigned to the new workflow instance.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Environment</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button onClick={() => setTargetEnv('QA')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${targetEnv === 'QA' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  <TestTube size={16} /> QA Environment
                </button>
                <button onClick={() => setTargetEnv('Prod')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${targetEnv === 'Prod' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Zap size={16} /> Production
                </button>
              </div>
            </div>

            {sourceEnv === 'QA' && targetEnv === 'Prod' && (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertCircle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Config Promotion Warning</p>
                  <p className="text-xs text-amber-700 leading-relaxed mt-0.5">Moving configuration from QA to Prod requires manual verification of credentials and endpoints. Review the summary before onboarding.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
            <Check size={24} />
          </div>
          <div>
            <p className="font-bold text-slate-900">Configuration Ready</p>
            <p className="text-xs text-slate-500 font-medium">Verified source and target parameters. Ready for onboarding.</p>
          </div>
        </div>
        <button 
          onClick={handleReplicate}
          disabled={!sourceWorkflowId || isProcessing}
          className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          {isProcessing ? 'Onboarding Config...' : 'Confirm & Onboard'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 z-[100]">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold">Onboarding Successful</p>
            <p className="text-xs opacity-90">Configuration has been replicated and onboarded to the target environment.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      {activeView === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Workflow Configuration</h1>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed">Manage settings, variables, and replication for enterprise workflow instances.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('replicate')}
                className="flex items-center gap-3 px-6 py-4 border-2 border-indigo-100 text-indigo-700 bg-white rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95"
              >
                <Copy size={20} />
                Replicate Configuration
              </button>
              <button 
                onClick={() => setActiveView('create')}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <PlusCircle size={20} />
                New Configuration
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filter configurations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl transition-all outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 shadow-sm"
                  />
                </div>
                
                {/* View Switcher */}
                <div className="flex items-center bg-slate-200/60 p-1 rounded-xl w-full md:w-auto">
                  <button 
                    onClick={() => setViewFilter('active')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewFilter === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setViewFilter('archived')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewFilter === 'archived' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Archived
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredWorkflows.length} {viewFilter === 'active' ? 'Active' : 'Archived'} Configs</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Configuration Name</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Organization</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Env</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredWorkflows.length > 0 ? filteredWorkflows.map((wf) => (
                    <tr key={wf.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${wf.isArchived ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                            <GitBranch size={20} />
                          </div>
                          <div>
                            <p className={`font-bold ${wf.isArchived ? 'text-slate-400 italic' : 'text-slate-900'}`}>{wf.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Last Sync: {wf.lastUpdated}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${wf.isArchived ? 'bg-slate-50 text-slate-400 border border-slate-100' : 'bg-slate-100 text-slate-600'}`}>
                          {wf.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`font-semibold ${wf.isArchived ? 'text-slate-400' : 'text-slate-700'}`}>{wf.tenant}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                          wf.isArchived ? 'bg-slate-50 text-slate-400 border-slate-100' :
                          wf.env === 'QA' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {wf.env}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          {!wf.isArchived ? (
                            <>
                              <button onClick={() => setEditingWorkflow(wf)} title="Manage Config" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                              <button onClick={() => handleArchive(wf.id)} title="Archive Workflow" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Archive size={18} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingWorkflow(wf)} title="Manage Config" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                              <button onClick={() => handleUnarchive(wf.id)} title="Restore Configuration" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><ArchiveRestore size={18} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium italic">
                        No {viewFilter} configurations found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {editingWorkflow && <RenameModal workflow={editingWorkflow} onClose={() => setEditingWorkflow(null)} />}
        </>
      ) : activeView === 'replicate' ? renderReplicationForm() : renderCreateForm()}
    </div>
  );
};

export default WorkflowOnboardingView;
