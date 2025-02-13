import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  loading: false,
  openDrawer: false,
  listaDeSucursales: [],
  refresh: Math.random(),
  detalleDeSucursal: null,
  loadingTable: false,
  // google maps 
  coordinates: { lat: null, lng: null },
  address: "",
  // google address
  addressMultiple: [],
  addressIds: [],
  auth: null,
  currentStep: 0,
  tempDataEmpresa: {},
  direcciones: [],
  newSucursalId: null,
  cerrarSesion: false,
};

export const configuracionSlice = createSlice({
  name: 'configuracion',
  initialState,
  reducers: {
    setCerrarSesion: (state, action) => {
      state.cerrarSesion = action.payload;
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
    setListaDeSucursales: (state, action) => {
      state.listaDeSucursales = action.payload;
    },
    setDetalleDeSucursal: (state, action) => {
      state.detalleDeSucursal = action.payload;
    },
    // google maps
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    // google maps multiple
    setAddressIds: (state, action) => {
      state.addressIds = action.payload;
    },
    setAddressMultiple: (state, action) => {
      state.addressMultiple = action.payload;
    },
    setDirecciones: (state, action) => {
      state.direcciones = action.payload;
    },
    setAuth: (state, action) => {
      state.auth = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setTempDataEmpresa: (state, action) => {
      state.tempDataEmpresa = action.payload;
    },
    setNewSucursalId: (state, action) => {
      state.newSucursalId = action.payload;
    }

  },
});

// Action creators are generated for each case reducer function
export const {
  setLoading,
  setOpenDrawer,
  setRefresh,
  setListaDeSucursales,
  setLoadingTable,
  setDetalleDeSucursal,
  setCoordinates,
  setAddress,
  setAuth,
  setCurrentStep,
  setTempDataEmpresa,
  setAddressMultiple,
  setAddressIds,
  setDirecciones,
  setNewSucursalId,
  setCerrarSesion,
} = configuracionSlice.actions;

export default configuracionSlice.reducer;