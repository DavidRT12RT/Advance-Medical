import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  loading: false,
  loadingTable: false,
  loadingDetalle: false,
  openDrawer: false,
  refresh: Math.random(),
  // Clientes
  listaDeClientes: [],
  perfilCliente: null,

  // Proveedores
  listaDeProveeedores: [],
  perfilProveedor: null,
  multipleAddresses: [],

  // Poliza de pago
  modalPolizaDePago: false,
  modalTerminosDePago: false,
  listaPoliza: [],
  listaTerminosDePago: [],
  detallePoliza: null,
  detalleTerminosDePago: null,
  polizaTemporal: null,
  terminosDePagoTemporal: null,
  openDrawerPoliza: false,
  openDrawerProveedor: false,
  proveedorRefresh: Math.random(),
  newProveedorId: null,

  // Lista de precios
  openDrawerListaDePrecios: false,
  detalleDeListaDePrecios: null,
  listaDeListaDePrecios: [],
  articuloTemporal: null,
  modalInformacionDelArticulo: false,
  articulosDetalleListaDePrecios: [],
  updateArticulo: false,
  idNuevoCliente: null,
};

export const ventasSlice = createSlice({
  name: 'ventas',
  initialState,
  reducers: {
    setIdNuevoCliente: (state, action) => {
      state.idNuevoCliente = action.payload;
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
    // clientes
    setListaDeClientes: (state, action) => {
      state.listaDeClientes = action.payload;
    },
    setPerfilClientes: (state, action) => {
      state.perfilCliente = action.payload;
    },
    setRefresh: (state, action) => {
      state.refresh = action.payload;
    },
    // proveedores
    setListaDeProveedores: (state, action) => {
      state.listaDeProveedores = action.payload;
    },
    setPerfilProveedores: (state, action) => {
      state.perfilProveedor = action.payload;
    },
    setloadingDetalle: (state, action) => {
      state.loadingDetalle = action.payload;
    },
    setMultipleAddresses: (state, action) => {
      if (JSON.stringify(state.multipleAddresses) !== JSON.stringify(action.payload)) {
        state.multipleAddresses = action.payload;
      }
    },
    // Poliza de pago
    setModalPolizaDePago: (state, action) => {
      state.modalPolizaDePago = action.payload;
    },
    setListaPoliza: (state, action) => {
      state.listaPoliza = action.payload;
    },
    setListaTerminosDePago: (state, action) => {
      state.listaTerminosDePago = action.payload;
    },
    setDetallePoliza: (state, action) => {
      state.detallePoliza = action.payload;
    },
    setDetalleTerminosDePago: (state, action) => {
      state.detalleTerminosDePago = action.payload;
    },
    setModalTerminosDePago: (state, action) => {
      state.modalTerminosDePago = action.payload;
    },
    setPolizaTemporal: (state, action) => {
      state.polizaTemporal = action.payload;
    },
    setTerminosDePagoTemporal: (state, action) => {
      state.terminosDePagoTemporal = action.payload;
    },
    setOpenDrawerPoliza: (state, action) => {
      state.openDrawerPoliza = action.payload;
    },
    setOpenDrawerProveedor: (state, action) => {
      state.openDrawerProveedor = action.payload;
    },
    setProveedorRefresh: (state, action) => {
      state.proveedorRefresh = action.payload;
    },
    setNewProveedorId: (state, action) => {
      state.newProveedorId = action.payload;
    },

    // lista de precios
    setOpenDrawerListaDePrecios: (state, action) => {
      state.openDrawerListaDePrecios = action.payload;
    },
    setDetalleDeListaDePrecios: (state, action) => {
      state.detalleDeListaDePrecios = action.payload;
    },
    setListaDeListaDePrecios: (state, action) => {
      state.listaDeListaDePrecios = action.payload;
    },
    setArticuloTemporal: (state, action) => {
      state.articuloTemporal = action.payload;
    },
    setModalInformacionDelArticulo: (state, action) => {
      state.modalInformacionDelArticulo = action.payload;
    },
    setArticulosDetalleListaDePrecios: (state, action) => {
      state.articulosDetalleListaDePrecios = action.payload;
    },
    setUpdateArticulo: (state, action) => {
      state.updateArticulo = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setLoadingTable,
  setloadingDetalle,
  setMultipleAddresses,
  setListaDeClientes,
  setPerfilClientes,
  setListaDeProveedores,
  setPerfilProveedores,
  setModalPolizaDePago,
  setModalTerminosDePago,
  setPolizaTemporal,
  setTerminosDePagoTemporal,
  setOpenDrawerPoliza,
  setListaPoliza,
  setDetallePoliza,
  setListaTerminosDePago,
  setDetalleTerminosDePago,
  setOpenDrawerProveedor,
  setProveedorRefresh,
  setNewProveedorId,
  setOpenDrawerListaDePrecios,
  setDetalleDeListaDePrecios,
  setListaDeListaDePrecios,
  setArticuloTemporal,
  setModalInformacionDelArticulo,
  setArticulosDetalleListaDePrecios,
  setUpdateArticulo,
  setIdNuevoCliente,
} = ventasSlice.actions;

export default ventasSlice.reducer;