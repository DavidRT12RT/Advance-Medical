import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore';
import { firestore } from '../app/firebaseConfig';

class FireStoreConfiguracion {
  // Método para buscar un sucursal por ID
  async buscarSucursal(idEmpresa: string, idSucursal: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "sucursal"
      const collectionRef = collection(docRef, 'sucursales');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idSucursal);
      // Obtener el documento
      const docSnap = await getDoc(subDocRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  // Método para registrar o actualizar un usuario
  async registrarSucursal(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'sucursales');
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, { ...values, eliminado: false, fechaRegistro: Timestamp.now() });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  // Método para listar sucursales con opción de búsqueda
  async listarSucursales({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      const collectionRef = collection(docRef, 'sucursales');

      //validating post eliminados
      const validating = await getDocs(collection(docRef, 'sucursales'))
      validating.forEach(async (doc) => {
        if (!doc.data().hasOwnProperty('eliminado')) {
          const docRef = doc.ref;
          await setDoc(docRef, { eliminado: false }, { merge: true });
        }
      });
      
      // Crear una consulta ordenada por fechaRegistro
      const q = query(
        collectionRef,
        where('eliminado', '==', false),
        orderBy('fechaRegistro', 'desc'),
      );

      // Obtenemos los documentos de la subcolección
      const querySnapshot = await getDocs(q);
      const sucursales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return sucursales; // Retornamos las sucursales como un array de objetos
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  async eliminarSucursal(idEmpresa: string, id: any) {
    try {
      if (id) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'sucursales');
        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, id);
        setDoc(subDocRef, { eliminado: true, fechaEliminado: Timestamp.now() }, { merge: true });                        
        return true
      } else {
        return false;
      }

    } catch (error) {
      throw error; // Manejo de errores
    }
  }
}

export default new FireStoreConfiguracion();