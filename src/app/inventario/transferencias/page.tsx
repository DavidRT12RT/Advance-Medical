"use client";
import React, { useEffect } from "react";
import TableTransferencias from "@/components/inventario/transferencias/TableTransferencias";
import HeaderTransferencias from "@/components/inventario/transferencias/HeaderTransferencias";
import FormDrawerTransferencias from "@/components/inventario/transferencias/FormDrawerTransferencias";
import SearchTransferencias from "@/components/inventario/transferencias/SearchTransferencias";
import { useDispatch, useSelector } from "react-redux";
import {
  setListaDeTransferencias,
  setLoadingTable,
  setRefreshTransferencias,
  setSubCollectionEmpresa,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";

const page = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { refreshTransferencias } = useSelector(
    (state: any) => state.inventario
  );

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;

    if (!idEmpresa) return;

    const fetchData = async () => {
      dispatch(setLoadingTable(true));

      try {
        // Fetch las subcolecciones y los datos relacionados con la sucursal
        const [unidadesVehiculares = [], sucursales = [], articulos] =
          await Promise.all([
            FireStoreInventario.listarSubCollectionEmpresa(
              idEmpresa,
              "unidadesVehiculares"
            ),
            FireStoreInventario.listarSubCollectionEmpresa(
              idEmpresa,
              "sucursales"
            ),
            FireStoreInventario.listarSubCollectionEmpresa(
              idEmpresa,
              "articulos"
            ),
          ]);

        // Dispatch para subcolecciones de la empresa
        dispatch(
          setSubCollectionEmpresa({
            sucursales: sucursales.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
              id,
            })),
            unidades: unidadesVehiculares.map(({ marca, modelo, id }: any) => ({
              label: `${marca} ${modelo}`,
              value: id,
              id,
            })),
            articulos,
          })
        );

        // Fetch detalle de la sucursal y los artículos relacionados
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    fetchData();
  }, [auth, dispatch]);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;
    dispatch(setLoadingTable(true));
    const fetchTransferencias = async () => {
      const listaTransferencias =
        await FireStoreInventario.listarTransferencias(idEmpresa);
      dispatch(setListaDeTransferencias(listaTransferencias));
      dispatch(setRefreshTransferencias(false));
    };
    if (refreshTransferencias == true) fetchTransferencias();

    dispatch(setLoadingTable(false));
  }, [refreshTransferencias]);

  return (
    <div>
      <HeaderTransferencias />
      <FormDrawerTransferencias />
      <SearchTransferencias />
      <TableTransferencias />
    </div>
  );
};

export default page;
