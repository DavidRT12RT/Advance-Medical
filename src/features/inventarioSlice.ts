import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  loading: false,
  loadingTable: false,
  loadingDetalle: false,
  openDrawer: false,
  refresh: Math.random(),
  especEmpresa: null,
  refreshTable:false,

  // Articulos
  listaDeArticulos: [],
  detalleArticulo: null,
  newArticuloId:null,

  // Catalogos
  listaDeCatalogos: [],
  detalleCatalogo: null,
  multipleAddresses: [],
  articuloTemporal: null,
  modalInformacionDelArticulo: false,
  openDrawerArticulo: false,
  catalogoTemporal: null,
  modalInformacionDelCatalogo: false,
  subCollectionEmpresa: {},
  refreshSubCollection: null,
  openDrawerDetalleCatalogo: false,
  listaCatalogoDetalleArticulo: [],
  listaDeMovimientos: [],

  //Proveedores
  listaDeProvedores: [],
  detalleProvedor: null,

  //Inventarios
  listaDeInventarios:[],
  // listaDeInventarios: [
  //   {
  //     key: "1",
  //     codigoInventario: "INV001",
  //     descripcion: "Inventario de electrónicos",
  //     reservado: 10,
  //     cantidad: 150,
  //     sucursal: { id: "F6lNzaxKqCYGml5UR7ho", nombre: "TERMINAL FIORI" },
  //     articulos: [
  //       {
  //         id: "8Bi01GApfAqMW8mqrUk0",
  //         descripcion: "PRUEBA",
  //         codigoArticulo: "381851",
  //       },
  //       {
  //         id: "9EVEWJCsgGLjCYmTsHhA",
  //         descripcion: "ARTICULO 1",
  //         codigoArticulo: "543566",
  //       },
  //     ],
  //     estatus: true,
  //   },
  //   {
  //     key: "2",
  //     codigoInventario: "INV002",
  //     descripcion: "Inventario de ropa",
  //     reservado: 5,
  //     cantidad: 200,
  //     sucursal: { id: "2JNrPZDjX3PYKU2hhXK9", nombre: "PLAZA NORTE" },
  //     articulos: [
  //       {
  //         id: "H48k4GqmyITh3S1wvYsH",
  //         descripcion: "CAMISETA",
  //         codigoArticulo: "aQdF7T",
  //       },
  //     ],
  //     estatus: false,
  //   },
  //   {
  //     key: "3",
  //     codigoInventario: "INV003",
  //     descripcion: "Inventario de alimentos",
  //     reservado: 20,
  //     cantidad: 300,
  //     sucursal: { id: "kBlJAU2d6eVjmOR8BXG4", nombre: "CENTRO" },
  //     articulos: [
  //       {
  //         id: "oz5z4iURvIh0HxynyPm4",
  //         descripcion: "lendes de sol",
  //         codigoArticulo: "321233",
  //       },
  //     ],
  //     estatus: true,
  //   },
  //   {
  //     key: "4",
  //     codigoInventario: "INV004",
  //     descripcion: "Inventario de muebles",
  //     reservado: 2,
  //     cantidad: 80,
  //     sucursal: { id: "cAN5W8kARXZa982tHZH6", nombre: "nueva sucursal" },
  //     articulos: [
  //       {
  //         id: "Qjy0RmFIf1mEVlJuUS8l",
  //         descripcion: "GORRAS 3",
  //         codigoArticulo: "T5dc3M",
  //       },
  //     ],
  //     estatus: true,
  //   },
  //   {
  //     key: "5",
  //     codigoInventario: "INV005",
  //     descripcion: "Inventario de cosméticos",
  //     reservado: 0,
  //     cantidad: 500,
  //     sucursal: { id: "cAN5W8kARXZa982tHZH6", nombre: "nueva sucursal" },
  //     articulos: [
  //       {
  //         id: "VSWKoqI2ofyhjJD9CtnO",
  //         descripcion: "GORRAS",
  //         codigoArticulo: "r77nRo",
  //       },
  //       {
  //         id: "lDm4tdUOdCTLL8y50iLt",
  //         descripcion: "LENTES DE SOL",
  //         codigoArticulo: "LDgtce",
  //       },
  //     ],
  //     estatus: false,
  //   },
  // ], // -> Data Dummy para la prueba de inventarios
  detalleInventario: null,

  //Transferencias
  listaDeTransferencias: [],
  detalleTransferencia: null,
  openDrawerTransferencias: false,
  loadingTransferencia: false,
  refreshTransferencias: false,

  //Unidades
  listaDeUnidades: [],
  detalleUnidad: null,

  //Unidades Vehiculares
  listaDeUnidadesVehiculares: [],
  detalleUnidadVehicular: null,

  //Sucursales(bodegas)
  listaDeSucursales: [],
  detalleSucursal: null,

  //Categorias
  listaDeCategorias: [],
  detalleCategoria: null,
};

export const inventarioSlice = createSlice({
  name: "inventario",
  initialState,
  reducers: {
    setRefreshTable:(state,action) => {
      state.refreshTable = action.payload;
    },
    setLoadingTable: (state, action) => {
      state.loadingTable = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOpenDrawer: (state, action) => {
      state.openDrawer = action.payload;
    },
    setEspecEmpresa: (state, action) => {
      state.especEmpresa = action.payload;
    },
    // Artículos
    setListaDeArticulos: (state, action) => {
      state.listaDeArticulos = action.payload;
    },
    setDetalleArticulos: (state, action) => {
      state.detalleArticulo = action.payload;
    },
    setRefresh: (state, action) => {
      state.refresh = action.payload;
    },
    setNewArticuloId:(state,action) => {
      state.newArticuloId = action.payload;
    },
    // Catálogos
    setListaDeCatalogos: (state, action) => {
      state.listaDeCatalogos = action.payload;
    },
    setDetalleCatalogos: (state, action) => {
      state.detalleCatalogo = action.payload;
    },
    setloadingDetalle: (state, action) => {
      state.loadingDetalle = action.payload;
    },
    // Artículo temporal
    setArticuloTemporal: (state, action) => {
      state.articuloTemporal = action.payload;
    },
    setModalInformacionDelArticulo: (state, action) => {
      state.modalInformacionDelArticulo = action.payload;
    },
    setOpenDrawerArticulo: (state, action) => {
      state.openDrawerArticulo = action.payload;
    },
    // Catálogo temporal
    setCatalogoTemporal: (state, action) => {
      state.catalogoTemporal = action.payload;
    },
    setModalInformacionDelCatalogo: (state, action) => {
      state.modalInformacionDelCatalogo = action.payload;
    },
    setSubCollectionEmpresa: (state, action) => {
      state.subCollectionEmpresa = action.payload;
    },
    setRefreshSubCollection: (state, action) => {
      state.refreshSubCollection = action.payload;
    },
    setOpenDrawerDetalleCatalogo: (state, action) => {
      state.openDrawerDetalleCatalogo = action.payload;
    },
    setListaCatalogoDetalleArticulo: (state, action) => {
      state.listaCatalogoDetalleArticulo = action.payload;
    },
    setListaDeMovimientos: (state, action) => {
      state.listaDeMovimientos = action.payload;
    },
    // Proveedores
    setListaDeProvedores: (state, action) => {
      state.listaDeProvedores = action.payload;
    },
    setListaDeInventarios: (state, action) => {
      state.listaDeInventarios = action.payload;
    },

    //Transferencias
    setListaDeTransferencias: (state, action) => {
      state.listaDeTransferencias = action.payload;
    },
    setDetalleTransferencia: (state, action) => {
      state.detalleTransferencia = action.payload;
    },
    setLoadingTransferencia: (state, action) => {
      state.loadingTransferencia = action.payload;
    },
    setOpenDrawerTransferencia: (state, action) => {
      state.openDrawerTransferencias = action.payload;
    },
    setRefreshTransferencias: (state, action) => {
      state.refreshTransferencias = action.payload;
    },

    //Sucursales
    setListaDeSucursales: (state, action) => {
      state.listaDeSucursales = action.payload;
    },
    setDetalleSucursal: (state, action) => {
      state.detalleSucursal = action.payload;
    },

    //Unidades
    setListaDeUnidades: (state, action) => {
      state.listaDeUnidades = action.payload;
    },

    //Unidades vehiculares
    setListaDeUnidadesVehiculares: (state, action) => {
      state.listaDeUnidadesVehiculares = action.payload;
    },
    setDetalleUnidadVehicular: (state, action) => {
      state.detalleUnidadVehicular = action.payload;
    },

    //Categorias
    setListaDeCategorias: (state, action) => {
      state.listaDeCategorias = action.payload;
    },
  },
});

// Exportar las acciones
export const {
  setLoading,
  setRefreshTable,
  setOpenDrawer,
  setRefresh,
  setLoadingTable,
  setloadingDetalle,
  setNewArticuloId,
  setListaDeArticulos,
  setDetalleArticulos,
  setListaDeCatalogos,
  setDetalleCatalogos,
  setArticuloTemporal,
  setModalInformacionDelArticulo,
  setEspecEmpresa,
  setOpenDrawerArticulo,
  setCatalogoTemporal,
  setModalInformacionDelCatalogo,
  setSubCollectionEmpresa,
  setRefreshSubCollection,
  setOpenDrawerDetalleCatalogo,
  setListaCatalogoDetalleArticulo,
  setListaDeMovimientos,
  setListaDeProvedores,
  setListaDeInventarios,

  setOpenDrawerTransferencia,
  setDetalleTransferencia,
  setListaDeTransferencias,
  setLoadingTransferencia,
  setRefreshTransferencias,

  setListaDeUnidades,
  setListaDeSucursales,

  setListaDeUnidadesVehiculares,
  setDetalleUnidadVehicular,

  setDetalleSucursal,

  setListaDeCategorias,
} = inventarioSlice.actions;

export default inventarioSlice.reducer;
