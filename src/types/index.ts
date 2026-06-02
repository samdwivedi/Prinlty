export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "STUDENT" | "OPERATOR" | "ADMIN";
  avatar?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    printJobs: number;
  };
}

export interface Shop {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  phone: string;
  email?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  operatorId: string;
  createdAt: string;
  updatedAt: string;
  operator?: User;
}

export interface Printer {
  id: string;
  name: string;
  model?: string | null;
  shopId: string;
  status: "ONLINE" | "OFFLINE" | "BUSY" | "MAINTENANCE";
  isColorCapable: boolean;
  isDuplexCapable: boolean;
  jobsCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  pageCount: number;
  mimeType: string;
  storagePath: string;
  storageKey: string;
  uploadedById: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface PrintJob {
  id: string;
  jobNumber: string;
  userId: string;
  shopId: string;
  documentId: string;
  printerId?: string | null;
  copies: number;
  color: "BLACK_WHITE" | "COLOR";
  sides: "SINGLE" | "DOUBLE";
  pageRange?: string | null;
  paperSize: string;
  status: "PENDING" | "QUEUED" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED";
  qrToken: string;
  qrExpiresAt: string;
  totalPages: number;
  estimatedCost: number;
  actualCost?: number | null;
  notes?: string | null;
  operatorNotes?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  autoDeleteAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  shop?: Shop;
  document?: Document;
  printer?: Printer;
}

export interface Notification {
  id: string;
  userId: string;
  printJobId?: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  printJob?: PrintJob;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  printJobId?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: User;
  printJob?: PrintJob;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
}
