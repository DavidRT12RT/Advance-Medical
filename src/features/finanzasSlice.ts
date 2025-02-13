import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  loading: false,
  openDrawer: false,
  listaDeCompras: [],
  listaDeComprasEnTransito: [],
  refresh: Math.random(),
  detalleDeCompra: null,
  loadingTable: false,
  totalDeLaCompra: {},
  //VENTAS
  listaDeVentas: [],
  detalleDeVenta: null,
  totalDeLaVenta: {},
  listaDeComentarios: [],
  // CXP
  listaDeCXP: [],
  detalleDeCXP: null,
  // CXC
  listaDeCXC: [],
  detalleDeCXC: null,

  //UNIDADES ->
  listaDeUnidades: [],
  detalleDeUnidad: null,

  subCollectionEmpresa: {},
  refreshSubCollection: null,
  openDrawerUnidad: false,

  listaDeRutas: [],
  openDrawerRutas: false,
  detalleDeRuta: null,
  newRutaId: null,
  idNuevoProveedor: null,
};

export const finanzasSlice = createSlice({
  name: "finanzas",
  initialState,
  reducers: {
    setIdNuevoProveedor: (state, action) => {
      state.idNuevoProveedor = action.payload;
    },
    setListaDeRutas: (state, action) => {
      state.listaDeRutas = action.payload;
    },
    setOpenDrawerRutas: (state, action) => {
      state.openDrawerRutas = action.payload;
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
    setRefresh: (state, action) => {
      state.refresh = action.payload;
    },
    setListaDeCompras: (state, action) => {
      state.listaDeCompras = action.payload;
    },
    setListaDeComprasEnTransito: (state, action) => {
      state.listaDeComprasEnTransito = action.payload;
    },
    setDetalleDeCompra: (state, action) => {
      state.detalleDeCompra = action.payload;
    },
    setTotalDeLaCompra: (state, action) => {
      state.totalDeLaCompra = action.payload;
    },
    setListaDeVentas: (state, action) => {
      state.listaDeVentas = action.payload;
    },
    setDetalleDeVenta: (state, action) => {
      state.detalleDeVenta = action.payload;
    },
    setTotalDeLaVenta: (state, action) => {
      state.totalDeLaVenta = action.payload;
    },
    setListaDeComentarios: (state, action) => {
      state.listaDeComentarios = action.payload;
    },
    setListaDeCXP: (state, action) => {
      state.listaDeCXP = action.payload;
    },
    setDetalleDeCXP: (state, action) => {
      state.detalleDeCXP = action.payload;
    },
    setListaDeCXC: (state, action) => {
      state.listaDeCXC = action.payload;
    },
    setDetalleDeCXC: (state, action) => {
      state.detalleDeCXC = action.payload;
    },
    setListaDeUnidades: (state, action) => {
      state.listaDeUnidades = action.payload;
    },
    setDetalleDeUnidad: (state, action) => {
      state.detalleDeUnidad = action.payload;
    },
    setSubCollectionEmpresa: (state, action) => {
      state.subCollectionEmpresa = {
        ...state.subCollectionEmpresa,
        ...action.payload
      };
    },
    setRefreshSubCollection: (state, action) => {
      state.refreshSubCollection = action.payload;
    },
    setDetalleDeRuta: (state, action) => {
      state.detalleDeRuta = action.payload;
    },
    setNewRutaId: (state, action) => {
      state.newRutaId = action.payload;
    },
    setOpenDrawerUnidad: (state, action) => {
      state.openDrawerUnidad = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setListaDeCompras,
  setLoadingTable,
  setDetalleDeCompra,
  setTotalDeLaCompra,
  setListaDeVentas,
  setDetalleDeVenta,
  setTotalDeLaVenta,
  setListaDeComentarios,
  setListaDeCXP,
  setDetalleDeCXP,
  setListaDeCXC,
  setDetalleDeCXC,
  setListaDeUnidades,
  setDetalleDeUnidad,
  setSubCollectionEmpresa,
  setRefreshSubCollection,
  setListaDeComprasEnTransito,
  setListaDeRutas,
  setOpenDrawerRutas,
  setDetalleDeRuta,
  setNewRutaId,
  setOpenDrawerUnidad,
  setIdNuevoProveedor,
} = finanzasSlice.actions;

export default finanzasSlice.reducer;
