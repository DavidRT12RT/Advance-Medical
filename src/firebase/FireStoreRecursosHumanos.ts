import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore, storage } from "../app/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

class FireStoreRecursosHumanos {
  // Método para registrar o actualizar un adicionales de nominas
  async registrarNominas(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "nominas");
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, {
          ...values,
          eliminado: false,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar nominas
  async listarNominas({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "nominas"
      const collectionRef = collection(docRef, "nominas");
      // Obtener todos los documentos de la subcolección
      const q = query(collectionRef, orderBy("fechaRegistro", "desc"));

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

  // Método para buscar una nomina por ID
  async buscarNominas(idEmpresa: string, idNomina: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "nominas"
      const collectionRef = collection(docRef, "nominas");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idNomina);
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
  // Método para registrar o actualizar un adicionales de nominas
  async registrarAdicionalesNominas(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "adicionalesNominas");
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, {
          ...values,
          eliminado: false,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar adicionalesNominas
  async listarAdicionalesNominas({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "unidades"
      const collectionRef = collection(docRef, "adicionalesNominas");
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

  // Método para buscar un adicionalesNominas por ID
  async buscarAdicionalesNominas(idEmpresa: string, idAdicional: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "adicionalesNominas"
      const collectionRef = collection(docRef, "adicionalesNominas");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idAdicional);
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
  // Método para registrar o actualizar un incapacidades de nominas
  async registrarIncapacidadesNominas(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "incapacidadesNominas");
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, {
          ...values,
          eliminado: false,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar incapacidadesNominas
  async listarIncapacidadesNominas({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "unidades"
      const collectionRef = collection(docRef, "incapacidadesNominas");
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

  // Método para buscar un incapacidadesNominas por ID
  async buscarIncapacidadesNominas(idEmpresa: string, idIncapacidad: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "incapacidadesNominas"
      const collectionRef = collection(docRef, "incapacidadesNominas");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idIncapacidad);
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
  async registrarUsuario(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const userRef = doc(firestore, "usuarios", id);
        await setDoc(userRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collection(firestore, "usuarios"), {
          ...values,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar usuarios con opción de búsqueda
  async listarUsuarios({ idEmpresa }: { idEmpresa: string }) {
    try {
      let q;
      if (idEmpresa) {
        q = query(
          collection(firestore, "usuarios"),
          where("idEmpresa", "==", idEmpresa.trim()),
          orderBy("fechaRegistro", "desc")
        );
      } else {
        q = query(
          collection(firestore, "usuarios"),
          orderBy("fechaRegistro", "desc")
        );
      }

      const arrayObject: any[] = [];
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        arrayObject.push({
          id: doc.id,
          ...data,
          // Convertir timestamps a formato serializable de manera segura
          fechaRegistro:
            data.fechaRegistro instanceof Timestamp
              ? data.fechaRegistro.toDate().toISOString()
              : data.fechaRegistro,
          fechaActualizacion:
            data.fechaActualizacion instanceof Timestamp
              ? data.fechaActualizacion.toDate().toISOString()
              : data.fechaActualizacion,
          fechaEliminado:
            data.fechaEliminado instanceof Timestamp
              ? data.fechaEliminado.toDate().toISOString()
              : data.fechaEliminado,
        });
      });

      return arrayObject;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar un usuario por ID
  async buscarUsuario(idUsuario: any) {
    try {
      // Referencia al documento
      const docRef = doc(firestore, "usuarios", idUsuario?.toString());
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

  //Metodo para subir archivos del perfil del usuario
  async subirArchivos(idUsuario: any, fileList: any[]) {
    try {
      const uploadedFiles = await Promise.all(
        fileList.map(async (item: any) => {
          const nombreArchivo = item.originFileObj.name;
          const descripcionArchivo = item.customName || "";
          const storageRef = ref(
            storage,
            `usuariosFiles/${idUsuario}/${nombreArchivo}`
          );

          await uploadBytes(storageRef, item.originFileObj);

          const downloadURL = await getDownloadURL(storageRef);

          return {
            name: nombreArchivo,
            url: downloadURL,
            description: descripcionArchivo,
          };
        })
      );

      const userRef = doc(firestore, "usuarios", idUsuario);
      await updateDoc(userRef, {
        archivos: arrayUnion(...uploadedFiles),
      });
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  // async eliminarUsuario(data: any) {
  //   try {
  //     const { id, ...values } = data;
  //     if (id) {
  //       const userRef = doc(firestore, "usuarios", id);
  //       await setDoc(
  //         userRef,
  //         {
  //           ...values,
  //           fechaEliminado: Timestamp.now(),
  //           eliminado: true,
  //         },
  //         { merge: true }
  //       );
  //       return { success: true, id }; // Retorna un objeto indicando éxito
  //     } else {
  //       return { success: false, message: "ID no proporcionado" };
  //     }
  //   } catch (error) {
  //     console.error("Error eliminando usuario:", error);
  //     throw error; // Sigue lanzando el error
  //   }
  // }

  async eliminarUsuario(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const userRef = doc(firestore, "usuarios", id);
        await setDoc(
          userRef,
          { ...values, fechaEliminado: Timestamp.now(), eliminado: true },
          { merge: true }
        ); // Actualizamos usando merge: true
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para verificar si un email ya existe
  async checkDuplicateEmail(email: string, currentUserId?: string) {
    try {
      const q = query(
        collection(firestore, "usuarios"),
        where("email", "==", email.trim().toLowerCase())
      );

      const querySnapshot = await getDocs(q);

      // Si no hay documentos, no hay duplicados
      if (querySnapshot.empty) return false;

      // Si estamos editando un usuario
      if (currentUserId) {
        // Verificar todos los documentos encontrados
        // Si hay algún email duplicado que no sea del usuario actual, es un duplicado
        return querySnapshot.docs.some((doc) => doc.id !== currentUserId);
      }

      // Si estamos creando un nuevo usuario, cualquier coincidencia es un duplicado
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Método para registrar o actualizar un contratación
  async registrarContratacion(data: any) {
    try {
      const { id, ...values } = data;
      if (id) {
        // Si el id está presente, actualizamos el documento existente
        const userRef = doc(firestore, "contrataciones", id);
        await setDoc(userRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collection(firestore, "contrataciones"), {
          ...values,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  // Método para listar contrataciones
  async listarContrataciones({ idEmpresa }: { idEmpresa: string }) {
    try {
      let q;
      if (idEmpresa) {
        q = query(
          collection(firestore, "contrataciones"),
          where("idEmpresa", "==", idEmpresa.trim()),
          orderBy("fechaRegistro", "desc")
        );
      } else {
        q = query(
          collection(firestore, "contrataciones"),
          orderBy("fechaRegistro", "desc")
        );
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
  // Método para buscar una contratación por ID
  async buscarContratacion(idContratacion: any) {
    try {
      // Referencia al documento
      const docRef = doc(
        firestore,
        "contrataciones",
        idContratacion?.toString()
      );
      // Obtener el documento
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Poblamos responsables
        const contratacion: any = docSnap.data();
        const responsables = (contratacion?.personasResponsables || []).map(
          (id: string) => getDoc(doc(firestore, "usuarios", id))
        );

        const responsablesSnapshots = await Promise.all(responsables);
        responsablesSnapshots.forEach((colaborador: any, i) => {
          contratacion["personasResponsables"][i] = {
            id: colaborador?.id,
            ...colaborador.data(),
          };
        });

        return {
          id: docSnap.id,
          ...contratacion,
        };
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async listarPostulantesContratacion(idContratacion: any) {
    try {
      // Referencia al documento específico de la contratación
      const contratacionRef = doc(firestore, "contrataciones", idContratacion);

      // Referencia a la subcolección postulantes dentro de la contratación
      const postulantesRef = collection(contratacionRef, "postulantes");

      // Obtener todos los documentos de la subcolección postulantes
      const postulantesSnapshot = await getDocs(postulantesRef);

      // Mapear los documentos a un array con los datos
      const postulantesList = postulantesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Imprimir la lista de postulantes en consola (puedes usar esto para renderizar en la UI)
      console.log("Lista de postulantes:", postulantesList);

      return postulantesList;
    } catch (error) {
      console.error("Error al obtener los postulantes: ", error);
      return [];
    }
  }

  // Método para buscar un usuario por ID
  async agregarPostulanteContratacion(
    idContratacion: any,
    idPostulante: string,
    dataPostulante: any
  ) {
    try {
      // Referencia al documento específico de la contratación
      const contratacionRef = doc(firestore, "contrataciones", idContratacion);

      // Referencia a la subcolección postulantes dentro de la contratación
      const postulantesRef = collection(contratacionRef, "postulantes");

      // Referencia al nuevo documento con el ID específico
      const nuevoPostulanteRef = doc(postulantesRef, idPostulante);

      // Establecer el documento con el ID específico, utilizando merge para actualizar sin sobrescribir
      await setDoc(nuevoPostulanteRef, dataPostulante, { merge: true });
      return nuevoPostulanteRef.id; // Retorna el ID asignado
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  /* async agregarPostulanteContratacion(idContratacion: any, dataPostulante: any) {
    try {
      // Referencia al documento específico de la contratación
      const contratacionRef = doc(firestore, 'contrataciones', idContratacion);

      // Referencia a la subcolección postulantes dentro de la contratación
      const postulantesRef = collection(contratacionRef, 'postulantes');

      // Agregar un nuevo documento a la subcolección postulantes
      const postulante = await addDoc(postulantesRef, dataPostulante);
      return postulante.id;
    } catch (error) {
      throw error; // Manejo de errores
    }
  } */
  async buscarPostulante(idContratacion: any, idPostulante: any) {
    try {
      // Referencia al documento específico del postulante
      const postulanteRef = doc(
        firestore,
        "contrataciones",
        idContratacion,
        "postulantes",
        idPostulante
      );

      // Obtener el documento del postulante
      const postulanteSnap = await getDoc(postulanteRef);

      if (postulanteSnap.exists()) {
        const postulanteData = postulanteSnap.data();
        return { id: postulanteSnap.id, ...postulanteData };
      } else {
        console.log("No existe un postulante con ese ID");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el postulante: ", error);
      throw error; // Manejo de errores
    }
  }

  // LISTAR LAS SUBCOLECCTION DE UNA EMPRESA
  async listarSubCollectionEmpresa(idEmpresa: string, subCollection: string) {
    try {
      // Referencia al documento específico de la contratación
      const contratacionRef = doc(firestore, "empresas", idEmpresa);

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
      console.log("Lista de subcollection:", postulantesList);

      return postulantesList;
    } catch (error) {
      console.error("Error al obtener los postulantes: ", error);
      return [];
    }
  }

  //Metodo para eliminar usuario con rol chofer
  async eliminarUsuarioConRolChofer(id: string) {
    try {
      const userRef = doc(firestore, "usuarios", id);
      await deleteDoc(userRef);

      return { success: true, id };
    } catch (error: any) {
      console.error("Error eliminando usuario:", error);
      return { success: false, message: error.message };
    }
  }

  // Método para actualizar un usuario
  async actualizarUsuario({
    idEmpresa,
    id,
    ...data
  }: {
    idEmpresa: string;
    id: string;
    [key: string]: any;
  }) {
    try {
      if (!id) {
        throw new Error("Se requiere el ID del usuario");
      }

      const userRef = doc(firestore, "usuarios", id);
      await setDoc(
        userRef,
        {
          ...data,
          fechaActualizacion: Timestamp.now(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  }
}

export default new FireStoreRecursosHumanos();
