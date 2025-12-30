import React, { useState } from 'react';
import { OnboardingType } from '../types';
import { X, Check, Loader2, User, Mail, Shield, Globe, TestTube, Zap, Building } from 'lucide-react';

interface FormProps {
  type: OnboardingType;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const BASE_TENANTS = [
  'Element 5',
  'LHC',
  'Wellsky',
  'Centerwell',
  'Viview'
];

const UserForm: React.FC<{ env: 'QA' | 'Prod', setEnv: (e: 'QA' | 'Prod') => void }> = ({ env, setEnv }) => (
  <div className="space-y-6">
    {/* Environment Selector */}
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target Environment</label>
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setEnv('QA')}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            env === 'QA' 
              ? 'bg-white text-orange-600 shadow-sm border border-orange-100' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TestTube size={16} />
          QA Environment
        </button>
        <button
          type="button"
          onClick={() => setEnv('Prod')}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            env === 'Prod' 
              ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Zap size={16} />
          Production
        </button>
      </div>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <User size={14} className="text-slate-400" /> Full Name
          </label>
          <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-slate-50/50" placeholder="e.g. Sarah Jenkins" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Mail size={14} className="text-slate-400" /> Work Email
          </label>
          <input type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-slate-50/50" placeholder="sarah.j@enterprise.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Shield size={14} className="text-slate-400" /> System Role
          </label>
          <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-slate-50/50 appearance-none cursor-pointer">
            <option>Standard User</option>
            <option>Environment Admin</option>
            <option>Audit Specialist</option>
            <option>DevOps Lead</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Building size={14} className="text-slate-400" /> Base Tenant
          </label>
          <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-slate-50/50 appearance-none cursor-pointer">
            <option value="" disabled selected>Select Base Tenant</option>
            {BASE_TENANTS.map(tenant => (
              <option key={tenant} value={tenant}>{tenant}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
      env === 'QA' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
    }`}>
      <div className="p-1 rounded bg-white shadow-sm mt-0.5">
        {env === 'QA' ? <TestTube size={14} className="text-orange-500" /> : <Zap size={14} className="text-emerald-500" />}
      </div>
      <div className="text-xs leading-relaxed">
        <p className="font-bold mb-0.5 uppercase tracking-wide">Environment Context</p>
        <p className="opacity-80">
          {env === 'QA' 
            ? "User will be provisioned with sandbox-only credentials and restricted from accessing production data stores."
            : "User will be granted live access. Multi-factor authentication (MFA) will be enforced immediately upon first login."}
        </p>
      </div>
    </div>
  </div>
);

const WorkflowForm: React.FC<Omit<FormProps, 'type'>> = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Workflow Name</label>
      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Customer Support Flow" />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
      <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" rows={3} placeholder="Describe the sequence..." />
    </div>
  </div>
);

const TenantForm: React.FC<Omit<FormProps, 'type'>> = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Acme Industries" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
          <option>US East (N. Virginia)</option>
          <option>Europe (Ireland)</option>
        </select>
      </div>
    </div>
  </div>
);

const ResourceForm: React.FC<Omit<FormProps, 'type'>> = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
        <option>Cloud Storage (S3)</option>
        <option>Relational Database (RDS)</option>
      </select>
    </div>
  </div>
);

export const EntityForm: React.FC<FormProps> = ({ type, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [env, setEnv] = useState<'QA' | 'Prod'>('QA');

  const handleFakeSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit({});
    }, 1500);
  };

  const renderForm = () => {
    switch (type) {
      case OnboardingType.USER: return <UserForm env={env} setEnv={setEnv} />;
      case OnboardingType.WORKFLOW: return <WorkflowForm onClose={onClose} onSubmit={onSubmit} />;
      case OnboardingType.TENANT: return <TenantForm onClose={onClose} onSubmit={onSubmit} />;
      case OnboardingType.RESOURCE: return <ResourceForm onClose={onClose} onSubmit={onSubmit} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 border-4 transition-colors ${
        type === OnboardingType.USER && env === 'QA' ? 'border-indigo-100/50' : 
        type === OnboardingType.USER && env === 'Prod' ? 'border-emerald-100/50' : 
        'border-white'
      }`}>
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-2xl tracking-tight">Onboard {type}</h3>
            <p className="text-slate-500 text-sm">Fill in the details to provision the new entity.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all">
            <X size={24} />
          </button>
        </div>
        
        <div className="px-8 py-8">
          {renderForm()}
        </div>

        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-4 items-center">
          <button 
            disabled={loading}
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Discard
          </button>
          <button 
            disabled={loading}
            onClick={handleFakeSubmit}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold shadow-xl transition-all flex items-center gap-2 text-white ${
              type === OnboardingType.USER && env === 'Prod' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            } disabled:opacity-50 active:scale-95`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {loading ? 'Onboarding...' : `Confirm Onboarding`}
          </button>
        </div>
      </div>
    </div>
  );
};