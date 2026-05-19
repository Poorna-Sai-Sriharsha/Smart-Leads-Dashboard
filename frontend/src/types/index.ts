export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Instagram';
export type UserRole = 'admin' | 'sales';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ILead {
  id: string;
  _id?: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo?: { name: string; email: string; role: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: IPaginationMeta;
}

export interface ILeadFilters {
  status: LeadStatus | '';
  source: LeadSource | '';
  search: string;
  sortBy: 'latest' | 'oldest';
  page: number;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
