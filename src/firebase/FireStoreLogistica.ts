import { firestore } from "@/app/firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
export { firestore };

class FireStoreLogistica {
  async listarUnidadVehicular({
    idEmpresa,
    idUnidad,
  }: {
    idEmpresa: string;
    idUnidad: string;
  }) {
    try {
      // Referencia al documento de la unidad vehicular específica
      const docRef = doc(
        firestore,
        "empresas",
        idEmpresa,
        "unidadVehiculos",
        idUnidad
      );

      // Obtenemos el documento
      const docSnapshot = await getDoc(docRef);

      // Verificamos si el documento existe
      if (!docSnapshot.exists()) {
        throw new Error("La unidad vehicular no existe");
      }

      // Validamos el campo `eliminado` si no existe
      if (!docSnapshot.data().hasOwnProperty("eliminado")) {
        await setDoc(docRef, { eliminado: false }, { merge: true });
      }

      // Verificamos si la unidad vehicular está marcada como eliminada
      const unidadData = docSnapshot.data();
      if (unidadData.eliminado) {
        throw new Error("La unidad vehicular está eliminada");
      }

      // Retornamos los datos de la unidad vehicular
      return {
        id: docSnapshot.id,
        ...unidadData,
      };
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarUnidades(idEmpresa: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "unidades"
      const collectionRef = collection(docRef, "unidadVehiculos");
      // Obtener todos los documentos de la subcolección
      const querySnapshot = await getDocs(collectionRef);

      // Mapear los documentos para devolverlos como un array
      const unidades = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return unidades;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para buscar un proveedor por ID
  async buscarUnidad(idEmpresa: string, idUnidad: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "unidades"
      const collectionRef = collection(docRef, "unidadVehiculos");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idUnidad);
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

  // Actualizar unidad con chofer asignado
  async actualizarUnidad(idEmpresa: string, idUnidad: string, data: any) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const unidadRef = doc(collection(docRef, "unidadVehiculos"), idUnidad);

      // Obtener los datos actuales
      const docSnap = await getDoc(unidadRef);
      const datosActuales = docSnap.data() || {};

      // Actualizar solo los campos necesarios manteniendo el resto
      const updateData = {
        ...datosActuales, // Mantener todos los campos existentes
        nombreChofer: data.nombreChofer,
        choferAsignado: data.choferAsignado,
        fechaAsignacionChofer: data.fechaAsignacionChofer,
        chofer: null, // Eliminar el campo chofer si existe
      };

      await setDoc(unidadRef, updateData); // No usar merge aquí
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new FireStoreLogistica();
