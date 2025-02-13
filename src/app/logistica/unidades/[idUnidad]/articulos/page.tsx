"use client";

import HeaderArticulosUnidad from "@/components/logistica/unidades/HeaderArticulosUnidad";
import SearchArticulosUnidad from "@/components/logistica/unidades/SearchArticulosUnidad";
import TableListaArticulosUnidad from "@/components/logistica/unidades/TableListaArticulosUnidad";
import {
  setDetalleUnidadVehicular,
  setListaDeArticulos,
  setLoadingTable,
  setOpenDrawerArticulo,
  setRefreshTable,
  setSubCollectionEmpresa,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import FireStoreLogistica from "@/firebase/FireStoreLogistica";
import { Drawer, Form } from "antd";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormArticulos from '@/components/inventario/articulos/FormArticulos';

const page = () => {
  const [form] = Form.useForm();

  const { idUnidad }: any = useParams();
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { refreshTable,openDrawerArticulo,detalleArticulo } = useSelector((state:any) => state.inventario);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;
    if (!idEmpresa) return;

    const fetchData = async () => {
      dispatch(setLoadingTable(true));
      dispatch(setRefreshTable(false));

      try {
        // Fetch las subcolecciones y los datos relacionados con la unidad
        const [
          categorias = [],
          marcas = [],
          familias = [],
          catalogos = [],
          provedores = [],
          unidadesVehiculares = [],
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
            "unidadVehiculos"
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
            unidades: unidadesVehiculares.map(({ nombre, id }: any) => ({
              label: nombre,
              value: id,
              id,
            })),
          })
        );

        // Fetch detalle de la unidad vehicular y los artículos relacionados
        const unidadVehicular = await FireStoreLogistica.listarUnidadVehicular({
          idEmpresa,
          idUnidad,
        });
        dispatch(setDetalleUnidadVehicular(unidadVehicular));

        const listaDeArticulosPorUnidad =
          await FireStoreInventario.listarArticulosPorTipoOrigen({
            idEmpresa,
            tipoOrigen: "unidad",
            origenId: unidadVehicular?.id,
          });
        dispatch(setListaDeArticulos(listaDeArticulosPorUnidad));
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    fetchData();
  }, [auth, idUnidad, dispatch,refreshTable]);

  return (
    <div>
      <HeaderArticulosUnidad />
      <SearchArticulosUnidad />
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
      <TableListaArticulosUnidad form={form} />
    </div>
  );
};

export default page;
