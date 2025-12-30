import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  FileText, 
  TestTube, 
  Zap, 
  Building,
  ChevronDown,
  LayoutGrid,
  Search,
  Filter,
  MoreVertical,
  ArrowLeft,
  Download,
  Mail,
  Shield,
  Info,
  PlusCircle,
  RotateCcw,
  Eye,
  X,
  Code,
  Check,
  Send,
  UserCheck,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  Terminal,
  UserCog,
  Lock,
  Workflow as WorkflowIcon,
  Layout as LayoutIcon,
  Database,
  ShieldAlert,
  Cpu
} from 'lucide-react';

const GLOBAL_ADMIN_TENANT = 'Element 5';

const BASE_TENANTS = [
  'Element 5',
  'LHC',
  'Wellsky',
  'Centerwell',
  'Viview',
  'Global/Admins',
  'Knute Nelson',
  'Pinnacle',
  'Mays'
];

const WORKFLOW_SKUS = ['O2I', 'RCD', 'Notifications', 'Authorizations', 'Eligibility'];
const DASHBOARDS = ['Overview Dashboard (default)', 'Analytics Dashboard', 'Reporting Dashboard', 'User Management Dashboard', 'O2I Dashboard', 'RCD Dashboard'];

interface RoleDetails {
  id: string;
  name: string;
  description: string;
  tenants: string[];
  workflows: string[];
  dashboards: string[];
  vaultAccess: boolean;
  isNeos: boolean;
  policy: string;
}

const INITIAL_POLICIES_MOCK: Record<string, any> = {
  'LHC_O2I_Standard_Policy': {
    "tenant": "LHC",
    "conditions": [
      { "fieldName": "Branch Id", "operator": "In", "values": ["LHC-B1", "LHC-B2"] },
      { "fieldName": "WorkflowState", "operator": "Equals", "values": ["Authorized"] }
    ]
  },
  'SuperAdmin_Global_Policy': {
    "tenant": "Element 5",
    "conditions": [
      { "fieldName": "TenantAccess", "operator": "In", "values": ["*"] },
      { "fieldName": "AdminPrivileges", "operator": "Boolean", "values": [true] }
    ]
  },
  'Data_Analytics_Standard': {
    "tenant": "Global/Admins",
    "conditions": [
      { "fieldName": "ViewType", "operator": "In", "values": ["Aggregate", "DeIdentified"] }
    ]
  },
  'Wellsky_Security_Basic': {
    "tenant": "Wellsky",
    "conditions": [
      { "fieldName": "LogRetention", "operator": "GreaterThan", "values": ["90Days"] }
    ]
  },
  'NA': { "tenant": "All", "message": "No specific policy conditions applied." }
};

const INITIAL_ROLES: RoleDetails[] = [
  {
    id: 'r1',
    name: 'LHC O2I Workflow User',
    description: 'This user has access to LHC O2I workflow and limited dashboard functionalities.',
    tenants: ['LHC'],
    workflows: ['O2I'],
    dashboards: ['Overview Dashboard', 'O2I Dashboard'],
    vaultAccess: false,
    isNeos: false,
    policy: 'LHC_O2I_Standard_Policy'
  },
  {
    id: 'r2',
    name: 'LHC Admin',
    description: 'This user has access to all workflows, dashboards and vault resources for the LHC organization.',
    tenants: ['LHC'],
    workflows: ['O2I', 'RCD', 'Notifications', 'Authorizations', 'Eligibility'],
    dashboards: ['Overview Dashboard', 'Analytics Dashboard', 'Reporting Dashboard', 'User Management Dashboard', 'O2I Dashboard'],
    vaultAccess: true,
    isNeos: true,
    policy: 'SuperAdmin_Global_Policy'
  },
  {
    id: 'r3',
    name: 'E5 Systems Engineer',
    description: 'Global access for Element 5 infrastructure management.',
    tenants: ['Element 5'],
    workflows: ['O2I', 'RCD'],
    dashboards: ['Overview Dashboard (default)'],
    vaultAccess: true,
    isNeos: true,
    policy: 'SuperAdmin_Global_Policy'
  },
  {
    id: 'r4',
    name: 'LHC Neos User',
    description: 'Specialized role for LHC NEOS users with integrated automation and notification capabilities.',
    tenants: ['LHC'],
    workflows: ['O2I', 'Notifications'],
    dashboards: ['Overview Dashboard', 'O2I Dashboard'],
    vaultAccess: false,
    isNeos: true,
    policy: 'LHC_O2I_Standard_Policy'
  }
];

interface UserData {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'Active' | 'Inactive' | 'Pending';
  tenant: string;
}

const INITIAL_USERS: UserData[] = [
  { id: '1', name: 'James Wilson', email: 'j.wilson@element5.ai', roles: ['E5 Systems Engineer'], status: 'Active', tenant: 'Element 5' },
  { id: '2', name: 'Maria Rodriguez', email: 'm.rodriguez@lhc.org', roles: ['LHC Admin'], status: 'Active', tenant: 'LHC' },
  { id: '3', name: 'Kevin Hart', email: 'k.hart@wellsky.com', roles: ['LHC O2I Workflow User'], status: 'Active', tenant: 'Wellsky' },
];

const MultiSelectDropdown: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}> = ({ label, options, selected, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl transition-all text-sm font-medium ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-sm'
        }`}
      >
        <span className={selected.length ? 'text-slate-800 truncate mr-2 font-bold' : 'text-slate-400'}>
          {selected.length ? `${selected.length} Selected` : placeholder}
        </span>
        {disabled ? <Lock size={14} className="text-slate-400" /> : <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-sm font-semibold border-b border-slate-50"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.length === options.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                {selected.length === options.length && <Check size={12} className="text-white" />}
              </div>
              Select All ({options.length})
            </button>
            {filteredOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleOption(opt)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-sm font-medium"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                  {selected.includes(opt) && <Check size={12} className="text-white" />}
                </div>
                <span className={opt.includes('(default)') ? 'font-bold text-orange-600' : ''}>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const UserOnboardingView: React.FC = () => {
  const [env, setEnv] = useState<'QA' | 'Prod'>('QA');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  
  const [userList, setUserList] = useState<UserData[]>(INITIAL_USERS);
  const [roleList, setRoleList] = useState<RoleDetails[]>(INITIAL_ROLES);
  const [policies, setPolicies] = useState<Record<string, any>>(INITIAL_POLICIES_MOCK);
  
  const [editingRole, setEditingRole] = useState<RoleDetails | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [viewingPolicyData, setViewingPolicyData] = useState<{data: any, name: string} | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<{name: string, data: any} | null>(null);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState<UserData | null>(null);

  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [emailInputs, setEmailInputs] = useState<string>('');
  const [targetTenantForOnboard, setTargetTenantForOnboard] = useState<string>('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const isGlobalAdmin = selectedTenant === GLOBAL_ADMIN_TENANT;

  useEffect(() => {
    if (!isGlobalAdmin) {
      setTargetTenantForOnboard(selectedTenant);
    } else {
      setTargetTenantForOnboard('');
    }
  }, [selectedTenant, isGlobalAdmin]);

  const filteredUsers = useMemo(() => {
    return userList.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      if (isGlobalAdmin) return matchesSearch;
      return user.tenant === selectedTenant && matchesSearch;
    });
  }, [selectedTenant, searchQuery, userList, isGlobalAdmin]);

  const filteredRoles = useMemo(() => {
    return roleList.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                            role.description.toLowerCase().includes(roleSearchQuery.toLowerCase());
      if (isGlobalAdmin) return matchesSearch;
      return (role.tenants.includes(selectedTenant) || role.tenants.includes('All')) && matchesSearch;
    });
  }, [roleSearchQuery, roleList, isGlobalAdmin, selectedTenant]);

  const filteredPolicies = useMemo(() => {
    const names = Object.keys(policies);
    return names.filter(name => {
      const matchesSearch = name.toLowerCase().includes(policySearchQuery.toLowerCase());
      if (isGlobalAdmin) return matchesSearch;
      return (policies[name].tenant === selectedTenant || policies[name].tenant === 'All') && matchesSearch;
    });
  }, [policySearchQuery, policies, isGlobalAdmin, selectedTenant]);

  const parsedEmails = useMemo(() => {
    return emailInputs
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));
  }, [emailInputs]);

  const handleResetOnboarding = () => {
    setSelectedRoleNames([]);
    setEmailInputs('');
    if (isGlobalAdmin) setTargetTenantForOnboard('');
    setIsPreviewing(false);
    setDeploySuccess(false);
  };

  const handleConfirmOnboarding = () => {
    setIsDeploying(true);
    setTimeout(() => {
      const newUsers: UserData[] = parsedEmails.map((email, index) => ({
        id: Date.now().toString() + index,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1).split('.')[0],
        email: email,
        roles: selectedRoleNames,
        status: 'Pending',
        tenant: targetTenantForOnboard
      }));

      setUserList(prev => [...prev, ...newUsers]);
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => {
        setIsPreviewing(false);
        setDeploySuccess(false);
        setActiveOperation('view');
        handleResetOnboarding();
      }, 3000);
    }, 2000);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Delete this user?")) {
      setUserList(prev => prev.filter(u => u.id !== id));
    }
  };

  const UpdateUserRoleModal = ({ user, onClose }: { user: UserData, onClose: () => void }) => {
    const [selectedRoles, setSelectedRoles] = useState(user.roles);
    
    const handleSave = () => {
      setUserList(prev => prev.map(u => 
        u.id === user.id ? { ...u, roles: selectedRoles } : u
      ));
      onClose();
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><UserCog size={20} /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">Modify Roles</h3>
                <p className="text-slate-500 text-xs">User: {user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
          </div>
          <div className="p-8">
            <MultiSelectDropdown 
              label="Assigned Roles" 
              options={filteredRoles.map(r => r.name)} 
              selected={selectedRoles} 
              onChange={setSelectedRoles} 
              placeholder="Select roles..." 
            />
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold rounded-xl hover:bg-white border border-slate-200 bg-slate-50">Cancel</button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">Update Context</button>
          </div>
        </div>
      </div>
    );
  };

  const RoleModal = ({ role, isNew, onClose, onSave }: { role?: RoleDetails, isNew?: boolean, onClose: () => void, onSave: (updated: RoleDetails) => void }) => {
    const [formData, setFormData] = useState<RoleDetails>(role || {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      tenants: isGlobalAdmin ? [] : [selectedTenant],
      workflows: [],
      dashboards: ['Overview Dashboard (default)'],
      vaultAccess: true,
      isNeos: false,
      policy: 'NA'
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-2xl tracking-tight">{isNew ? 'Define New Role' : 'Edit Role'}</h3>
              <p className="text-slate-500 text-sm">Target Organization: <span className="font-bold text-indigo-600">{isGlobalAdmin ? 'All' : selectedTenant}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
          </div>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <input type="text" placeholder="Role Identifier" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none shadow-sm" />
              <textarea placeholder="Purpose & Scope Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none resize-none shadow-sm" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border-2 border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Vault Access</span>
                  </div>
                  <input type="checkbox" checked={formData.vaultAccess} onChange={e => setFormData({...formData, vaultAccess: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-indigo-600" />
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border-2 border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Neos - User</span>
                  </div>
                  <input type="checkbox" checked={formData.isNeos} onChange={e => setFormData({...formData, isNeos: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Security Policy</label>
                <div className="relative group">
                  <select 
                    value={formData.policy} 
                    onChange={(e) => setFormData({...formData, policy: e.target.value})} 
                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                  >
                    <option value="NA">No Policy (NA)</option>
                    {Object.keys(policies).filter(k => k !== 'NA').map(pName => (
                      <option key={pName} value={pName}>{pName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <MultiSelectDropdown label="Assign to Tenants" options={BASE_TENANTS} selected={formData.tenants} onChange={vals => setFormData({...formData, tenants: vals})} placeholder="Select tenants..." disabled={!isGlobalAdmin} />
              <MultiSelectDropdown label="Workflow Permissions" options={WORKFLOW_SKUS} selected={formData.workflows} onChange={vals => setFormData({...formData, workflows: vals})} placeholder="Workflows..." />
              <MultiSelectDropdown label="Dashboard Access" options={DASHBOARDS} selected={formData.dashboards} onChange={vals => setFormData({...formData, dashboards: vals})} placeholder="Dashboards..." />
            </div>
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold">Discard</button>
            <button onClick={() => onSave(formData)} disabled={!formData.name} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50">Commit Role</button>
          </div>
        </div>
      </div>
    );
  };

  const renderManageRoles = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveOperation(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
          <div><h2 className="text-2xl font-bold text-slate-900">RBAC Configuration</h2><p className="text-sm text-slate-500">Context: <span className="text-indigo-600 font-semibold">{selectedTenant}</span></p></div>
        </div>
        <button onClick={() => setIsCreatingRole(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all"><PlusCircle size={20} /> Define Role</button>
      </div>
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100"><div className="relative max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Filter roles..." value={roleSearchQuery} onChange={(e) => setRoleSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none focus:ring-4 focus:ring-indigo-50" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role Name</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Policy</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Capabilities</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Flags</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6"><span className="font-bold text-slate-900 text-sm">{role.name}</span></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{role.policy}</span>
                      {role.policy !== 'NA' && (
                        <button onClick={() => setViewingPolicyData({name: role.policy, data: policies[role.policy]})} className="p-1 text-slate-400 hover:text-indigo-600">
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {role.workflows.slice(0, 3).map(w => <span key={w} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{w}</span>)}
                      {role.workflows.length > 3 && <span className="text-[10px] text-slate-400">+{role.workflows.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <div title="Vault Access" className={`p-1.5 rounded-lg ${role.vaultAccess ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-300'}`}><Database size={14} /></div>
                      <div title="Neos User" className={`p-1.5 rounded-lg ${role.isNeos ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}><Cpu size={14} /></div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingRole(role)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                      <button onClick={() => { if (window.confirm('Delete role?')) setRoleList(prev => prev.filter(r => r.id !== role.id)); }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {(editingRole || isCreatingRole) && <RoleModal role={editingRole || undefined} isNew={isCreatingRole} onClose={() => { setEditingRole(null); setIsCreatingRole(false); }} onSave={(updated) => { if (isCreatingRole) setRoleList(prev => [...prev, updated]); else setRoleList(prev => prev.map(r => r.id === updated.id ? updated : r)); setEditingRole(null); setIsCreatingRole(false); }} />}
    </div>
  );

  const PolicyModal = ({ policy, isNew, onClose, onSave }: { policy?: {name: string, data: any} | null, isNew?: boolean, onClose: () => void, onSave: (name: string, data: any) => void }) => {
    const [name, setName] = useState(policy?.name || '');
    const [jsonStr, setJsonStr] = useState(JSON.stringify(policy?.data || { tenant: selectedTenant, conditions: [] }, null, 2));
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
      try {
        const data = JSON.parse(jsonStr);
        if (!name) throw new Error("Policy name is required");
        onSave(name, data);
      } catch (e: any) {
        setError(e.message);
      }
    };

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-2xl tracking-tight">{isNew ? 'Create Access Policy' : 'Modify Policy Logic'}</h3>
              <p className="text-sm text-slate-500">Advanced JSON Configuration</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy Identifier</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. My_Custom_Policy" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                disabled={!isNew}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logic Specification (JSON)</label>
              <textarea 
                value={jsonStr} 
                onChange={e => { setJsonStr(e.target.value); setError(null); }} 
                rows={12} 
                className="w-full p-6 bg-slate-900 text-emerald-400 font-mono text-sm rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:outline-none resize-none shadow-inner"
              />
              {error && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
            </div>
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl active:scale-95 shadow-lg">Save Policy</button>
          </div>
        </div>
      </div>
    );
  };

  const renderManagePolicies = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveOperation(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
          <div><h2 className="text-2xl font-bold text-slate-900">Policy Management</h2><p className="text-sm text-slate-500">Managing access logic for <span className="text-indigo-600 font-semibold">{selectedTenant}</span></p></div>
        </div>
        <button onClick={() => setIsCreatingPolicy(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-lg transition-all"><PlusCircle size={20} /> New Policy</button>
      </div>
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100"><div className="relative max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Filter policies..." value={policySearchQuery} onChange={(e) => setPolicySearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none focus:ring-4 focus:ring-indigo-50" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Policy Name</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scope</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPolicies.map((name) => {
                const policy = policies[name];
                return (
                  <tr key={name} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6"><span className="font-bold text-slate-900 text-sm">{name}</span></td>
                    <td className="px-8 py-6"><span className="text-xs font-semibold text-slate-500">{policy.tenant}</span></td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                           {policy.conditions?.length || 0} Conditions
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingPolicyData({name, data: policy})} className="p-2 text-slate-400 hover:text-indigo-600"><Eye size={18} /></button>
                        <button onClick={() => setEditingPolicy({name, data: policy})} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                        <button onClick={() => { if (window.confirm('Delete policy?')) { const newPol = {...policies}; delete newPol[name]; setPolicies(newPol); } }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {(editingPolicy || isCreatingPolicy) && (
        <PolicyModal 
          policy={editingPolicy} 
          isNew={isCreatingPolicy} 
          onClose={() => { setEditingPolicy(null); setIsCreatingPolicy(false); }} 
          onSave={(name, data) => {
            setPolicies(prev => ({...prev, [name]: data}));
            setEditingPolicy(null);
            setIsCreatingPolicy(false);
          }}
        />
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6"><button onClick={() => setIsPreviewing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button><div><h2 className="text-2xl font-bold text-slate-900">Confirm Provisioning</h2><p className="text-sm text-slate-500">Targeting organization: <span className="font-semibold text-indigo-600">{targetTenantForOnboard}</span></p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Security Access Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedRoleNames.map(roleName => {
                const r = roleList.find(x => x.name === roleName);
                if (!r) return null;
                return (
                  <div key={roleName} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">{r.name}</span>
                      <div className="flex gap-2">
                        {r.isNeos && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold tracking-tighter uppercase border border-emerald-200">NEOS</span>}
                        {r.vaultAccess && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold tracking-tighter uppercase border border-amber-200">VAULT</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <FileText size={12} /> Policy: <span className="text-indigo-600 font-mono">{r.policy}</span>
                      {r.policy !== 'NA' && (
                        <button onClick={() => setViewingPolicyData({name: r.policy, data: policies[r.policy]})} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                          <Eye size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{r.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {r.workflows.map(w => <span key={w} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-bold shadow-xs uppercase tracking-wider">{w}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Mail size={18} className="text-indigo-600" /> Pending Users</h3></div>
          <div className="p-8 space-y-4">{parsedEmails.map((e, i) => <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-xs"><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">{i+1}</div><span className="text-xs font-bold text-slate-700 truncate">{e}</span></div>)}</div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100"><button onClick={handleConfirmOnboarding} disabled={isDeploying} className="w-full flex items-center justify-center gap-3 py-4.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 disabled:opacity-50 hover:bg-indigo-700 transition-all">{isDeploying ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} /> Confirm and Onboard</>}</button></div>
        </div>
      </div>
    </div>
  );

  const renderCreateUserForm = () => {
    if (isPreviewing) return renderPreview();
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => setActiveOperation(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button><div><h2 className="text-2xl font-bold text-slate-900">Provision High-Scale Access</h2><p className="text-sm text-slate-500">Onboarding context: <span className="font-semibold text-indigo-600">{selectedTenant}</span></p></div></div>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <MultiSelectDropdown label="Assign System Roles" options={filteredRoles.map(r => r.name)} selected={selectedRoleNames} onChange={setSelectedRoleNames} placeholder="Choose access profiles..." />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Target Organization</label>
                <div className="relative group">
                  <select 
                    value={targetTenantForOnboard} 
                    onChange={(e) => setTargetTenantForOnboard(e.target.value)} 
                    disabled={!isGlobalAdmin} 
                    className={`w-full px-8 py-4.5 bg-white border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all shadow-sm ${!isGlobalAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white cursor-pointer group-hover:border-indigo-500'}`}
                  >
                    {!isGlobalAdmin ? <option value={selectedTenant}>{selectedTenant}</option> : <><option value="" disabled>Select target...</option>{BASE_TENANTS.map(tenant => <option key={tenant} value={tenant}>{tenant}</option>)}</>}</select><ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={20} /></div></div>
            </div>
            
            {selectedRoleNames.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-4 bg-slate-50/80 rounded-[2.5rem] border border-slate-200 p-10 space-y-8 shadow-inner">
                {selectedRoleNames.map(roleName => {
                  const r = roleList.find(x => x.name === roleName);
                  if (!r) return null;
                  return (
                    <div key={roleName} className="space-y-4 pb-8 border-b border-slate-200/50 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><ShieldCheck className="text-indigo-600" size={22} /><span className="text-lg font-bold text-slate-900">{r.name}</span></div>
                        <div className="flex gap-2">
                          {r.isNeos && <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold shadow-xs"><Cpu size={14}/> NEOS</div>}
                          {r.vaultAccess && <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-[10px] font-bold shadow-xs"><Database size={14}/> VAULT</div>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <FileText size={14} /> Security Policy: <span className="text-indigo-600 font-mono">{r.policy}</span>
                        {r.policy !== 'NA' && (
                          <button onClick={() => setViewingPolicyData({name: r.policy, data: policies[r.policy]})} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Eye size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-3xl">{r.description}</p>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                         {r.workflows.map(w => <span key={w} className="px-3 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-bold shadow-xs uppercase tracking-widest">{w}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-10 space-y-6"><h3 className="text-2xl font-bold text-slate-800 tracking-tight">Bulk Invitation List</h3><textarea value={emailInputs} onChange={(e) => setEmailInputs(e.target.value)} placeholder="Type user emails separated by commas..." className="w-full min-h-[160px] p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all resize-none font-medium placeholder:text-slate-400 outline-none shadow-inner" /></div>
          <div className="px-10 py-8 bg-slate-50/50 flex justify-end gap-3 items-center"><button onClick={handleResetOnboarding} className="px-8 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-slate-200 bg-slate-50 active:scale-95 transition-all"><RotateCcw size={18} /> Reset Form</button><button onClick={() => setIsPreviewing(true)} disabled={emailInputs.length === 0 || selectedRoleNames.length === 0 || !targetTenantForOnboard} className="px-12 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"><Eye size={18} /> Review & Onboard</button></div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-4"><button onClick={() => setActiveOperation(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button><div><h2 className="text-2xl font-bold text-slate-900">User Directory</h2><p className="text-sm text-slate-500">Managing identities for <span className="text-indigo-600 font-semibold">{isGlobalAdmin ? 'All Business Units' : selectedTenant}</span></p></div></div><div className="flex items-center gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Filter roster..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all shadow-sm w-full md:w-80 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400" /></div></div></div>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-slate-50/50 border-b border-slate-200"><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Identified User</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Access Profiles</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Org / Tenant</th><th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Mgmt</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">{user.name.charAt(0)}</div>
                      <div className="flex flex-col min-w-0"><span className="font-bold text-slate-900 truncate">{user.name}</span><span className="text-xs text-slate-400">{user.email}</span></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map(r => {
                        const isNeos = roleList.find(role => role.name === r)?.isNeos;
                        return (
                          <span key={r} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${isNeos ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {isNeos && <Cpu size={10} />} {r}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center"><span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold border border-slate-200">{user.tenant}</span></td>
                  <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingUserRole(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><UserCog size={18} /></button><button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button></div></td>
                </tr>
              )) : (<tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-medium italic">Roster is empty or filtered out.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {editingUserRole && <UpdateUserRoleModal user={editingUserRole} onClose={() => setEditingUserRole(null)} />}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl"><h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Identity Management</h1><p className="mt-3 text-slate-500 text-lg leading-relaxed">Enterprise-grade user provisioning and RBAC governance console.</p></div>
      {!activeOperation ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Service Environment</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <button onClick={() => setEnv('QA')} className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${env === 'QA' ? 'bg-white text-orange-600 shadow-md border border-orange-100' : 'text-slate-400 hover:text-slate-600'}`}><TestTube size={18} /> QA Sandbox</button>
                  <button onClick={() => setEnv('Prod')} className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${env === 'Prod' ? 'bg-white text-emerald-600 shadow-md border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}><Zap size={18} /> Production</button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Base Administrative Context</label>
                <div className="relative group">
                  <select 
                    value={selectedTenant} 
                    onChange={(e) => setSelectedTenant(e.target.value)} 
                    className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-800 cursor-pointer shadow-sm group-hover:border-indigo-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  >
                    <option value="" disabled>Select Organization Context</option>
                    {BASE_TENANTS.map(tenant => <option key={tenant} value={tenant}>{tenant}</option>)}
                  </select>
                  <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={22} />
                </div>
                {!isGlobalAdmin && selectedTenant && (
                  <div className="px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <Info size={18} className="text-indigo-500" />
                    <p className="text-xs text-indigo-700 font-bold tracking-tight">Access restricted to <span className="underline">{selectedTenant}</span> domain.</p>
                  </div>
                )}
              </div>
            </div>
            {selectedTenant && (
              <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 flex items-start gap-8 ${env === 'QA' ? 'bg-orange-50/50 border-orange-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <div className={`p-6 rounded-3xl bg-white shadow-xl flex items-center justify-center ${env === 'QA' ? 'text-orange-500' : 'text-emerald-500'}`}>{isGlobalAdmin ? <ShieldCheck size={44} /> : <Cpu size={44} />}</div>
                <div className="space-y-3">
                  <h3 className={`font-extrabold text-xl ${env === 'QA' ? 'text-orange-900' : 'text-emerald-900'}`}>{isGlobalAdmin ? 'Global Root Authority' : `${selectedTenant} Context Active`}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{isGlobalAdmin ? 'Operating with full organization-wide visibility. Cross-tenant provisioning enabled.' : `Identity management is currently scoped to ${selectedTenant}. Global resources are in read-only mode.`}</p>
                </div>
              </div>
            )}
          </div>
          <div className={`transition-all duration-500 transform ${selectedTenant ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-8"><LayoutGrid className="text-indigo-600" size={24} /><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Operations</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button onClick={() => setActiveOperation('view')} className="flex items-center gap-5 px-8 py-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-400 transition-all group shadow-sm text-left"><div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors"><Users size={28} className="text-slate-500 group-hover:text-indigo-600 transition-colors" /></div><div className="text-left"><span className="block font-bold text-slate-700 text-lg leading-tight">User Directory</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identities</span></div></button>
              <button onClick={() => setActiveOperation('create')} className="flex items-center gap-5 px-8 py-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-400 transition-all group shadow-sm text-left"><div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors"><UserPlus size={28} className="text-slate-500 group-hover:text-blue-600 transition-colors" /></div><div className="text-left"><span className="block font-bold text-slate-700 text-lg leading-tight">Onboard Users</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Provisioning</span></div></button>
              <button onClick={() => setActiveOperation('roles')} className="flex items-center gap-5 px-8 py-6 bg-[#1D8BFF] text-white rounded-3xl hover:bg-[#0074E8] transition-all group shadow-xl shadow-blue-100 text-left"><div className="p-3.5 bg-white/20 rounded-2xl"><ShieldCheck size={28} className="text-white" /></div><div className="text-left"><span className="block font-bold text-lg leading-tight">Role Engine</span><span className="text-[10px] text-blue-50 font-bold uppercase tracking-widest">RBAC / Neos</span></div></button>
              <button onClick={() => setActiveOperation('policies')} className="flex items-center gap-5 px-8 py-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all group shadow-xl text-left"><div className="p-3.5 bg-indigo-500 rounded-2xl"><FileText size={28} className="text-white" /></div><div className="text-left"><span className="block font-bold text-lg leading-tight">Policy Logic</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attribute Access</span></div></button>
            </div>
          </div>
        </>
      ) : activeOperation === 'view' ? renderResults() : activeOperation === 'create' ? renderCreateUserForm() : activeOperation === 'roles' ? renderManageRoles() : activeOperation === 'policies' ? renderManagePolicies() : null}
      {viewingPolicyData && <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300"><div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-900 text-xl">Policy: {viewingPolicyData.name}</h3><button onClick={() => setViewingPolicyData(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button></div><div className="p-8"><pre className="text-emerald-400 bg-slate-900 p-6 rounded-2xl font-mono text-sm overflow-auto max-h-[400px] shadow-inner">{JSON.stringify(viewingPolicyData.data, null, 2)}</pre></div></div></div>}
    </div>
  );
};

export default UserOnboardingView;
