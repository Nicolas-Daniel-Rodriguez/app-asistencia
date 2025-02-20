import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerAttendance = async (userId, type, location) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const timestamp = new Date();
    
    await addDoc(attendanceRef, {
      userId,
      type, // 'entrada' o 'salida'
      location,
      timestamp,
      date: timestamp.toISOString().split('T')[0], // Para facilitar consultas por día
    });

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getEmployeeAttendance = async (userId, date) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      where('date', '==', date),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const records = [];
    
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });

    return { records, error: null };
  } catch (error) {
    return { records: [], error: error.message };
  }
};

export const getAllEmployeesAttendance = async (date) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('date', '==', date),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const records = [];
    
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });

    return { records, error: null };
  } catch (error) {
    return { records: [], error: error.message };
  }
};