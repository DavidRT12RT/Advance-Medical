// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const recursosHumanosApi = createApi({
  reducerPath: 'recursosHumanosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://recursoshumanos-ze5xm3kxpq-uc.a.run.app/'
  }),
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({

    listarColaboradores: builder.query({
      query: (variables) => {
        return {
          url: `listarColaboradores?${new URLSearchParams(variables).toString()}`,
          method: 'get',
          // body: variables,
          headers: { uid: "token" },
        }
      },
      keepUnusedDataFor: 60,// 60 segundos,
      // transformResponse: (response: any, meta, arg) => {
      //   console.log('response', response);
      //   return response.data;
      // },
    }),
    crearCuenta: builder.mutation({
      query: (variables) => {
        return {
          url: 'crearCuenta',
          method: 'post',
          body: variables,
          headers: { uid: "token" },
        }
      },
      //transformResponse: (response: any, meta, arg) => response.data,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useListarColaboradoresQuery,
  useCrearCuentaMutation
} = recursosHumanosApi;