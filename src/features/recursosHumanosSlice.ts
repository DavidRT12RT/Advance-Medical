import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  currentValueMenu: "recursos-humanos/colaboradores",
  loading: false,
  loadingTable: false,
  openDrawer: false,
  listaDeUsuarios: [],
  newUsuarioId:null,
  countListaDeUsuarios: 0,
  pageListaDeUsuarios: 1,
  refresh: null,
  perfilUsuario: null,
  // contrataciones
  listaDeContrataciones: [],
  detalleDeContracion: null,
  listaDePostulantes: [],
  detalleDelPostulante: null,
  openDrawerFormPostulante: false,
  isModalOpen: false,
  openDrawerSucursal: false,
  listaDeNominas: [],
  detalleDeNomina: null,
  colaboradoresSeleccionados: [],
  openModalAdicionales: false,
  openModalIncapacidades: false,
  openDrawerNomina: false,
  isNewAdicionalNominaId: false,
  isNewIncapacidadNominaId: false,
  listaDeAdicionalesNominas: [],
  listaDeIncapacidadesNominas: [],
};

export const recursosHumanosSlice = createSlice({
  name: 'recursosHumanos',
  initialState,
  reducers: {
    setIsNewAdicionalNominaId: (state, action) => {
      state.isNewAdicionalNominaId = action.payload;
    },
    setIsNewIncapacidadNominaId: (state, action) => {
      state.isNewIncapacidadNominaId = action.payload;
    },
    setListaDeAdicionalesNominas: (state, action) => {
      state.listaDeAdicionalesNominas = action.payload;
    },
    setListaDeIncapacidadesNominas: (state, action) => {
      state.listaDeIncapacidadesNominas = action.payload;
    },
    setOpenDrawerNomina: (state, action) => {
      state.openDrawerNomina = action.payload;
    },
    setOpenModalIncapacidades: (state, action) => {
      state.openModalIncapacidades = action.payload;
    },
    setColaboradoresSeleccionados: (state, action) => {
      state.colaboradoresSeleccionados = action.payload;
    },
    setOpenModalAdicionales: (state, action) => {
      state.openModalAdicionales = action.payload;
    },
    setDetalleDeNomina: (state, action) => {
      state.detalleDeNomina = action.payload;
    },
    setListaDeNominas: (state, action) => {
      state.listaDeNominas = action.payload;
    },
    setCurrentValueMenu: (state, action) => {
      state.currentValueMenu = action.payload;
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
    setListaDeUsuarios: (state, action) => {
      state.listaDeUsuarios = action.payload;
    },
    setNewUsuarioId: (state, action) => {
      state.newUsuarioId = action.payload;
    },
    setCountListaDeUsuarios: (state, action) => {
      state.countListaDeUsuarios = action.payload;
    },
    setPageListaDeUsuarios: (state, action) => {
      state.pageListaDeUsuarios = action.payload;
    },
    setPerfilUsuario: (state, action) => {
      state.perfilUsuario = action.payload;
    },
    setRefresh: (state, action) => {
      state.refresh = action.payload;
    },
    // contrataciones
    setListaDeContrataciones: (state, action) => {
      state.listaDeContrataciones = action.payload;
    },
    setDetalleDeContratacion: (state, action) => {
      state.detalleDeContratacion = action.payload;
    },
    setListaDePostulantes: (state, action) => {
      state.listaDePostulantes = action.payload;
    },
    setDetalleDelPostulante: (state, action) => {
      state.detalleDelPostulante = action.payload;
    },
    setOpenDrawerFormPostulante: (state, action) => {
      state.openDrawerFormPostulante = action.payload;
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setOpenDrawerSucursal: (state, action) => {
      state.openDrawerSucursal = action.payload;
    }

  },
});

// Action creators are generated for each case reducer function
export const {
  setCurrentValueMenu,
  setLoading,
  setOpenDrawer,
  setListaDeUsuarios,
  setNewUsuarioId,
  setRefresh,
  setLoadingTable,
  setPerfilUsuario,
  setListaDeContrataciones,
  setDetalleDeContratacion,
  setListaDePostulantes,
  setDetalleDelPostulante,
  setOpenDrawerFormPostulante,
  setIsModalOpen,
  setCountListaDeUsuarios,
  setPageListaDeUsuarios,
  setOpenDrawerSucursal,
  setOpenModalAdicionales,
  setDetalleDeNomina,
  setListaDeNominas,
  setColaboradoresSeleccionados,
  setOpenModalIncapacidades,
  setOpenDrawerNomina,
  setIsNewAdicionalNominaId,
  setIsNewIncapacidadNominaId,
  setListaDeAdicionalesNominas,
  setListaDeIncapacidadesNominas
} = recursosHumanosSlice.actions;

export default recursosHumanosSlice.reducer;