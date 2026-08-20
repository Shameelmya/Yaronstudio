export interface Studio {
  id: string;
  name: string;
  adminName: string;
}

export type UserRole = 'admin' | 'staff';

export interface Customer {
  id: string;
  name: string;
  phone: string; // Normalized
  place: string;
  whatsapp: string;
  careOf?: string;
  studioId: string;
  createdAt: Date;
}

export type WorkStatus = 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';

export interface Work {
  id: string;
  refNumber?: string;
  studioId: string;
  customerId: string;
  title: string;
  services: string[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  workId: string;
  name: string;
  price: number;
}

export interface Expense {
  id: string;
  studioId: string;
  title: string;
  amount: number;
  category: 'Equipment' | 'Maintenance' | 'Rent' | 'Salary' | 'Marketing' | 'Utilities' | 'Other';
  date: number;
}

export interface Income {
  id: string;
  studioId: string;
  title: string;
  amount: number;
  date: number;
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
  studioId: string;
  workId: string;
  customerId: string;
  service: string;
  staffId?: string;
  date: number; // Start time timestamp
  duration: number; // In minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
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

export interface SalaryPayment {
  id: string;
  studioId: string;
  staffId: string;
  month: string; // e.g., '2023-10'
  amount: number;
  datePaid: number;
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
