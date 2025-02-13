import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  loading: false,
  openDrawer: false,
  refresh: Math.random(),
  loadingTable: false,
  listaDeProveedoresFormArticulos: [],
  detalleProvedor:null,
  newProveedorId:null,
};

export const comprasSlice = createSlice({
  name: 'compras',
  initialState,
  reducers: {
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
    setListaDeProveedoresFormArticulos: (state, action) => {
      state.listaDeProveedoresFormArticulos = action.payload;
    },
    setDetalleProvedor:(state, action) => {
      state.detalleProvedor = action.payload;
    },
    setNewProveedorId: (state, action) => {
      state.newProveedorId = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setLoadingTable,
  setListaDeProveedoresFormArticulos,
  setDetalleProvedor,
  setNewProveedorId
} = comprasSlice.actions;

export default comprasSlice.reducer;