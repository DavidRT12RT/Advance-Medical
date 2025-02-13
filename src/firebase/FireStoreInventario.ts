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
  where,
} from "firebase/firestore";
import { firestore } from "../app/firebaseConfig";
import dayjs from "dayjs";

class FireStoreInventario {
  //* ARTICULOS *\\
  // Método para registrar o actualizar un articulo
  async registrarArticulos(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "articulos");
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, {
          ...values,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar articulos con opción de búsqueda
  async listarArticulos({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "articulos"
      const collectionRef = collection(docRef, "articulos");
      // Crear una consulta ordenada por fechaRegistro
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

  async listarArticulosPorTipoOrigen({
    idEmpresa,
    tipoOrigen,
    origenId,
  }: {
    idEmpresa: string;
    tipoOrigen: "sucursal" | "unidad";
    origenId: string;
  }) {
    try {
      if (!tipoOrigen || !origenId) {
        throw new Error(
          "Debes proporcionar el tipo de origen ('sucursal' o 'unidad') y el ID correspondiente para filtrar los artículos."
        );
      }

      // Referencia al documento de la empresa
      const empresaRef = doc(firestore, "empresas", idEmpresa);

      // Referencia a la colección "inventario"
      const inventarioRef = collection(empresaRef, "inventario");

      // Determinar el campo de filtro basado en el tipo de origen
      const campoFiltro =
        tipoOrigen === "sucursal" ? "sucursal_id" : "unidad_id";

      // Construir la consulta para filtrar por sucursal_id o unidad_id
      const inventarioQuery = query(
        inventarioRef,
        where(campoFiltro, "==", origenId)
      );

      const inventarioSnapshot = await getDocs(inventarioQuery);
      if (inventarioSnapshot.empty) {
        return []; // No hay artículos en la sucursal o unidad especificada
      }

      // Obtener los IDs de los artículos y sus cantidades
      const articulosFiltrados: { articulo_id: string; cantidad: number }[] =
        [];
      inventarioSnapshot.forEach((doc) => {
        const data = doc.data();
        articulosFiltrados.push({
          articulo_id: data.articulo_id,
          cantidad: data.cantidad,
        });
      });

      // Referencia a la colección "articulos"
      const articulosRef = collection(empresaRef, "articulos");

      // Crear una consulta para obtener los detalles de los artículos
      const articulosSnapshot = await getDocs(articulosRef);
      const articulosDetalles = articulosSnapshot.docs.reduce((acc, doc) => {
        const articuloData = doc.data();
        acc[doc.id] = {
          id: doc.id, // Document ID
          alertaInventario: articuloData.alertaInventario || null,
          catalogo: articuloData.catalogo || null,
          categoria: articuloData.categoria || null,
          codigoArticulo: articuloData.codigoArticulo || null,
          codigoBarras: articuloData.codigoBarras || null,
          descripcion: articuloData.descripcion || null,
          estatus: articuloData.estatus || null,
          familia: articuloData.familia || null,
          fechaRegistro: articuloData.fechaRegistro || null,
          marca: articuloData.marca || null,
          presentacion: articuloData.presentacion || null,
          provedoresArticulo: articuloData.provedoresArticulo || [],
          tipoProducto: articuloData.tipoProducto || null,
          tipoUnidad: articuloData.tipoUnidad || null,
        };
        return acc;
      }, {} as Record<string, any>);

      // Combinar los datos de inventario con los detalles de los artículos
      const resultados = articulosFiltrados.map((item) => {
        const articuloDetalles = articulosDetalles[item.articulo_id] || {};
        return {
          id: item.articulo_id,
          cantidad: item.cantidad,
          ...articuloDetalles, // Agregar todos los campos adicionales del artículo
        };
      });

      return resultados;
    } catch (error) {
      console.error("Error al listar artículos por tipo de origen:", error);
      throw error;
    }
  }

  // Método para buscar un articulo por ID
  async buscarArticulo(idEmpresa: string, idArticulo: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "articulos"
      const collectionRef = collection(docRef, "articulos");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idArticulo);
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

  async listarArticulosPorCatalogo(idsArticulos: string[]) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", this.toString());
      // Referencia a la subcolección "articulos"
      const collectionRef = collection(docRef, "articulos");
      // Crea una consulta usando `where` con la condición `in`
      const q = query(
        collectionRef,
        where("__name__", "in", idsArticulos) // `__name__` se usa para referirse al ID del documento
      );

      // Realiza la consulta y procesa los resultados
      const querySnapshot = await getDocs(q);
      const articulosObtenidos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return articulosObtenidos;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para eliminar un articulo (actualizando su estado a 'inactivo')
  async eliminarArticulo(idArticulo: string) {
    try {
      const articuloRef = doc(firestore, "empresas", idArticulo);
      await setDoc(articuloRef, { estatus: "inactivo" }, { merge: true });
      return idArticulo;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async cambiarEstatusArticulo(
    idEmpresa: string,
    idArticulo: string,
    estatus: "Activo" | "Inactivo"
  ) {
    try {
      // Obtener la referencia del documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);

      // Obtener la referencia del documento dentro de la subcolección 'articulos'
      const articuloRef = doc(collection(docRef, "articulos"), idArticulo);

      // Actualizar el estado del artículo (Activo o Inactivo)
      await setDoc(articuloRef, { estatus }, { merge: true });
    } catch (error) {
      console.error("Error al actualizar el artículo:", error);
    }
  }

  //* METODOS PARA CATEGORIAS *\\
  async listarCategorias({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "categorias"
      const collectionRef = collection(docRef, "categorias");
      // Crear una consulta ordenada por fechaRegistro
      const q = query(collectionRef, orderBy("fechaRegistro", "desc"));

      const arrayCategorias: any[] = [];
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        arrayCategorias.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return arrayCategorias;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  //* METODOS PARA CATALOGOS *\\

  // Método para registrar o actualizar un catalogo
  async registrarCatalogo(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "catalogos");
      if (id) {
        // Referencia al nuevo documento con el ID específico
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true }); // Actualizamos usando merge: true
      } else {
        // Si no hay id, creamos un nuevo documento
        const docRef = await addDoc(collectionRef, {
          ...values,
          fechaRegistro: Timestamp.now(),
        });
        return docRef.id; // Retornamos el nuevo id
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // Método para listar catalogos con opción de búsqueda
  async listarCatalogos({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "catalogos"
      const collectionRef = collection(docRef, "catalogos");
      // Crear una consulta ordenada por fechaRegistro
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

  // Método para buscar un catalogo por ID
  async buscarCatalogo(idEmpresa: string, idCatalogo: string) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "catalogos"
      const collectionRef = collection(docRef, "catalogos");
      // Referencia al documento
      const subDocRef = doc(collectionRef, idCatalogo);
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

  // Método para eliminar un catalogo (actualizando su estado a 'inactivo')
  async eliminarCatalogo(idCatalogo: string) {
    try {
      const catalogoRef = doc(firestore, "catalogos", idCatalogo);
      await setDoc(catalogoRef, { estatus: "inactivo" }, { merge: true });
      return idCatalogo;
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  // COLECCIONES DE UNA O PARA UNA SOLA EMPRESA
  async agregarDocumentoEmpresasCollection(
    idEmpresa: any,
    idDocumento: string,
    dataDelDocumento: any,
    nameCollection: any
  ) {
    try {
      // Referencia al documento específico de la empresas
      const empresaRef = doc(firestore, "empresas", idEmpresa);

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

  //* MÉTODOS PARA PROVEEDORES *\\

  // Método para registrar o actualizar un proveedor
  async registrarProveedor(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "proveedores");
      if (id) {
        const subDocRef = doc(collectionRef, id);
        await setDoc(subDocRef, values, { merge: true });
      } else {
        const newDocRef = await addDoc(collectionRef, {
          ...values,
          fechaRegistro: Timestamp.now(),
        });
        return newDocRef.id;
      }
    } catch (error) {
      throw error;
    }
  }

  // Método para listar proveedores de una empresa
  async listarProveedores(idEmpresa: string) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "proveedores");
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
      throw error;
    }
  }

  // Método para buscar un proveedor por ID
  async buscarProveedor(idEmpresa: string, idProveedor: string) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "proveedores");
      const subDocRef = doc(collectionRef, idProveedor);
      const docSnap = await getDoc(subDocRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar un proveedor (actualizando su estado a 'inactivo')
  async eliminarProveedor(idEmpresa: string, idProveedor: string) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "proveedores");
      const proveedorRef = doc(collectionRef, idProveedor);
      await setDoc(proveedorRef, { estatus: "inactivo" }, { merge: true });
      return idProveedor;
    } catch (error) {
      throw error;
    }
  }
  // Método para registrar o actualizar un usuario
  async registrarSucursal(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección
      const collectionRef = collection(docRef, "sucursales");
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
  // Método para listar sucursales con opción de búsqueda
  async listarSucursales({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "sucursales");

      //validating post eliminados
      const validating = await getDocs(collection(docRef, "sucursales"));
      validating.forEach(async (doc) => {
        if (!doc.data().hasOwnProperty("eliminado")) {
          const docRef = doc.ref;
          await setDoc(docRef, { eliminado: false }, { merge: true });
        }
      });

      // Crear una consulta ordenada por fechaRegistro
      const q = query(
        collectionRef,
        where("eliminado", "==", false),
        orderBy("fechaRegistro", "desc")
      );

      // Obtenemos los documentos de la subcolección
      const querySnapshot = await getDocs(q);
      const sucursales = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return sucursales; // Retornamos las sucursales como un array de objetos
    } catch (error) {
      throw error; // Manejo de errores
    }
  }
  // Método para obtener una sucursal específica por idEmpresa e idSucursal
  async listarSucursal({
    idEmpresa,
    idSucursal,
  }: {
    idEmpresa: string;
    idSucursal: string;
  }) {
    try {
      // Referencia al documento de la sucursal específica
      const docRef = doc(
        firestore,
        "empresas",
        idEmpresa,
        "sucursales",
        idSucursal
      );

      // Obtenemos el documento
      const docSnapshot = await getDoc(docRef);

      // Verificamos si el documento existe
      if (!docSnapshot.exists()) {
        throw new Error("La sucursal no existe");
      }

      // Validamos el campo `eliminado` si no existe
      if (!docSnapshot.data().hasOwnProperty("eliminado")) {
        await setDoc(docRef, { eliminado: false }, { merge: true });
      }

      // Verificamos si la sucursal está marcada como eliminada
      const sucursalData = docSnapshot.data();
      if (sucursalData.eliminado) {
        throw new Error("La sucursal está eliminada");
      }

      // Retornamos los datos de la sucursal
      return {
        id: docSnapshot.id,
        ...sucursalData,
      };
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  async eliminarSucursal(idEmpresa: string, id: any) {
    try {
      if (id) {
        const docRef = doc(firestore, "empresas", idEmpresa);
        const collectionRef = collection(docRef, "sucursales");
        // Eliminar el documento con el ID proporcionado
        const subDocRef = doc(collectionRef, id);
        setDoc(
          subDocRef,
          { eliminado: true, fechaEliminado: Timestamp.now() },
          { merge: true }
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  //Unidades
  // Método para registrar o actualizar una unidad
  async registrarUnidad(idEmpresa: string, data: any) {
    try {
      const { id, ...values } = data;
      // Referencia al documento específico
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "unidades"
      const collectionRef = collection(docRef, "unidades");
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

  // Método para listar unidades con opción de búsqueda
  async listarUnidades({ idEmpresa }: { idEmpresa: string }) {
    try {
      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "unidades");

      // Consulta para obtener todas las unidades
      const q = query(collectionRef);

      // Obtenemos los documentos de la subcolección
      const querySnapshot = await getDocs(q);

      // Mapeo de los documentos a objetos
      const unidades = querySnapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento
        ...doc.data(),
      }));

      return unidades;
    } catch (error) {
      console.error("Error al listar unidades:", error);
      throw error; // Manejo de errores
    }
  }

  // Método para eliminar una unidad (marcado como eliminado)
  async eliminarUnidad(idEmpresa: string, id: string) {
    try {
      if (id) {
        const docRef = doc(firestore, "empresas", idEmpresa);
        const collectionRef = collection(docRef, "unidades");
        // Marcar el documento como eliminado
        const subDocRef = doc(collectionRef, id);
        await setDoc(
          subDocRef,
          {
            eliminado: true,
            fechaEliminado: Timestamp.now(),
          },
          { merge: true }
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error; // Manejo de errores
    }
  }

  //Transferencias
  // Método para registrar o actualizar una transferencia
  async registrarTransferencia(idEmpresa: string, data: any) {
    try {
      const { id, origen, destino, articulos, usuario, descripcion } = data;

      if (origen === destino) {
        throw new Error("El origen y el destino no pueden ser iguales.");
      }

      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "transferencias");

      // Obtener fecha formateada con dayjs
      const fechaActual = dayjs().format("YYYY-MM-DD HH:mm:ss");

      if (id) {
        const subDocRef = doc(collectionRef, id);
        await setDoc(
          subDocRef,
          {
            origen,
            destino,
            articulos,
            usuario,
            descripcion,
            fechaActualizacion: fechaActual, // Guardar la fecha formateada
          },
          { merge: true }
        );
      } else {
        const newDocRef = await addDoc(collectionRef, {
          origen,
          destino,
          articulos,
          eliminado: false,
          usuario,
          descripcion,
          fechaRegistro: fechaActual, // Guardar la fecha formateada
        });
        return newDocRef?.id;
      }
    } catch (error) {
      throw error; // Propagamos el error
    }
  }

  // Método para listar transferencias
  async listarTransferencias(idEmpresa: string) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "transferencias");

      // Ordenar por fechaRegistro en orden descendente
      const q = query(collectionRef, orderBy("fechaRegistro", "desc"));

      // Ejecutar consulta
      const querySnapshot = await getDocs(q);
      const transferencias = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return transferencias;
    } catch (error) {
      throw error; // Propagamos el error
    }
  }

  // Método para eliminar una transferencia (marcado como eliminado)
  async eliminarTransferencia(idEmpresa: string, id: string) {
    try {
      if (!id) throw new Error("El ID de la transferencia no es válido.");

      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "transferencias");
      const subDocRef = doc(collectionRef, id);

      // Marcamos la transferencia como eliminado
      await setDoc(
        subDocRef,
        {
          eliminado: true,
          fechaEliminado: Timestamp.now(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      throw error; // Propagamos el error
    }
  }
  async listarListasDePrecios({ idEmpresa }: { idEmpresa: string }) {
    try {
      console.log(
        "FireStoreInventario - Intentando obtener listas de precios para empresa:",
        idEmpresa
      );

      // Referencia al documento de la empresa
      const docRef = doc(firestore, "empresas", idEmpresa);
      // Referencia a la subcolección "listasDePrecios"
      const listasRef = collection(docRef, "listasDePrecios");
      // Crear una consulta para obtener las listas de precios no eliminadas
      const q = query(
        listasRef,
        where("eliminado", "==", false)
      );

      console.log("FireStoreInventario - Ejecutando consulta...");
      const querySnapshot = await getDocs(q);
      
      console.log("FireStoreInventario - Documentos encontrados:", querySnapshot.size);
      
      const result = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("FireStoreInventario - Datos de lista:", {
          id: doc.id,
          nombre: data.nombre,
          clientes: data.clientes,
          articulosCount: data.articulos?.length
        });
        return {
          id: doc.id,
          ...data,
        };
      });

      console.log("FireStoreInventario - Listas encontradas:", result.length);
      return result;
    } catch (error) {
      console.error(
        "FireStoreInventario - Error al listar listas de precios:",
        error
      );
      throw error;
    }
  }

  //Movimientos
  //Movimientos
  // Método para registrar o actualizar un movimiento
  async registrarMovimiento(idEmpresa: string, data: any) {
    try {
      const { id } = data;

      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "movimientos");

      if (id) {
        // Si se proporciona un ID, actualizamos el documento existente
        const subDocRef = doc(collectionRef, id);
        await setDoc(
          subDocRef,
          {
            ...data,
          },
          { merge: true }
        );
      } else {
        // Si no se proporciona un ID, creamos un nuevo documento
        const newDocRef = await addDoc(collectionRef, {
          ...data,
          eliminado: false,
        });
        return newDocRef?.id;
      }
    } catch (error) {
      throw error;
    }
  }

  // Método para listar movimientos
  async listarMovimientos(idEmpresa: string) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "movimientos");

      // Ordenar por fechaRegistro en orden descendente
      const q = query(collectionRef, orderBy("fecha", "desc"));

      // Ejecutar consulta
      const querySnapshot = await getDocs(q);
      const movimientos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return movimientos;
    } catch (error) {
      throw error; // Propagamos el error
    }
  }

  // Método para eliminar un movimiento (marcar como eliminado)
  async eliminarMovimiento(idEmpresa: string, id: string) {
    try {
      if (!id) throw new Error("El ID del movimiento no es válido.");

      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "movimientos");
      const subDocRef = doc(collectionRef, id);

      // Marcamos el movimiento como eliminado
      await setDoc(
        subDocRef,
        {
          eliminado: true,
          fechaEliminado: Timestamp.now(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      throw error; // Propagamos el error
    }
  }

  //Inventarios
  // Método para actualizar el inventario al transferir artículos
  async actualizarInventario({
    idEmpresa,
    tipoOrigen,
    origen,
    tipoDestino,
    destino,
    articulos,
    entradaInventarioPorCompra = false,
  }: {
    idEmpresa: string;
    tipoOrigen?: "sucursal" | "unidad";
    origen: string | null;
    tipoDestino: "sucursal" | "unidad";
    destino: string;
    articulos: { articulo_id: string; cantidad: number }[];
    entradaInventarioPorCompra?: boolean;
  }) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "inventario");

      for (const articulo of articulos) {
        const { articulo_id, cantidad } = articulo;

        if (!entradaInventarioPorCompra) {
          // Campo dinámico para el origen
          const campoOrigen =
            tipoOrigen === "sucursal" ? "sucursal_id" : "unidad_id";
          const origenQuery = query(
            collectionRef,
            where("articulo_id", "==", articulo_id),
            where(campoOrigen, "==", origen)
          );

          const origenSnapshot = await getDocs(origenQuery);

          if (!origenSnapshot.empty) {
            const origenDoc = origenSnapshot.docs[0];
            const origenData = origenDoc.data();

            // Reducir la cantidad del origen
            const nuevaCantidadOrigen = origenData.cantidad - cantidad;

            if (nuevaCantidadOrigen < 0) {
              throw new Error(
                `No hay suficiente cantidad en el origen para el artículo con ID: ${articulo_id}`
              );
            }

            // Actualizar el documento del origen
            await setDoc(
              origenDoc.ref,
              {
                cantidad: nuevaCantidadOrigen,
              },
              { merge: true }
            );
          } else {
            throw new Error(
              `El artículo con ID: ${articulo_id} no existe en el inventario del origen.`
            );
          }
        }

        // Campo dinámico para el destino
        const campoDestino =
          tipoDestino === "sucursal" ? "sucursal_id" : "unidad_id";
        const destinoQuery = query(
          collectionRef,
          where("articulo_id", "==", articulo_id),
          where(campoDestino, "==", destino)
        );

        const destinoSnapshot = await getDocs(destinoQuery);

        if (!destinoSnapshot.empty) {
          const destinoDoc = destinoSnapshot.docs[0];
          const destinoData = destinoDoc.data();

          // Incrementar la cantidad del destino
          const nuevaCantidadDestino = destinoData.cantidad + cantidad;

          // Actualizar el documento del destino
          await setDoc(
            destinoDoc.ref,
            {
              cantidad: nuevaCantidadDestino,
            },
            { merge: true }
          );
        } else {
          // Si el destino no existe, crearlo
          await addDoc(collectionRef, {
            articulo_id,
            cantidad,
            [campoDestino]: destino,
            origen,
            tipoOrigen: "compra",
          });
        }
      }
    } catch (error) {
      console.error("Error al actualizar el inventario:", error);
      throw error;
    }
  }

  async listarInventarios({ idEmpresa }: { idEmpresa: string }) {
    try {
      const docRef = doc(firestore, "empresas", idEmpresa);
      const collectionRef = collection(docRef, "inventario");

      const querySnapshot = await getDocs(collectionRef);
      const inventarios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return inventarios;
    } catch (error) {
      throw new Error("Error al obtener los inventarios");
    }
  }
}

export default new FireStoreInventario();
