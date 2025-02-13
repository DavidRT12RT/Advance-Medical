"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import TableListaArticulosBodega from "@/components/inventario/bodegas/TableListaArticulosBodega";
import HeaderArticulosBodega from "@/components/inventario/bodegas/HeaderArticulosBodega";
import { useDispatch, useSelector } from "react-redux";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import {
  setDetalleSucursal,
  setListaDeArticulos,
  setLoadingTable,
  setOpenDrawerArticulo,
  setRefreshTable,
  setSubCollectionEmpresa,
} from "@/features/inventarioSlice";
import SearchArticulosBodega from "@/components/inventario/bodegas/SearchArticulosBodega";
import { Drawer, Form } from "antd";
import FormArticulos from '@/components/inventario/articulos/FormArticulos';

const page = () => {

  const [form] = Form.useForm();

  const { idBodega }: any = useParams();
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const {refreshTable,openDrawerArticulo,detalleArticulo } = useSelector((state: any) => state.inventario);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;

    if (!idEmpresa) return;

    const fetchData = async () => {
      dispatch(setLoadingTable(true));
      dispatch(setRefreshTable(false));

      try {
        // Fetch las subcolecciones y los datos relacionados con la sucursal
        const [
          categorias = [],
          marcas = [],
          familias = [],
          catalogos = [],
          provedores = [],
          sucursales = [],
        ] = await Promise.all([
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "categorias"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(idEmpresa, "marcas"),
          FireStoreInventario.listarSubCollectionEmpresa(idEmpresa, "familias"),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "catalogos"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "proveedores"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "sucursales"
          ),
        ]);

        // Dispatch para subcolecciones de la empresa
        dispatch(
          setSubCollectionEmpresa({
            categorias: categorias.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            marcas: marcas.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            familias: familias.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
            })),
            catalogos: catalogos.map(({ nombreCatalogo, id }: any) => ({
              label: nombreCatalogo,
              value: id,
              id,
            })),
            provedores: provedores.map(({ nombreProveedor, id }: any) => ({
              label: nombreProveedor,
              value: id,
              id,
            })),
            sucursales: sucursales.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
              id,
            })),
          })
        );

        // Fetch detalle de la sucursal y los artículos relacionados
        const sucursal = await FireStoreInventario.listarSucursal({
          idEmpresa,
          idSucursal: idBodega,
        });
        dispatch(setDetalleSucursal(sucursal));

        const listaDeArticulosPorSucursal =
          await FireStoreInventario.listarArticulosPorTipoOrigen({
            idEmpresa,
            tipoOrigen: "sucursal",
            origenId: idBodega,
          });
        dispatch(setListaDeArticulos(listaDeArticulosPorSucursal));
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    dispatch(setLoadingTable(false));
    fetchData();
  }, [auth, idBodega, dispatch,refreshTable]);

  return (
    <div>
      <HeaderArticulosBodega />
      <SearchArticulosBodega />
      <Drawer
        title={detalleArticulo?.id ? "Editar artículo" : "Nuevo artículo"}
        width={768}
        onClose={() => dispatch(setOpenDrawerArticulo(false))}
        open={openDrawerArticulo}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleArticulo?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        <FormArticulos form={form} />
      </Drawer>
      <TableListaArticulosBodega form={form}/>
    </div>
  );
};

export default page;
