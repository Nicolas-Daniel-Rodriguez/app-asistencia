import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const LOCATIONS_COLLECTION = 'locations';

export const addLocation = async (locationData) => {
  try {
    const locationsRef = collection(db, LOCATIONS_COLLECTION);
    await addDoc(locationsRef, {
      ...locationData,
      createdAt: new Date(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateLocation = async (locationId, locationData) => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    await updateDoc(locationRef, {
      ...locationData,
      updatedAt: new Date(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteLocation = async (locationId) => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    await deleteDoc(locationRef);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getLocations = async () => {
  try {
    const locationsRef = collection(db, LOCATIONS_COLLECTION);
    const snapshot = await getDocs(locationsRef);
    const locations = [];
    snapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    return { locations, error: null };
  } catch (error) {
    return { locations: [], error: error.message };
  }
};