import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { firestore } from '../app/firebaseConfig';

class FireStoreFinanzas {

  // Método para registrar o actualizar un usuario
  async registrarRuta(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'rutas');
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, { ...values, fechaRegistro: Timestamp.now() });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar compras con opción de búsqueda
  async listarRutas({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'rutas');
      // Crear una consulta ordenada por fechaRegistro
      const q = query(collectionRef, orderBy('fechaRegistro', 'desc'),);

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

  // Método para buscar una ruta por ID
  async buscarRuta(idEmpresa: string, idRuta: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "rutas"
      const collectionRef = collection(docRef, 'rutas');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idRuta);
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
  async registrarCompra(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'compras');
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, { ...values, fechaRegistro: Timestamp.now() });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar compras con opción de búsqueda
  async listarCompras({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'compras');
      // Crear una consulta ordenada por fechaRegistro
      const q = query(collectionRef, orderBy('fechaRegistro', 'desc'),);

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
  async buscarCompra(idEmpresa: string, idCompra: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'compras');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idCompra);
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

  async listarProveedoresDeLaCompra(idEmpresa: string, idsProveedores: string[]) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "proveedores"
      const collectionRef = collection(docRef, 'proveedores');
      // Crea una consulta usando `where` con la condición `in`
      const q = query(
        collectionRef,
        where('__name__', 'in', idsProveedores) // `__name__` se usa para referirse al ID del documento
      );

      // Realiza la consulta y procesa los resultados
      const querySnapshot = await getDocs(q);
      const proveedoresObtenidos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return proveedoresObtenidos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarSubCompras(idEmpresa: string, idParent: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'compras');
      // Crea una consulta usando `where` con la condición `in`
      const q = query(
        collectionRef,
        where('idParent', '==', idParent)
      );

      // Realiza la consulta y procesa los resultados
      const querySnapshot = await getDocs(q);
      const itemsObtenidos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return itemsObtenidos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarArticulosDeLaCompra(idEmpresa: string, idsArticulos: string[]) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "articulos"
      const collectionRef = collection(docRef, 'articulos');
      // Crea una consulta usando `where` con la condición `in`
      const q = query(
        collectionRef,
        where('__name__', 'in', idsArticulos) // `__name__` se usa para referirse al ID del documento
      );

      // Realiza la consulta y procesa los resultados
      const querySnapshot = await getDocs(q);
      const articulosObtenidos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return articulosObtenidos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  //*METODOS VENTAS

  async registrarVenta(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'ventas');
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, { ...values, fechaRegistro: Timestamp.now() });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarVentas({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "ventas"
      const collectionRef = collection(docRef, 'ventas');
      // Crear una consulta ordenada por fechaRegistro
      const q = query(collectionRef, orderBy('fechaRegistro', 'desc'),);

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

  async buscarVenta(idEmpresa: string, idVenta: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "ventas"
      const collectionRef = collection(docRef, 'ventas');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idVenta);
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

  async eliminarVenta(idEmpresa: string, id: any) {
    try {
      if (id) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'ventas');
        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, id);
        await deleteDoc(subDocRef);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Agregar Comentarios
  async agregarComentario(empresaId: string, compraId: string, comentario: any) {
    try {
      const comentarioRef = doc(collection(firestore, 'empresas', empresaId, 'compras', compraId, 'comentarios'));
      await setDoc(comentarioRef, {
        ...comentario,
        id: comentarioRef.id,
        fecha: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error; // Manejo de errores
    }
  }

  async listarComentarios(empresaId: string, compraId: string) {
    try {
      const comentariosRef = collection(firestore, 'empresas', empresaId, 'compras', compraId, 'comentarios');
      const q = query(comentariosRef, orderBy('fecha', 'desc'));
      const comentariosSnapshot = await getDocs(q);

      const comentariosList = comentariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate(),
      }));

      console.log('Lista de comentarios:', comentariosList);
      return comentariosList;
    } catch (error) {
      console.error('Error al obtener los comentarios:', error);
      throw error; // Manejo de errores
    }
  }

  // CXP
  async registrarCXP(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'cxp');
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, { ...values, fechaRegistro: Timestamp.now() });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  async listarCXP({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "cxp"
      const collectionRef = collection(docRef, 'cxp');
      // Crear una consulta ordenada por fechaRegistro
      const q = query(collectionRef, orderBy('fechaRegistro', 'desc'),);

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

  async buscarCXP(idEmpresa: string, idVenta: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "cxp"
      const collectionRef = collection(docRef, 'cxp');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idVenta);
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

  // UNIDADES
  async buscarUnidad(idEmpresa: string, idUnidad: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "cxp"
      const collectionRef = collection(docRef, 'unidadVehiculos');
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
  async registrarUnidad(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'unidadVehiculos');
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

  async actualizarUnidad(idEmpresa: string, idUnidad: string, data: any) {
    try {
      const docRef = doc(firestore, 'empresas', idEmpresa, 'unidadVehiculos', idUnidad);
      await updateDoc(docRef, {
        ...data,
        fechaActualizacion: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar la unidad:', error);
      throw error;
    }
  }

  async listarUnidadesVehiculares({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'unidadVehiculos');

      //validating post eliminados
      const validating = await getDocs(collection(docRef, 'unidadVehiculos'))
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

      const querySnapshot = await getDocs(q);
      const unidadesVehiculos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaRegistro: data.fechaRegistro instanceof Timestamp ? data.fechaRegistro.toDate().toISOString() : data.fechaRegistro,
          fechaAsignacionChofer: data.fechaAsignacionChofer instanceof Timestamp ? data.fechaAsignacionChofer.toDate().toISOString() : data.fechaAsignacionChofer,
          fechaActualizacion: data.fechaActualizacion instanceof Timestamp ? data.fechaActualizacion.toDate().toISOString() : data.fechaActualizacion
        };
      });

      return unidadesVehiculos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarUnidades({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "compras"
      const collectionRef = collection(docRef, 'unidadVehiculos');

      //validating post eliminados
      const validating = await getDocs(collection(docRef, 'unidadVehiculos'))
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

      const querySnapshot = await getDocs(q);
      const unidadesVehiculos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaRegistro: data.fechaRegistro instanceof Timestamp ? data.fechaRegistro.toDate().toISOString() : data.fechaRegistro,
          fechaAsignacionChofer: data.fechaAsignacionChofer instanceof Timestamp ? data.fechaAsignacionChofer.toDate().toISOString() : data.fechaAsignacionChofer,
          fechaActualizacion: data.fechaActualizacion instanceof Timestamp ? data.fechaActualizacion.toDate().toISOString() : data.fechaActualizacion
        };
      });

      return unidadesVehiculos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async checkDuplicatePlacas(idEmpresa: string, placas: string, currentUnitId?: string) {
    try {
      const docRef = doc(firestore, 'empresas', idEmpresa);
      const collectionRef = collection(docRef, 'unidadVehiculos');
      const q = query(collectionRef, where('placas', '==', placas));

      const querySnapshot = await getDocs(q);

      // If there's any document with these plates, it's a duplicate
      // When editing, only consider it a duplicate if we find a different document with the same plates
      return querySnapshot.docs.some(doc => currentUnitId ? doc.id !== currentUnitId : true);

    } catch (error) {
      throw error;
    }
  }

  // LISTAR LAS SUBCOLECCTION DE UNA EMPRESA
  async listarSubCollectionEmpresa(idEmpresa: string, subCollection: string) {
    try {
      // Referencia al documento específico de la contratación
      const contratacionRef = doc(firestore, 'empresas', idEmpresa);

      // Referencia a la subcolección postulantes dentro de la contratación
      const postulantesRef = collection(contratacionRef, subCollection);

      // Obtener todos los documentos de la subcolección postulantes
      const postulantesSnapshot = await getDocs(postulantesRef);

      // Mapear los documentos a un array con los datos
      const postulantesList = postulantesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return postulantesList;
    } catch (error) {
      console.error('Error al obtener los postulantes: ', error);
      return [];
    }
  }

  // COLECCIONES DE UNA O PARA UNA SOLA EMPRESA
  async agregarDocumentoEmpresasCollection(idEmpresa: any, idDocumento: string, dataDelDocumento: any, nameCollection: any) {
    try {
      // Referencia al documento específico de la empresas
      const empresaRef = doc(firestore, 'empresas', idEmpresa);

      // Referencia a la subcolección nameCollection dentro de la empresas
      const collectionRef = collection(empresaRef, nameCollection);

      // Referencia al nuevo documento con el ID específico
      const nuevoPostulanteRef = doc(collectionRef, idDocumento);

      // Establecer el documento con el ID específico, utilizando merge para actualizar sin sobrescribir
      await setDoc(nuevoPostulanteRef, dataDelDocumento, { merge: true });
      return nuevoPostulanteRef.id; // Retorna el ID asignado
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  async eliminarUnidad(idEmpresa: string, id: any) {
    try {
      if (id) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'unidadVehiculos');
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

  async eliminarRuta(idEmpresa: string, id: any) {
    try {
      if (id) {

        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'rutas');

        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, id);
        await deleteDoc(subDocRef);
        return true;
      } else {
        return false;
      }

    } catch (error) {
      throw error; // Manejo de errores
    }
  }

}

export default new FireStoreFinanzas();
