import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { firestore } from '../app/firebaseConfig';

class FireStoreAdministracion {
  // Método para registrar o actualizar un usuario
  async registrarEmpresa(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const userRef = doc(firestore, 'empresas', id);
        await setDoc(userRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collection(firestore, 'empresas'), values);
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar empresas con opción de búsqueda
  async listarEmpresas({ search }: { search: string }) {
    try {
      let q;
      if (search) {
        q = query(
          collection(firestore, 'empresas'),
          where('nombre', '>=', search.trim()),
          where('nombre', '<', search.toLowerCase().trim() + '\uf8ff')
        );
      } else {
        q = query(collection(firestore, 'empresas'));
      }

      const arrayObject: any[] = [];
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        arrayObject.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return arrayObject;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para buscar un usuario por ID
  async buscarEmpresa(idEmpresa: any) {
    try {
      // Referencia al documento
      const docRef = doc(firestore, 'empresas', idEmpresa?.toString());
      // Obtener el documento
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Metodo Firebase Usuario de empresa
  async buscarUsuarioAuth({ firebaseUID }: { firebaseUID: string }) {
    try {
      let q;
      if (firebaseUID) {
        q = query(
          collection(firestore, 'usuarios'),
          where('firebaseUID', '==', firebaseUID),
        );
      } else {
        return [];
      }

      const arrayObject: any[] = [];
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        arrayObject.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const [firstItem] = arrayObject;
      return firstItem;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
}

export default new FireStoreAdministracion();