import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { role: userDoc.data().role, error: null };
    }
    return { role: null, error: 'Usuario no encontrado' };
  } catch (error) {
    return { role: null, error: error.message };
  }
};

export const createUserWithRole = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};