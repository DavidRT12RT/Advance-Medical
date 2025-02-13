import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  loading: false,
  openDrawer: false,
  listaDeEmpresas: [],
  refresh: Math.random(),
  detalleDeSolicitud: null,
  loadingTable: false,
  // google maps 
  coordinates: { lat: null, lng: null },
  address: "",
};

export const administracionSlice = createSlice({
  name: 'administracion',
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
    setListaDeEmpresas: (state, action) => {
      state.listaDeEmpresas = action.payload;
    },
    setDetalleDeSolicitud: (state, action) => {
      state.detalleDeSolicitud = action.payload;
    },
    // google maps
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },

  },
});

// Action creators are generated for each case reducer function
export const {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setListaDeEmpresas,
  setLoadingTable,
  setDetalleDeSolicitud,
  setCoordinates,
  setAddress,
} = administracionSlice.actions;

export default administracionSlice.reducer;