import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const createUserWithRole = async (email, password, role, userData) => {
  try {
    console.log('Iniciando creación de usuario:', email);
    
    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario creado en Auth:', userCredential.user.uid);
    
    // Crear documento del usuario en Firestore con su rol y datos adicionales
    const userDoc = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDoc, {
      email,
      role,
      name: userData.name,
      lastName: userData.lastName,
      createdAt: new Date()
    });
    console.log('Documento de usuario creado en Firestore');

    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Error creando usuario:', error);
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log('Intentando login:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Verificar si existe el documento del usuario
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      console.error('Documento de usuario no encontrado en Firestore');
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    console.log('Login exitoso, rol:', userDoc.data().role);
    return { 
      user: userCredential.user, 
      role: userDoc.data().role,
      userData: userDoc.data(),
      error: null 
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('Logout exitoso');
    return { error: null };
  } catch (error) {
    console.error('Error en logout:', error);
    return { error: error.message };
  }
};