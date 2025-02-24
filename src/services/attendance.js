import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getLocations } from './locations';

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}

export const registerAttendance = async (userId, type, location) => {
  try {
    // Obtener todas las ubicaciones válidas
    const { locations, error: locationsError } = await getLocations();
    
    if (locationsError) {
      return { error: 'Error al obtener ubicaciones válidas' };
    }

    if (locations.length === 0) {
      return { error: 'No hay ubicaciones configuradas en el sistema' };
    }

    // Verificar si ya existe un registro del mismo tipo para hoy
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = await getEmployeeAttendance(userId, today);
    
    if (existingRecord.records.some(record => record.type === type)) {
      return { error: `Ya has registrado tu ${type} el día de hoy` };
    }

    // Calcular la distancia a cada ubicación y encontrar la más cercana
    let nearestLocation = null;
    let shortestDistance = Infinity;

    locations.forEach(loc => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        loc.latitude,
        loc.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLocation = loc;
      }
    });

    // Verificar si está dentro del radio permitido de la ubicación más cercana
    if (shortestDistance > nearestLocation.radius) {
      return {
        error: `Ubicación fuera del rango permitido. Estás a ${Math.round(shortestDistance)}m de ${nearestLocation.name}. Máximo permitido: ${nearestLocation.radius}m`
      };
    }

    const attendanceRef = collection(db, 'attendance');
    const timestamp = new Date();
    
    await addDoc(attendanceRef, {
      userId,
      type,
      location: {
        ...location,
        nearestLocationId: nearestLocation.id,
        nearestLocationName: nearestLocation.name,
        distanceToLocation: Math.round(shortestDistance)
      },
      timestamp,
      date: today
    });

    return { 
      error: null,
      distance: Math.round(shortestDistance),
      locationName: nearestLocation.name
    };
  } catch (error) {
    console.error('Error registering attendance:', error);
    return { error: 'Error al registrar la asistencia' };
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
      records.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { records };
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return { error: 'Error al obtener los registros de asistencia' };
  }
};