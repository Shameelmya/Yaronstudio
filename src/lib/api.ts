import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Work, Customer, Booking, Expense } from '@/types';

// ==============================
// Works API
// ==============================
export const createWork = async (work: Work) => {
  await setDoc(doc(db, 'works', work.id), work);
};

export const updateWork = async (workId: string, data: Partial<Work>) => {
  await updateDoc(doc(db, 'works', workId), data);
};

export const listenToWorks = (studioId: string, callback: (works: Work[]) => void) => {
  // Query ignoring studioId for now to make it easy across mock data without strict rules.
  // In production, you'd add: where('studioId', '==', studioId)
  const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const works = snap.docs.map(d => ({
      ...d.data(),
      // Handle firestore timestamps
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
      dueDate: d.data().dueDate?.toDate ? d.data().dueDate.toDate() : new Date(d.data().dueDate || Date.now()),
    })) as Work[];
    callback(works);
  });
};

export const deleteWork = async (workId: string) => {
  await deleteDoc(doc(db, 'works', workId));
};

// ==============================
// Customers API
// ==============================
export const createCustomer = async (customer: Customer) => {
  await setDoc(doc(db, 'customers', customer.id), customer);
};

export const listenToCustomers = (studioId: string, callback: (customers: Customer[]) => void) => {
  const q = query(collection(db, 'customers'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as Customer));
  });
};

// ==============================
// Bookings API
// ==============================
export const createBooking = async (booking: Booking) => {
  await setDoc(doc(db, 'bookings', booking.id), booking);
};

export const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
  await updateDoc(doc(db, 'bookings', bookingId), { status });
};

export const listenToBookings = (studioId: string, callback: (bookings: Booking[]) => void) => {
  const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as Booking));
  });
};

// ==============================
// Finance (Expenses) API
// ==============================
export const addExpense = async (expense: Expense) => {
  await setDoc(doc(db, 'expenses', expense.id), expense);
};

export const listenToExpenses = (studioId: string, callback: (expenses: Expense[]) => void) => {
  const q = query(collection(db, 'expenses'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => d.data() as Expense);
    data.sort((a, b) => b.date - a.date);
    callback(data);
  });
};

// ==============================
// Staff & Attendance API
// ==============================
export const createAttendance = async (attendance: any) => {
  await setDoc(doc(db, 'attendance', attendance.id), attendance);
};

export const listenToAttendance = (studioId: string, callback: (attendance: any[]) => void) => {
  const q = query(collection(db, 'attendance'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => d.data());
    data.sort((a, b) => b.date - a.date);
    callback(data);
  });
};

export const paySalary = async (payment: any) => {
  // Track the payment status
  await setDoc(doc(db, 'salaryPayments', payment.id), payment);
  // Create an expense
  const expenseId = `exp_${payment.id}`;
  await setDoc(doc(db, 'expenses', expenseId), {
    id: expenseId,
    studioId: payment.studioId,
    title: `Salary: ${payment.month}`,
    category: 'salary',
    amount: payment.amount,
    date: payment.datePaid,
  });
};

export const listenToSalaryPayments = (studioId: string, callback: (payments: any[]) => void) => {
  const q = query(collection(db, 'salaryPayments'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => d.data());
    data.sort((a, b) => b.datePaid - a.datePaid);
    callback(data);
  });
};
