export type UserRole = 'admin' | 'staff';

export interface Customer {
  id: string;
  name: string;
  phone: string; // Normalized
  place: string;
  whatsapp: string;
  careOf?: string;
  createdAt: number;
}

export type WorkStatus = 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';

export interface Work {
  id: string;
  customerId: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: WorkStatus;
  createdAt: number;
}

export interface Service {
  id: string;
  workId: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  workId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'upi' | 'bank' | 'other';
  reference?: string;
  date: number;
}

export interface Booking {
  id: string;
  workId: string;
  customerId: string;
  service: string;
  staffId?: string;
  date: number; // Start time timestamp
  duration: number; // In minutes
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  position: string;
  joiningDate: number;
  salary: number;
  status: 'active' | 'inactive';
  note?: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  date: number; // Day start timestamp
  status: 'present' | 'absent' | 'leave' | 'half_day';
}

export interface Expense {
  id: string;
  category: 'salary' | 'rent' | 'electricity' | 'internet' | 'equipment' | 'maintenance' | 'software' | 'marketing' | 'transport' | 'miscellaneous';
  amount: number;
  date: number;
  note?: string;
}

export interface Delivery {
  id: string;
  workId: string;
  customerId: string;
  driveFileId: string;
  fileName: string;
  fileType: 'audio' | 'video';
  accessStatus: 'locked' | 'unlocked';
  createdAt: number;
}
