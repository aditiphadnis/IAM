
import React, { useState } from 'react';
import { 
  PlusCircle, 
  ChevronRight, 
  Bell, 
  ShieldCheck,
  Settings,
  ArrowLeft,
  LayoutGrid,
  History,
  GitBranch,
  Vault,
  Building2,
  Users
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ActivityLogView from './components/ActivityLogView';
import UserOnboardingView from './components/UserOnboardingView';
import { ONBOARDING_CARDS } from './constants';
import { OnboardingType } from './types';

const PlaceholderView: React.FC<{ title: string; icon: React.ReactNode; description: string }> = ({ title, icon, description }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 mb-6 shadow-sm">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
    <p className="text-slate-500 mt-2 max-w-sm text-center leading-relaxed">{description}</p>
    <button className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
      Configure Module
    </button>
  </div>
);

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'onboarding' | 'activity'>('onboarding');

  const handleOnboardingClick = (type: OnboardingType) => {
    switch(type) {
      case OnboardingType.USER:
        setActiveNav('users');
        break;
      case OnboardingType.WORKFLOW:
        setActiveNav('workflows');
        break;
      case OnboardingType.TENANT:
        setActiveNav('tenants');
        break;
      case OnboardingType.RESOURCE:
        setActiveNav('credentials');
        break;
    }
  };

  const OnboardingGrid = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Onboarding</h2>
          <p className="mt-2 text-slate-500 text-lg leading-relaxed">
            Streamline your organizational setup. Rapidly provision tenants, manage high-performance teams, and automate infrastructure.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-medium text-slate-700">All Systems Operational</span>
           </div>
           <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ONBOARDING_CARDS.map((card) => (
          <button
            key={card.type}
            onClick={() => handleOnboardingClick(card.type)}
            className={`flex flex-col items-start p-6 bg-white border ${card.borderColor} rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group`}
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{card.description}</p>
            <div className="mt-auto flex items-center text-indigo-600 font-semibold text-sm">
              Get Started
              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return dashboardTab === 'onboarding' ? <OnboardingGrid /> : <ActivityLogView />;
      case 'users':
        return <UserOnboardingView />;
      case 'workflows':
        return <PlaceholderView 
          title="Workflow Management" 
          icon={<GitBranch size={40} />} 
          description="Design, deploy, and monitor complex enterprise automation workflows with AI-assisted logic." 
        />;
      case 'credentials':
        return <PlaceholderView 
          title="Credential Vault" 
          icon={<Vault size={40} />} 
          description="Securely manage API keys, encryption secrets, and environment-specific credentials." 
        />;
      case 'tenants':
        return <PlaceholderView 
          title="Tenant Orchestration" 
          icon={<Building2 size={40} />} 
          description="Provision isolated organizational units, configure regional settings, and manage billing accounts." 
        />;
      case 'settings':
        return <PlaceholderView 
          title="Global Settings" 
          icon={<Settings size={40} />} 
          description="Configure system-wide parameters, white-labeling, and advanced security configurations." 
        />;
      default:
        return <OnboardingGrid />;
    }
  };

  return (
    <div className="flex min-h-screen text-slate-900">
      <Sidebar activeId={activeNav} onNavigate={setActiveNav} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-8">
            {activeNav === 'dashboard' ? (
              <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2">
                <button 
                  onClick={() => setDashboardTab('onboarding')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition-all ${
                    dashboardTab === 'onboarding' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Onboarding
                </button>
                <button 
                  onClick={() => setDashboardTab('activity')}
                  className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition-all ${
                    dashboardTab === 'activity' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <History size={14} />
                  Activity Log
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveNav('dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
              <ShieldCheck size={14} className="text-emerald-500" />
              Root Access Secured
            </div>
            <button 
              onClick={() => setActiveNav('settings')}
              className={`p-2 rounded-full transition-all ${activeNav === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
               <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
