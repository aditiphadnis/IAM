import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Vault, 
  PlusCircle, 
  Search, 
  ChevronDown, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Info,
  Lock,
  Zap,
  ShieldCheck,
  Building2,
  Globe,
  Mail,
  Key,
  ShieldAlert,
  Calendar,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  KeyRound,
  Fingerprint,
  MailWarning,
  Server,
  FileText,
  Database,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  Save,
  Filter,
  X
} from 'lucide-react';
import { WORKFLOW_SKUS, BASE_TENANTS } from '../constants_data';

type EnvType = 'Test' | 'Prod';

interface CredentialInstance {
  id: string;
  resourceName: string;
  tenantName: string;
  username: string;
  workflows: string[];
  description: string;
  application: string;
  loginUrl: string;
  envs: EnvType[]; // Changed to support multiple environments
  mfaType: 'Yes' | 'No' | '2 Factor Auth';
  mfaApplication?: 'Auth0' | 'Google Authenticator';
  mfaSecretKey?: string;
  mfaEmailUsers?: string;
  passwordExpiryPeriod: string;
  expiryNotificationUsers: string;
  status: 'Success' | 'Failed' | 'Pending';
  failureMessage?: string;
  onboardedAt: string;
  modifiedBy: string;
  modifiedOn: string;
}

const APPLICATIONS = ['Palmetto', 'HCHB', 'Wellsky', 'Centerwell', 'Viview', 'Salesforce', 'Azure AD'];
const MFA_TYPES = ['No', 'Yes', '2 Factor Auth'];
const MFA_APPLICATIONS = ['Auth0', 'Google Authenticator'];

const INITIAL_CREDENTIALS: CredentialInstance[] = [
  {
    id: 'c1',
    resourceName: 'Palmetto-Claims-Access',
    tenantName: 'LHC',
    username: 'admin_palmetto_01',
    workflows: ['O2I', 'Eligibility'],
    description: 'Primary portal for Palmetto claims submission and verification.',
    application: 'Palmetto',
    loginUrl: 'https://palmettogba.com/portal',
    envs: ['Prod', 'Test'],
    mfaType: '2 Factor Auth',
    mfaApplication: 'Auth0',
    mfaSecretKey: 'X7Y2-Z8W9-Q1P0',
    mfaEmailUsers: 'admin@enterprise.ai',
    passwordExpiryPeriod: '90 days',
    expiryNotificationUsers: 'devops@enterprise.ai',
    status: 'Success',
    onboardedAt: '2024-01-10',
    modifiedBy: 'Support User',
    modifiedOn: '2024-05-20'
  },
  {
    id: 'c2',
    resourceName: 'Wellsky-UAT-Login',
    tenantName: 'Wellsky',
    username: 'wellsky_tester',
    workflows: ['RCD'],
    description: 'User acceptance testing environment for Wellsky integrations.',
    application: 'Wellsky',
    loginUrl: 'https://uat.wellsky.io',
    envs: ['Test'],
    mfaType: 'No',
    passwordExpiryPeriod: '60 days',
    expiryNotificationUsers: 'qa-team@enterprise.ai',
    status: 'Success',
    onboardedAt: '2024-02-15',
    modifiedBy: 'System Admin',
    modifiedOn: '2024-05-18'
  },
  {
    id: 'c3',
    resourceName: 'HCHB-Portal-Main',
    tenantName: 'Element 5',
    username: 'hchb_svc_account',
    workflows: ['Authorizations', 'Notifications'],
    description: 'HCHB service account for data syncing.',
    application: 'HCHB',
    loginUrl: 'https://hchb.com/login',
    envs: ['Prod'],
    mfaType: 'Yes',
    passwordExpiryPeriod: '45 days',
    expiryNotificationUsers: 'security@enterprise.ai',
    status: 'Failed',
    failureMessage: 'MFA Secret handoff timed out.',
    onboardedAt: '2024-03-12',
    modifiedBy: 'Support User',
    modifiedOn: '2024-03-12'
  }
];

const CredentialOnboardingView: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState<CredentialInstance[]>(INITIAL_CREDENTIALS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter states
  const [columnFilters, setColumnFilters] = useState({
    tenant: '',
    application: '',
    env: '',
    mfa: '',
    status: ''
  });

  const [formData, setFormData] = useState<Partial<CredentialInstance>>({
    resourceName: '',
    tenantName: '',
    username: '',
    workflows: [],
    description: '',
    application: APPLICATIONS[0],
    loginUrl: '',
    envs: ['Test'],
    mfaType: 'No',
    mfaApplication: 'Auth0',
    mfaSecretKey: '',
    mfaEmailUsers: '',
    passwordExpiryPeriod: '60 days',
    expiryNotificationUsers: ''
  });

  const filteredCredentials = useMemo(() => {
    return credentials.filter(c => {
      const matchesSearch = 
        c.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.application.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tenantName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTenant = !columnFilters.tenant || c.tenantName === columnFilters.tenant;
      const matchesApp = !columnFilters.application || c.application === columnFilters.application;
      const matchesEnv = !columnFilters.env || c.envs.includes(columnFilters.env as EnvType);
      const matchesMfa = !columnFilters.mfa || 
        (columnFilters.mfa === 'Yes' && c.mfaType !== 'No') || 
        (columnFilters.mfa === 'No' && c.mfaType === 'No');
      const matchesStatus = !columnFilters.status || c.status === columnFilters.status;

      return matchesSearch && matchesTenant && matchesApp && matchesEnv && matchesMfa && matchesStatus;
    });
  }, [searchQuery, credentials, columnFilters]);

  const handleOnboard = () => {
    if (!formData.resourceName || !formData.tenantName || !formData.envs?.length) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      const now = new Date().toISOString().split('T')[0];
      
      if (editingId) {
        setCredentials(prev => prev.map(c => 
          c.id === editingId 
            ? { ...c, ...formData, modifiedBy: 'Support User', modifiedOn: now, status: 'Success' } as CredentialInstance
            : c
        ));
      } else {
        const newCred: CredentialInstance = {
          ...(formData as CredentialInstance),
          id: `cred-${Date.now()}`,
          status: 'Success',
          onboardedAt: now,
          modifiedBy: 'Support User',
          modifiedOn: now
        };
        setCredentials([newCred, ...credentials]);
      }
      
      setIsProcessing(false);
      setShowSuccess(true);
      // Seamless redirect after successful operation
      setTimeout(() => {
        setShowSuccess(false);
        setActiveView('list');
        resetForm();
      }, 1500);
    }, 1500);
  };

  const handleEdit = (cred: CredentialInstance) => {
    setFormData({
      resourceName: cred.resourceName,
      tenantName: cred.tenantName,
      username: cred.username,
      workflows: cred.workflows || [],
      description: cred.description,
      application: cred.application,
      loginUrl: cred.loginUrl,
      envs: cred.envs,
      mfaType: cred.mfaType,
      mfaApplication: cred.mfaApplication,
      mfaSecretKey: cred.mfaSecretKey,
      mfaEmailUsers: cred.mfaEmailUsers,
      passwordExpiryPeriod: cred.passwordExpiryPeriod,
      expiryNotificationUsers: cred.expiryNotificationUsers
    });
    setEditingId(cred.id);
    setActiveView('form');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this credential?")) {
      setCredentials(prev => prev.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      resourceName: '',
      tenantName: '',
      username: '',
      workflows: [],
      description: '',
      application: APPLICATIONS[0],
      loginUrl: '',
      envs: ['Test'],
      mfaType: 'No',
      mfaApplication: 'Auth0',
      mfaSecretKey: '',
      mfaEmailUsers: '',
      passwordExpiryPeriod: '60 days',
      expiryNotificationUsers: ''
    });
    setEditingId(null);
  };

  const toggleWorkflow = (sku: string) => {
    const current = formData.workflows || [];
    if (current.includes(sku)) {
      setFormData({ ...formData, workflows: current.filter(s => s !== sku) });
    } else {
      setFormData({ ...formData, workflows: [...current, sku] });
    }
  };

  const toggleEnv = (env: EnvType) => {
    const current = formData.envs || [];
    if (current.includes(env)) {
      if (current.length === 1) return; // Must have at least one env
      setFormData({ ...formData, envs: current.filter(e => e !== env) });
    } else {
      setFormData({ ...formData, envs: [...current, env] });
    }
  };

  const renderGrid = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setColumnFilters({tenant: '', application: '', env: '', mfa: '', status: ''})}
            className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2"
           >
             <X size={14} /> Clear All Filters
           </button>
          <span className="h-4 w-px bg-slate-200 mx-2"></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredCredentials.length} Results</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[1500px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[200px]">Resource Name</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[160px]">Username</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[180px]">
                  <div className="flex flex-col gap-2">
                    Tenant
                    <select 
                      value={columnFilters.tenant}
                      onChange={(e) => setColumnFilters({...columnFilters, tenant: e.target.value})}
                      className="text-[9px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                    >
                      <option value="">ALL</option>
                      {BASE_TENANTS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[180px]">
                  <div className="flex flex-col gap-2">
                    Application
                    <select 
                      value={columnFilters.application}
                      onChange={(e) => setColumnFilters({...columnFilters, application: e.target.value})}
                      className="text-[9px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                    >
                      <option value="">ALL</option>
                      {APPLICATIONS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                    </select>
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">
                   <div className="flex flex-col gap-2">
                    Env
                    <select 
                      value={columnFilters.env}
                      onChange={(e) => setColumnFilters({...columnFilters, env: e.target.value})}
                      className="text-[9px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                    >
                      <option value="">ALL</option>
                      <option value="Test">TEST</option>
                      <option value="Prod">PROD</option>
                    </select>
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[100px]">
                   <div className="flex flex-col gap-2">
                    MFA
                    <select 
                      value={columnFilters.mfa}
                      onChange={(e) => setColumnFilters({...columnFilters, mfa: e.target.value})}
                      className="text-[9px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                    >
                      <option value="">ALL</option>
                      <option value="Yes">YES</option>
                      <option value="No">NO</option>
                    </select>
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[120px]">Expiry</th>
                <th className="sticky right-[120px] px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-[140px] bg-slate-50/50 z-20 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                   <div className="flex flex-col gap-2">
                    Status
                    <select 
                      value={columnFilters.status}
                      onChange={(e) => setColumnFilters({...columnFilters, status: e.target.value})}
                      className="text-[9px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                    >
                      <option value="">ALL</option>
                      <option value="Success">SUCCESS</option>
                      <option value="Failed">FAILED</option>
                      <option value="Pending">PENDING</option>
                    </select>
                  </div>
                </th>
                <th className="sticky right-0 px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right w-[120px] bg-slate-50/50 z-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCredentials.map((cred) => (
                <tr key={cred.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                        <KeyRound size={18} />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-sm truncate">{cred.resourceName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Onboarded {cred.onboardedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 truncate">
                    <span className="text-sm font-semibold text-slate-700 truncate">{cred.username}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{cred.tenantName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                      {cred.application}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {cred.envs.map(env => (
                        <span key={env} className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          env === 'Prod' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {env.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        cred.mfaType !== 'No' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {cred.mfaType !== 'No' ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{cred.passwordExpiryPeriod}</span>
                  </td>
                  
                  <td className="sticky right-[120px] px-8 py-6 text-center bg-white group-hover:bg-slate-50/50 z-10 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border flex items-center gap-1.5 ${
                        cred.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        cred.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {cred.status === 'Success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {cred.status.toUpperCase()}
                      </span>
                      {cred.failureMessage && (
                        <div className="group/msg relative">
                          <AlertCircle size={12} className="text-red-400 cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl font-medium leading-relaxed text-center">
                            {cred.failureMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="sticky right-0 px-8 py-6 text-right bg-white group-hover:bg-slate-50/50 z-10">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cred)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Credential"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cred.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Credential"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCredentials.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    No credentials found matching the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <button 
        onClick={() => { setActiveView('list'); resetForm(); }}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Vault
      </button>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-12 py-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {editingId ? 'Edit Credential' : 'Onboard Credential'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {editingId ? `Modifying configuration for ${formData.resourceName}` : 'Configure secure access parameters for enterprise resources.'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center text-indigo-600">
            {editingId ? <Edit2 size={32} /> : <Vault size={32} />}
          </div>
        </div>

        <div className="p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Resource Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <KeyRound size={14} /> Resource Name *
              </label>
              <input 
                type="text" 
                value={formData.resourceName}
                onChange={(e) => setFormData({...formData, resourceName: e.target.value})}
                placeholder="e.g. HCHB-Claims-Portal-Prod"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
              />
            </div>

            {/* Tenant Name - Mandatory */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} /> Tenant Name *
              </label>
              <div className="relative">
                <select 
                  value={formData.tenantName}
                  onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-50 shadow-sm"
                >
                  <option value="" disabled>Select Tenant</option>
                  {BASE_TENANTS.map(tenant => <option key={tenant} value={tenant}>{tenant}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={14} /> Username
              </label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="e.g. jsmith_wellsky"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
            </div>

            {/* Application Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Server size={14} /> Application
              </label>
              <div className="relative">
                <select 
                  value={formData.application}
                  onChange={(e) => setFormData({...formData, application: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-50 shadow-sm"
                >
                  {APPLICATIONS.map(app => <option key={app} value={app}>{app}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

             {/* Environment Selection - Multiple allowed */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} /> Available Environments *
              </label>
              <div className="flex gap-4">
                {(['Test', 'Prod'] as EnvType[]).map(env => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => toggleEnv(env)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 font-bold transition-all ${
                      formData.envs?.includes(env)
                        ? (env === 'Prod' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-100' : 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-100')
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {formData.envs?.includes(env) ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                    {env} Environment
                  </button>
                ))}
              </div>
            </div>

            {/* Login URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Login URL
              </label>
              <input 
                type="url" 
                value={formData.loginUrl}
                onChange={(e) => setFormData({...formData, loginUrl: e.target.value})}
                placeholder="https://..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
            </div>

            {/* Workflow Name (Optional) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={14} /> Workflow (Optional)
              </label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-50 shadow-sm"
                  onChange={(e) => toggleWorkflow(e.target.value)}
                  value=""
                >
                  <option value="" disabled>Add Workflow SKUs...</option>
                  {WORKFLOW_SKUS.map(sku => (
                    <option key={sku} value={sku}>{sku}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.workflows?.map(w => (
                  <span key={w} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-200 flex items-center gap-1">
                    {w} <X size={10} className="cursor-pointer" onClick={() => toggleWorkflow(w)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Description
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the primary purpose of this resource..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm resize-none"
                rows={2}
              />
            </div>

            {/* MFA Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Fingerprint size={14} /> MFA Type
              </label>
              <div className="relative">
                <select 
                  value={formData.mfaType}
                  onChange={(e) => setFormData({...formData, mfaType: e.target.value as any})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-50 shadow-sm"
                >
                  {MFA_TYPES.map(mfa => <option key={mfa} value={mfa}>{mfa}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Conditional MFA Application */}
            {formData.mfaType === '2 Factor Auth' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> MFA Application
                </label>
                <div className="relative">
                  <select 
                    value={formData.mfaApplication}
                    onChange={(e) => setFormData({...formData, mfaApplication: e.target.value as any})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-50 shadow-sm"
                  >
                    {MFA_APPLICATIONS.map(mfaApp => <option key={mfaApp} value={mfaApp}>{mfaApp}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            )}

            {/* MFA Specifics */}
            {formData.mfaType !== 'No' && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Key size={14} /> MFA Secret Key
                  </label>
                  <input 
                    type="password" 
                    value={formData.mfaSecretKey}
                    onChange={(e) => setFormData({...formData, mfaSecretKey: e.target.value})}
                    placeholder="Enter secret key..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
                  />
                </div>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={14} /> MFA Email Users
                  </label>
                  <input 
                    type="text" 
                    value={formData.mfaEmailUsers}
                    onChange={(e) => setFormData({...formData, mfaEmailUsers: e.target.value})}
                    placeholder="Separate emails with commas..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
                  />
                </div>
              </>
            )}

            {/* Password Expiry Period */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Password Expiry Period
              </label>
              <input 
                type="text" 
                value={formData.passwordExpiryPeriod}
                onChange={(e) => setFormData({...formData, passwordExpiryPeriod: e.target.value})}
                placeholder="e.g. 60 days"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
            </div>

            {/* Expiry Notification Users */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MailWarning size={14} /> Notification Recipients
              </label>
              <input 
                type="text" 
                value={formData.expiryNotificationUsers}
                onChange={(e) => setFormData({...formData, expiryNotificationUsers: e.target.value})}
                placeholder="Emails for expiry alerts..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
            </div>
          </div>

          <div className="pt-10 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <ShieldCheck size={16} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[300px]">
                Credentials are encrypted using AES-256 and stored in the isolated key vault.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setActiveView('list'); resetForm(); }}
                className="px-8 py-5 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleOnboard}
                disabled={!formData.resourceName || !formData.tenantName || !formData.envs?.length || isProcessing}
                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-4"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <Save size={20} /> : <Check size={20} />)}
                {isProcessing ? 'Securing Credential...' : (editingId ? 'Update Credential' : 'Add Credential')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Credential Onboarding</h1>
          <p className="mt-3 text-slate-500 text-lg leading-relaxed font-medium">
            Manage your high-security vault. Secure application logins, MFA secrets, and multi-environment keys.
          </p>
        </div>
        
        {activeView === 'list' && (
          <button 
            onClick={() => { resetForm(); setActiveView('form'); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <PlusCircle size={20} />
            Add Credential
          </button>
        )}
      </div>

      {activeView === 'list' ? renderGrid() : renderForm()}

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 z-[100]">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg">Vault Synchronized</p>
            <p className="text-sm opacity-90 font-medium">
              The credential has been successfully {editingId ? 'updated' : 'committed'} to the vault.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialOnboardingView;