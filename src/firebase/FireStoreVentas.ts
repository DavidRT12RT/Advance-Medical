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

class FireStoreVentas {

  // METODOS PARA LISTA DE PRECIOS
  // Método para registrar o actualizar un lista de precios
  async registrarListaDePrecios(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'listasDePrecios');
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

  // Método para listar listas de precios con opción de búsqueda
  async listarListaDePrecios({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "listasDePrecios"
      const collectionRef = collection(docRef, 'listasDePrecios');

      //validating post eliminados
      const validating = await getDocs(collectionRef)
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


  // Método para buscar un proveedor por ID
  async buscarListaDePrecios(idEmpresa: string, idListaDePrecios: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "listasDePrecios"
      const collectionRef = collection(docRef, 'listasDePrecios');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idListaDePrecios);
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


  // Método para eliminar un cliente (actualizando su estado a 'inactivo')
  async eliminarListaDePrecios(idEmpresa: string, idListaDePrecios: string) {
    try {
      if (idListaDePrecios) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'listasDePrecios');

        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, idListaDePrecios);
        setDoc(subDocRef, { eliminado: true, fechaEliminado: Timestamp.now() }, { merge: true });
        return true
      } else {
        return false;
      }

    } catch (error) {
      throw error; // Manejo de errores
    }
  }



  // Método para registrar o actualizar un proveedor
  async registrarProveedor(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'proveedores');
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

  // Método para listar proveedores con opción de búsqueda
  async listarProveedores({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "proveedores"
      const collectionRef = collection(docRef, 'proveedores');

      //validating post eliminados
      const validating = await getDocs(collection(docRef, 'proveedores'))
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


  // Método para buscar un proveedor por ID
  async buscarProveedor(idEmpresa: string, idProveedor: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "proveedores"
      const collectionRef = collection(docRef, 'proveedores');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idProveedor);
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


  // Método para eliminar un cliente (actualizando su estado a 'inactivo')
  async eliminarProveedor(idEmpresa: string, idProveedor: string) {
    try {
      if (idProveedor) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'proveedores');

        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, idProveedor);
        setDoc(subDocRef, { eliminado: true, fechaEliminado: Timestamp.now() }, { merge: true });
        return true
      } else {
        return false;
      }

    } catch (error) {
      throw error; // Manejo de errores
    }
  }


  //* METODOS PARA CLIENTES *\\

  // Método para registrar o actualizar un cliente
  async registrarCliente(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección 
      const collectionRef = collection(docRef, 'clientes');
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

  // Método para listar clientes con opción de búsqueda
  async listarClientes({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "clientes"
      const collectionRef = collection(docRef, 'clientes');

      //validating post eliminados
      const validating = await getDocs(collection(docRef, 'clientes'))
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

      const arrayObject: any[] = [];
      const querySnapshotCliente = await getDocs(q);

      querySnapshotCliente.forEach((doc) => {
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

  // Método para buscar un cliente por ID
  async buscarCliente(idEmpresa: string, idCliente: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, 'empresas', idEmpresa);
      // Referencia a la subcolección "clientes"
      const collectionRef = collection(docRef, 'clientes');
      // Referencia al documento
      const subDocRef = doc(collectionRef, idCliente);
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

  // Método para eliminar un cliente (actualizando su estado a 'inactivo')
  async eliminarCliente(idEmpresa: string, idCliente: string) {
    try {
      if (idCliente) {
        const docRef = doc(firestore, 'empresas', idEmpresa);
        const collectionRef = collection(docRef, 'clientes');

        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, idCliente);
        setDoc(subDocRef, { eliminado: true, fechaEliminado: Timestamp.now() }, { merge: true });
        return true
      } else {
        return false;
      }

    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  //* POLIZA DE PAGO *\\
  async registrarPolizaDePago(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const polizaRef = doc(firestore, 'polizas', id);
        await setDoc(polizaRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collection(firestore, 'polizas'), values);
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listaPolizaDePago({ idCliente }: { idCliente: string }) {
    try {
      let q;
      if (idCliente) {
        q = query(
          collection(firestore, 'polizas'),
          where('idCliente', '==', idCliente.trim())
        );
      } else {
        q = query(collection(firestore, 'polizas'));
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

  //TERMINOS DE PAGO
  async registrarTerminosDePago(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const terminoDePagoRef = doc(firestore, 'terminos_pago', id);
        await setDoc(terminoDePagoRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collection(firestore, 'terminos_pago'), values);
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
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

      // Imprimir la lista de postulantes en consola (puedes usar esto para renderizar en la UI)
      console.log('Lista de subcollection:', postulantesList);

      return postulantesList;
    } catch (error) {
      console.error('Error al obtener los postulantes: ', error);
      return [];
    }
  }

  async listaTerminosDePago({ idCliente }: { idCliente: string }) {
    try {
      let q;
      if (idCliente) {
        q = query(
          collection(firestore, 'terminos_pago'),
          where('idCliente', '==', idCliente.trim())
        );
      } else {
        q = query(collection(firestore, 'terminos_pago'));
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

}

export default new FireStoreVentas();
