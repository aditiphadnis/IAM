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
  Archive,
  ArchiveRestore,
  Trash2,
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
  Pencil,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Download,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Box,
  Share2,
  AlertCircle
} from 'lucide-react';
import { BASE_TENANTS } from '../constants_data';

interface ConfigField {
  id: string;
  name: string;
  type: string;
  showInGrid: boolean;
}

interface WorkflowItem {
  id: string;
  name: string;
  sku: string;
  tenant?: string; 
  env?: 'QA' | 'Prod';
  lastUpdated: string;
  isArchived?: boolean;
  fields: ConfigField[];
  isBlueprint: boolean;
  status: 'Success' | 'Failed' | 'Pending';
  failureMessage?: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <Type size={14} /> },
  { value: 'number', label: 'Number', icon: <Hash size={14} /> },
  { value: 'date', label: 'Date', icon: <Calendar size={14} /> },
  { value: 'status', label: 'Status', icon: <Activity size={14} /> },
  { value: 'boolean', label: 'Boolean', icon: <ToggleLeft size={14} /> },
  { value: 'file', label: 'Download File', icon: <Download size={14} /> },
];

const DEFAULT_SAMPLE_FIELDS: ConfigField[] = [
  { id: 'f1', name: 'TRANSACTION ID', type: 'text', showInGrid: false },
  { id: 'f2', name: 'FACILITY ID', type: 'text', showInGrid: true },
  { id: 'f3', name: 'BRANCH CODE', type: 'text', showInGrid: true },
  { id: 'f4', name: 'PATIENT NAME', type: 'text', showInGrid: true },
  { id: 'f5', name: 'MR NUMBER', type: 'text', showInGrid: true },
  { id: 'f6', name: 'EPISODE ID', type: 'text', showInGrid: true },
  { id: 'f7', name: 'CURRENT STAGE', type: 'text', showInGrid: true },
  { id: 'f8', name: 'CURRENT STATUS', type: 'text', showInGrid: true },
];

const MOCK_DATA: WorkflowItem[] = [
  // Global Config Blueprints (No Tenant/Env)
  { id: 'c1', name: 'Standard O2I Blueprint', sku: 'O2I', lastUpdated: '1 day ago', isBlueprint: true, fields: [...DEFAULT_SAMPLE_FIELDS], status: 'Success' },
  { id: 'c2', name: 'Enhanced RCD Template', sku: 'RCD', lastUpdated: '3 days ago', isBlueprint: true, fields: [...DEFAULT_SAMPLE_FIELDS], status: 'Success' },
  // Onboarded Workflow Instances
  { id: 'w1', name: 'LHC-O2I-Primary', sku: 'O2I', tenant: 'LHC', env: 'QA', lastUpdated: '2 hours ago', isBlueprint: false, fields: [...DEFAULT_SAMPLE_FIELDS], status: 'Success' },
  { id: 'w2', name: 'Wellsky-RCD-Beta', sku: 'RCD', tenant: 'Wellsky', env: 'QA', lastUpdated: '5 hours ago', isBlueprint: false, fields: [...DEFAULT_SAMPLE_FIELDS], status: 'Failed', failureMessage: 'Credential sync failed during environment handoff.' },
  { id: 'w3', name: 'E5-Eligibility-Main', sku: 'Eligibility', tenant: 'Element 5', env: 'Prod', lastUpdated: '1 day ago', isBlueprint: false, fields: [...DEFAULT_SAMPLE_FIELDS], status: 'Success' },
];

const WorkflowOnboardingView: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'replicate' | 'create'>('list');
  const [aspect, setAspect] = useState<'configs' | 'workflows'>('workflows');
  const [viewFilter, setViewFilter] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [items, setItems] = useState<WorkflowItem[]>(MOCK_DATA);

  // Replication State
  const [replicationSourceType, setReplicationSourceType] = useState<'workflow' | 'config'>('config');
  const [sourceTenant, setSourceTenant] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [sourceEnv, setSourceEnv] = useState<'QA' | 'Prod'>('QA');
  const [targetEnv, setTargetEnv] = useState<'QA' | 'Prod'>('Prod');
  const [targetTenant, setTargetTenant] = useState('');
  const [targetDisplayName, setTargetDisplayName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Manual Config Creation State
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigSku, setNewConfigSku] = useState('');
  const [newFields, setNewFields] = useState<ConfigField[]>(JSON.parse(JSON.stringify(DEFAULT_SAMPLE_FIELDS)));

  // Editing state
  const [editingItem, setEditingItem] = useState<WorkflowItem | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items
      .filter(w => viewFilter === 'active' ? !w.isArchived : w.isArchived)
      .filter(w => aspect === 'configs' ? w.isBlueprint : !w.isBlueprint)
      .filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        w.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.tenant && w.tenant.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [searchQuery, items, viewFilter, aspect]);

  const sourceOptions = useMemo(() => {
    if (replicationSourceType === 'config') {
      return items.filter(i => i.isBlueprint && !i.isArchived);
    }
    return items.filter(i => !i.isBlueprint && i.tenant === sourceTenant && i.env === sourceEnv && !i.isArchived);
  }, [replicationSourceType, sourceTenant, sourceEnv, items]);

  const handleReplicate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sourceItem = items.find(i => i.id === sourceId);
      if (sourceItem) {
        const newItem: WorkflowItem = {
          ...sourceItem,
          id: `w-${Date.now()}`,
          name: targetDisplayName || `${sourceItem.name} (Onboarded)`,
          tenant: targetTenant,
          env: targetEnv,
          isBlueprint: false, 
          lastUpdated: 'Just now',
          status: 'Success',
          fields: JSON.parse(JSON.stringify(sourceItem.fields))
        };
        setItems([newItem, ...items]);
      }
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveView('list');
        setAspect('workflows');
        resetReplicationForm();
      }, 2000);
    }, 2000);
  };

  const handleCreateConfig = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newItem: WorkflowItem = {
        id: `c-${Date.now()}`,
        name: newConfigName,
        sku: newConfigSku.toUpperCase(),
        isBlueprint: true,
        lastUpdated: 'Just now',
        status: 'Success',
        fields: newFields.filter(f => f.name.trim() !== '')
      };
      setItems([newItem, ...items]);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveView('list');
        setAspect('configs');
        resetCreateForm();
      }, 2000);
    }, 1500);
  };

  const resetReplicationForm = () => {
    setSourceTenant('');
    setSourceId('');
    setSourceEnv('QA');
    setTargetEnv('Prod');
    setTargetTenant('');
    setTargetDisplayName('');
  };

  const resetCreateForm = () => {
    setNewConfigName('');
    setNewConfigSku('');
    setNewFields(JSON.parse(JSON.stringify(DEFAULT_SAMPLE_FIELDS)));
  };

  const handleArchive = (id: string) => {
    if (window.confirm("Archive this item?")) {
      setItems(prev => prev.map(w => w.id === id ? { ...w, isArchived: true } : w));
    }
  };

  const handleUnarchive = (id: string) => {
    if (window.confirm("Restore this item?")) {
      setItems(prev => prev.map(w => w.id === id ? { ...w, isArchived: false } : w));
    }
  };

  const SchemaEditorModal = ({ item, onClose, onSave }: { item: WorkflowItem, onClose: () => void, onSave: (updated: WorkflowItem) => void }) => {
    const [localItem, setLocalItem] = useState<WorkflowItem>(JSON.parse(JSON.stringify(item)));

    const handleLocalUpdateField = (id: string, updates: Partial<ConfigField>) => {
      setLocalItem(prev => ({
        ...prev,
        fields: prev.fields.map(f => {
          if (f.id === id) {
            let name = updates.name !== undefined ? updates.name.toUpperCase() : f.name;
            return { ...f, ...updates, name };
          }
          return f;
        })
      }));
    };

    const handleLocalAddField = () => {
      setLocalItem(prev => ({
        ...prev,
        fields: [...prev.fields, { id: Date.now().toString(), name: '', type: 'text', showInGrid: true }]
      }));
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-300 border-t-8 border-indigo-600">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><Edit2 size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-2xl tracking-tight">Edit {item.isBlueprint ? 'Config Blueprint' : 'Workflow Instance'}</h3>
                <p className="text-slate-500 text-sm font-medium">Managing schema for <span className="text-indigo-600 font-bold">{localItem.name}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
          </div>
          
          <div className="p-10 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <ListPlus className="text-indigo-400" size={20} />
                <h4 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Active Fields ({localItem.fields.length})</h4>
              </div>
              <button onClick={handleLocalAddField} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95">
                <PlusCircle size={18} /> New Field
              </button>
            </div>

            <div className="space-y-3">
              {localItem.fields.map((field, idx) => (
                <div key={field.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${field.showInGrid ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                   <div className="flex flex-col gap-1">
                    <button onClick={() => {
                       const list = [...localItem.fields];
                       const [removed] = list.splice(idx, 1);
                       list.splice(idx - 1, 0, removed);
                       setLocalItem({...localItem, fields: list});
                    }} disabled={idx === 0} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-0"><ArrowUp size={14} /></button>
                    <button onClick={() => {
                       const list = [...localItem.fields];
                       const [removed] = list.splice(idx, 1);
                       list.splice(idx + 1, 0, removed);
                       setLocalItem({...localItem, fields: list});
                    }} disabled={idx === localItem.fields.length - 1} className="p-1 text-slate-300 hover:text-indigo-500 disabled:opacity-0"><ArrowDown size={14} /></button>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Column Name</label>
                    <input 
                      type="text" 
                      value={field.name}
                      onChange={(e) => handleLocalUpdateField(field.id, { name: e.target.value })}
                      className="w-full bg-transparent font-bold text-slate-800 outline-none border-b border-transparent focus:border-indigo-400 transition-colors py-1"
                    />
                  </div>

                  <div className="w-40 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Data Type</label>
                    <select 
                      value={field.type}
                      onChange={(e) => handleLocalUpdateField(field.id, { type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLocalUpdateField(field.id, { showInGrid: !field.showInGrid })}
                      className={`p-2.5 rounded-xl transition-all ${field.showInGrid ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-200'}`}
                    >
                      {field.showInGrid ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button 
                      onClick={() => setLocalItem({...localItem, fields: localItem.fields.filter(f => f.id !== field.id)})}
                      className="p-2.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
            <button onClick={onClose} className="px-8 py-3 text-slate-600 font-bold">Cancel</button>
            <button onClick={() => onSave(localItem)} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Save Changes</button>
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Define New Config Blueprint</h2>
          <p className="text-sm text-slate-500">Create a global configuration template for cross-tenant onboarding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Box size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Blueprint Details</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Config Name</label>
              <input 
                type="text" 
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="e.g. Master O2I Blueprint"
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">SKU Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={newConfigSku}
                  onChange={(e) => setNewConfigSku(e.target.value)}
                  placeholder="e.g. O2I, RCD, AUTH..."
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-400"
                />
                <Pencil className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs flex gap-3">
              <Info size={16} className="shrink-0" />
              <p className="font-medium">Config Blueprints are global templates and do not require tenant or environment mapping at this stage.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <ListPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Schema Fields</h3>
              </div>
              <button 
                onClick={() => setNewFields([...newFields, { id: Date.now().toString(), name: '', type: 'text', showInGrid: true }])}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
              >
                <PlusCircle size={16} /> Add Field
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2">
              {newFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Field Name</label>
                    <input 
                      type="text" 
                      value={field.name}
                      onChange={(e) => {
                        const list = [...newFields];
                        list[idx].name = e.target.value.toUpperCase();
                        setNewFields(list);
                      }}
                      placeholder="FIELD_NAME"
                      className="w-full bg-transparent font-bold text-slate-800 outline-none border-b-2 border-slate-200 focus:border-indigo-500 py-1"
                    />
                  </div>
                  <div className="w-48 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Type</label>
                    <select 
                      value={field.type}
                      onChange={(e) => {
                        const list = [...newFields];
                        list[idx].type = e.target.value;
                        setNewFields(list);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-700"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={() => setNewFields(newFields.filter(f => f.id !== field.id))}
                    className="mt-4 p-2 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleCreateConfig}
                disabled={!newConfigName || !newConfigSku || isProcessing}
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                {isProcessing ? 'Onboarding...' : 'Onboard Config Blueprint'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${aspect}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50"
            />
          </div>
          
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl w-full md:w-auto border border-slate-100">
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
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredItems.length} {aspect} detected</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {aspect === 'workflows' ? (
                <>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tenant</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workflow</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">SKU tag</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Env</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                </>
              ) : (
                <>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Blueprint Name</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">SKU</th>
                </>
              )}
              <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                {aspect === 'workflows' ? (
                  <>
                    <td className="px-8 py-6">
                      <span className="font-bold text-sm text-slate-700">{item.tenant}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-sm">
                          <GitBranch size={20} />
                        </div>
                        <div>
                          <p className={`font-bold ${item.isArchived ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Updated {item.lastUpdated}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border bg-slate-100 text-slate-600 border-slate-200">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm ${
                        item.env === 'QA' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {item.env}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border flex items-center gap-1.5 ${
                          item.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          item.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {item.status === 'Success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {item.status.toUpperCase()}
                        </span>
                        {item.failureMessage && (
                          <div className="group/msg relative">
                            <AlertCircle size={12} className="text-red-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed text-center">
                              {item.failureMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 text-violet-600 shadow-sm">
                          <Box size={20} />
                        </div>
                        <div>
                          <p className={`font-bold ${item.isArchived ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Updated {item.lastUpdated}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border bg-slate-100 text-slate-600 border-slate-200">
                        {item.sku}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditingItem(item); setIsSchemaModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                      <Edit2 size={18} />
                    </button>
                    {!item.isArchived ? (
                      <button onClick={() => handleArchive(item.id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-amber-100">
                        <Archive size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleUnarchive(item.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                        <ArchiveRestore size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={aspect === 'workflows' ? 6 : 3} className="px-8 py-20 text-center text-slate-500 font-medium italic">
                  No {aspect} found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReplicationForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => { setActiveView('list'); resetReplicationForm(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Replicate and Onboard Workflow</h2>
          <p className="text-sm text-slate-500">Provision a workflow to an organization from a global blueprint or existing instance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Share2 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Source Selection</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Replicate From</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={() => { setReplicationSourceType('config'); setSourceId(''); }} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${replicationSourceType === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  Config Blueprint
                </button>
                <button onClick={() => { setReplicationSourceType('workflow'); setSourceId(''); }} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${replicationSourceType === 'workflow' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  Existing Workflow
                </button>
              </div>
            </div>

            {replicationSourceType === 'workflow' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Source Organization</label>
                  <div className="relative group">
                    <select 
                      value={sourceTenant} 
                      onChange={(e) => { setSourceTenant(e.target.value); setSourceId(''); }}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>Choose Source Tenant</option>
                      {BASE_TENANTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Source Environment</label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={() => setSourceEnv('QA')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${sourceEnv === 'QA' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      <TestTube size={16} /> QA
                    </button>
                    <button onClick={() => setSourceEnv('Prod')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${sourceEnv === 'Prod' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-700'}`}>
                      <Zap size={16} /> Prod
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select {replicationSourceType === 'workflow' ? 'Workflow' : 'Blueprint'}</label>
              <div className="relative group">
                <select 
                  value={sourceId} 
                  onChange={(e) => {
                    setSourceId(e.target.value);
                    const selected = items.find(i => i.id === e.target.value);
                    if (selected) setTargetDisplayName(`${selected.name} (Onboarded)`);
                  }}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
                >
                  <option value="" disabled>Choose Source</option>
                  {sourceOptions.map(wf => <option key={wf.id} value={wf.id}>{wf.name} ({wf.sku})</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <Building size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Onboarding Destination</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Organization</label>
              <div className="relative group">
                <select 
                  value={targetTenant} 
                  onChange={(e) => setTargetTenant(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm cursor-pointer"
                >
                  <option value="" disabled>Select Target Tenant</option>
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
                  placeholder="e.g. Acme_O2I_Prod"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm"
                />
                <FileText className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Environment</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
                <button onClick={() => setTargetEnv('QA')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${targetEnv === 'QA' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  <TestTube size={16} /> QA
                </button>
                <button onClick={() => setTargetEnv('Prod')} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${targetEnv === 'Prod' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Zap size={16} /> Prod
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-indigo-600 border border-indigo-50">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-bold text-slate-900">Provisioning Ready</p>
            <p className="text-xs text-slate-500 font-medium">Verify all environmental variables before finalizing onboarding.</p>
          </div>
        </div>
        <button 
          onClick={handleReplicate}
          disabled={!sourceId || !targetTenant || isProcessing}
          className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {isProcessing ? 'Onboarding...' : 'Confirm & Onboard'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {activeView === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Workflow Onboarding</h1>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed font-medium">Provision tenant workflows and manage global configuration blueprints.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('replicate')}
                className="flex items-center gap-3 px-6 py-4 border-2 border-indigo-100 text-indigo-700 bg-white rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
              >
                <Share2 size={20} />
                Replicate
              </button>
              <button 
                onClick={() => setActiveView('create')}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <PlusCircle size={20} />
                New Config
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-200 mb-8">
            <button 
              onClick={() => { setAspect('workflows'); setSearchQuery(''); }}
              className={`pb-4 px-2 text-sm font-extrabold transition-all relative ${aspect === 'workflows' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                <GitBranch size={18} />
                Display Workflows
              </div>
              {aspect === 'workflows' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => { setAspect('configs'); setSearchQuery(''); }}
              className={`pb-4 px-2 text-sm font-extrabold transition-all relative ${aspect === 'configs' ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                <Box size={18} />
                Display Configs
              </div>
              {aspect === 'configs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-t-full" />}
            </button>
          </div>

          {renderGrid()}

          {isSchemaModalOpen && editingItem && <SchemaEditorModal item={editingItem} onClose={() => setIsSchemaModalOpen(false)} onSave={(updated) => { setItems(items.map(i => i.id === updated.id ? updated : i)); setIsSchemaModalOpen(false); setEditingItem(null); }} />}
        </>
      ) : activeView === 'replicate' ? renderReplicationForm() : renderCreateForm()}

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 z-[100]">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg">Onboarding Complete</p>
            <p className="text-sm opacity-90 font-medium">The workflow system has been onboarded successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowOnboardingView;