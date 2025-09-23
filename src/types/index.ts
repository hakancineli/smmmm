// Database Types
export interface Superuser {
  id: string;
  username: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMMMAccount {
  id: string;
  superuserId: string;
  companyName?: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Taxpayer {
  id: string;
  smmmId: string;
  tcNumber: string;
  taxNumber?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  taxpayerId: string;
  smmmId: string;
  year: number;
  month: number;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EDevletCredential {
  id: string;
  taxpayerId: string;
  smmmId: string;
  platform: Platform;
  username?: string;
  passwordEncrypted: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  taxpayerId: string;
  title: string;
  description?: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  taxpayerId: string;
  smmmId: string;
  messageType: MessageType;
  content: string;
  filePath?: string;
  status: MessageStatus;
  sentAt?: Date;
  createdAt: Date;
}

// Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum Platform {
  EARSIV_PORTAL = 'EARSIV_PORTAL',
  DIJITAL_GIB = 'DIJITAL_GIB',
  ISTANBUL_GIB = 'ISTANBUL_GIB'
}

export enum DocumentType {
  BEYANNAME = 'BEYANNAME',
  FATURA = 'FATURA',
  SOZLESME = 'SOZLESME',
  DİGER = 'DİGER'
}

export enum MessageType {
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  BEYANNAME_NOTIFICATION = 'BEYANNAME_NOTIFICATION',
  GENERAL_MESSAGE = 'GENERAL_MESSAGE'
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

// API Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Superuser | SMMMAccount;
  expiresIn: number;
}

export interface CreateSMMMRequest {
  companyName: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: string;
}

export interface CreateTaxpayerRequest {
  tcNumber: string;
  taxNumber?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  monthlyFee: number;
}

export interface CreatePaymentRequest {
  taxpayerId: string;
  year: number;
  month: number;
  amount: number;
  notes?: string;
}

export interface UpdatePaymentRequest {
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  notes?: string;
}

export interface CreateEDevletCredentialRequest {
  taxpayerId: string;
  platform: Platform;
  username?: string;
  password: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTaxpayers: number;
  activeTaxpayers: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export interface PaymentChartData {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
}

export interface TaxpayerPaymentSummary {
  taxpayer: Taxpayer;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

// WhatsApp Types
export interface WhatsAppMessageRequest {
  taxpayerId: string;
  messageType: MessageType;
  content: string;
  filePath?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

// E-Devlet Integration Types
export interface EDevletLoginRequest {
  platform: Platform;
  username: string;
  password: string;
}

export interface EDevletResponse {
  success: boolean;
  message: string;
  data?: any;
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
