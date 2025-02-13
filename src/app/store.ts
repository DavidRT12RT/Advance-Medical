import { configureStore } from '@reduxjs/toolkit';
import recursosHumanosReducer from '../features/recursosHumanosSlice';
import configuracionReducer from '../features/configuracionSlice';
import ventasReducer from '../features/ventasSlice';
import inventarioReducer from '../features/inventarioSlice';
import administracionReducer from '../features/administracionSlice';
import finanzasReducer from '../features/finanzasSlice';
import comprasReducer from '../features/comprasSlice';
import { recursosHumanosApi } from '@/services/recursosHumanosApi';

export const store = configureStore({
  reducer: {
    recursosHumanos: recursosHumanosReducer,
    configuracion: configuracionReducer,
    ventas: ventasReducer,
    inventario: inventarioReducer,
    administracion: administracionReducer,
    finanzas: finanzasReducer,
    compras: comprasReducer,
    [recursosHumanosApi.reducerPath]: recursosHumanosApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    recursosHumanosApi.middleware,
    // ...
  )
});