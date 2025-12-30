
export enum OnboardingType {
  USER = 'Users',
  WORKFLOW = 'Workflows',
  TENANT = 'Tenants',
  RESOURCE = 'Resources'
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  type: OnboardingType;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface Tenant {
  id: string;
  name: string;
  region: string;
  plan: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: number;
}
