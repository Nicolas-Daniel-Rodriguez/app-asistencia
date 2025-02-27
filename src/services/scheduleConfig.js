import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';

const SCHEDULE_CONFIG_ID = 'default';

export const getScheduleConfig = async () => {
  try {
    const docRef = doc(db, 'scheduleConfig', SCHEDULE_CONFIG_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Configuración por defecto
      const defaultConfig = {
        workDays: ['1', '2', '3', '4', '5'], // Lunes a Viernes
        entryTime: '09:00',
        exitTime: '18:00',
        toleranceMinutes: 15
      };
      await setDoc(docRef, defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error getting schedule config:', error);
    throw error;
  }
};

export const updateScheduleConfig = async (newConfig) => {
  try {
    const docRef = doc(db, 'scheduleConfig', SCHEDULE_CONFIG_ID);
    await updateDoc(docRef, newConfig);
  } catch (error) {
    console.error('Error updating schedule config:', error);
    throw error;
  }
};

export const getLocationScheduleConfig = async (locationId) => {
  try {
    const docRef = doc(db, 'locations', locationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const locationData = docSnap.data();
      return locationData.scheduleConfig || createDefaultConfig();
    }
    return createDefaultConfig();
  } catch (error) {
    console.error('Error getting location schedule config:', error);
    throw error;
  }
};

export const updateLocationScheduleConfig = async (locationId, newConfig) => {
  try {
    const docRef = doc(db, 'locations', locationId);
    await updateDoc(docRef, {
      scheduleConfig: newConfig
    });
  } catch (error) {
    console.error('Error updating location schedule config:', error);
    throw error;
  }
};

export const createDefaultConfig = () => ({
  workDays: ['1', '2', '3', '4', '5'], // Lunes a Viernes
  entryTime: '09:00',
  exitTime: '18:00',
  toleranceMinutes: 15
});

export const calculateAttendanceStatus = (timestamp, scheduleConfig, locationId) => {
  if (!timestamp || !scheduleConfig) return 'absent';

  const attendanceDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const dayOfWeek = attendanceDate.getDay().toString();
  
  // Verificar si es día laborable para esta ubicación
  if (!scheduleConfig.workDays.includes(dayOfWeek)) {
    return 'nonWorkday';
  }

  const [scheduledHour, scheduledMinute] = scheduleConfig.entryTime.split(':');
  
  const scheduledDate = new Date(attendanceDate);
  scheduledDate.setHours(parseInt(scheduledHour), parseInt(scheduledMinute), 0, 0);

  const toleranceMs = scheduleConfig.toleranceMinutes * 60 * 1000;
  const lateThresholdMs = toleranceMs + (60 * 60 * 1000); // 1 hora después de la tolerancia

  const diffMs = attendanceDate.getTime() - scheduledDate.getTime();

  if (diffMs <= toleranceMs) {
    return 'onTime';
  } else if (diffMs <= lateThresholdMs) {
    return 'late';
  } else {
    return 'absent';
  }
};