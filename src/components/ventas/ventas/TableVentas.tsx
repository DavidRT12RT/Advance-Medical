"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Dropdown,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  FormOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import {
  setDetalleDeVenta,
  setOpenDrawer,
  setRefresh,
} from "@/features/finanzasSlice";
import SkeletonVentas from "./SkeletonVentas";
import moment from "moment";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const TableVentas = ({ form }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loadingTable, listaDeVentas = [] } = useSelector(
    (state: any) => state.finanzas
  );

  const { auth } = useSelector((state: any) => state.configuracion);

  const { listaDeClientes = [] } = useSelector((state: any) => state.ventas);

  const [loadingLocal, setLoadingLocal] = React.useState(false);

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();

            form.resetFields();

            form.setFieldsValue({
              ...record,
              fechaDeDespacho: moment(record?.fechaDeDespacho, "YYYY-MM-DD"),
            });

            dispatch(
              setDetalleDeVenta({
                ...record,
                fechaDeDespacho: moment(record?.fechaDeDespacho, "YYYY-MM-DD"),
              })
            );
            dispatch(setOpenDrawer(true));
          }}
        >
          Editar venta
        </a>
      ),
      icon: <FormOutlined />,
    },
    {
      key: "2",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            dispatch(
              setDetalleDeVenta({
                ...record,
              })
            );
            router.push(`/ventas/ventas/${record?.id}`);
          }}
        >
          Ver detalle de venta
        </a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: "3",
      label: (
        <a
          onClick={async (e) => {
            e.preventDefault();
            try {
              setLoadingLocal(true);
              // Modifica el objeto para asignarle un nuevo ID (Firebase lo puede generar automáticamente)
              const { id, ...data } = record;
              // Llamada a Firebase para crear el nuevo artículo
              await FireStoreFinanzas.registrarVenta(auth?.empresa?.id, data);

              // Muestra mensaje de éxito
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `Venta duplicada con éxito!`,
                showConfirmButton: false,
                timer: 3000,
              });

              // Refresca la tabla llamando al setRefresh o una acción similar
              dispatch(setRefresh(Math.random()));
            } catch (error) {
              console.error("Error duplicando la venta:", error);
              Swal.fire({
                title: "Error",
                text: error?.toString(),
                icon: "error",
              });
            } finally {
              setLoadingLocal(false);
            }
          }}
        >
          Duplicar venta
        </a>
      ),
      icon: <CopyOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            Swal.fire({
              title: "¿Seguro de eliminar la venta?",
              text: "Esta acción no se puede deshacer",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#1677ff",
              cancelButtonColor: "#d33",
              confirmButtonText: "Sí, eliminar",
              cancelButtonText: "Cancelar",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  setLoadingLocal(true);
                  await FireStoreFinanzas.eliminarVenta(auth?.empresa?.id, record.id);
                  
                  dispatch(setRefresh(Math.random()));
                  
                  Swal.fire({
                    title: "¡Eliminada!",
                    text: "La venta ha sido eliminada correctamente",
                    icon: "success",
                  });
                } catch (error) {
                  console.error("Error al eliminar la venta:", error);
                  Swal.fire({
                    title: "Error",
                    text: "No se pudo eliminar la venta",
                    icon: "error",
                  });
                } finally {
                  setLoadingLocal(false);
                }
              }
            });
          }}
        >
          Eliminar venta
        </a>
      ),
      icon: <DeleteOutlined />,
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de ventas, ${listaDeVentas.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "Código",
          dataIndex: "codigo",
          key: "codigo",
        },
        {
          title: "Fecha de Despacho",
          dataIndex: "fechaDeDespacho",
          key: "fechaDeDespacho",
        },
        {
          title: "Cliente",
          dataIndex: "cliente",
          key: "cliente",
          render: (text, record, index) => {
            const cliente =
              listaDeClientes.find((cliente: any) => cliente?.id == text)
                ?.nombreCliente || "Desconocido";
            return <div>{cliente}</div>;
          },
        },
        {
          title: "Número de artículos",
          dataIndex: "articulos",
          key: "articulos",
          render: (text, record, index) => (
            <div>{record?.articulos.length}</div>
          ),
        },
        {
          title: "Total",
          dataIndex: "totalDeLaVenta",
          key: "totalDeLaVenta",
          render: (text, record, index) => (
            <div>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number(text))}
            </div>
          ),
        },
        {
          title: "Estatus",
          dataIndex: "estatus",
          key: "estatus",
          render: (text, record, index) => <Tag color="processing">{text}</Tag>,
        },
        {
          title: "",
          align: "center",
          width: 50,
          render: (_, record) => {
            return (
              <Dropdown
                menu={{
                  items: getMenuItems(record),
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Tooltip title="Acciones">
                  <Button
                    loading={loadingLocal}
                    shape="circle"
                    icon={<MoreOutlined />}
                  />
                </Tooltip>
              </Dropdown>
            );
          },
        },
      ],
    },
  ];

  if (loadingTable) {
    return <SkeletonVentas />;
  }

  return (
    <Table
      bordered
      columns={columns}
      // dataSource={ [] }
      dataSource={listaDeVentas}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableVentas;
