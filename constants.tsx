
import React from 'react';
import { 
  Users, 
  GitBranch, 
  Building2, 
  Layers, 
  LayoutDashboard, 
  Database, 
  Settings, 
  HelpCircle,
  PlusCircle,
  History,
  ShieldCheck,
  Zap,
  Key,
  Lock,
  Vault
} from 'lucide-react';
import { OnboardingType } from './types';

export const SIDEBAR_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={20} />, label: 'Users', id: 'users' },
  { icon: <GitBranch size={20} />, label: 'Workflows', id: 'workflows' },
  { icon: <Vault size={20} />, label: 'Credentials', id: 'credentials' },
  { icon: <Building2 size={20} />, label: 'Tenants', id: 'tenants' },
  { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
];

export const ONBOARDING_CARDS = [
  { 
    type: OnboardingType.USER, 
    title: 'Onboard Users', 
    description: 'Add new users to your organization and assign roles.',
    icon: <Users className="text-blue-500" size={24} />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    type: OnboardingType.WORKFLOW, 
    title: 'Onboard Workflows', 
    description: 'Create automated sequences for business processes.',
    icon: <GitBranch className="text-purple-500" size={24} />,
    color: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    type: OnboardingType.TENANT, 
    title: 'Onboard Tenants', 
    description: 'Set up isolated environments for clients or departments.',
    icon: <Building2 className="text-orange-500" size={24} />,
    color: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  { 
    type: OnboardingType.RESOURCE, 
    title: 'Credential Onboarding', 
    description: 'Manage vault secrets, keys, and internal assets.',
    icon: <Vault className="text-emerald-500" size={24} />,
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
];

export const MOCK_ACTIVITIES = [
  { id: '1', user: 'Alex Rivera', action: 'Created Tenant', target: 'Acme Corp', type: OnboardingType.TENANT, timestamp: '2 mins ago', status: 'success' },
  { id: '2', user: 'Sam Smith', action: 'Invited User', target: 'jane.doe@example.com', type: OnboardingType.USER, timestamp: '15 mins ago', status: 'pending' },
  { id: '3', user: 'Alex Rivera', action: 'Deployed Workflow', target: 'Customer Onboarding v2', type: OnboardingType.WORKFLOW, timestamp: '1 hour ago', status: 'success' },
  { id: '4', user: 'System', action: 'Updated Resource', target: 'Vault-Prod-Key-01', type: OnboardingType.RESOURCE, timestamp: '3 hours ago', status: 'failed' },
] as const;
