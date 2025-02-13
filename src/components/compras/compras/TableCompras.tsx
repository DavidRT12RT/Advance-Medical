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
  setDetalleDeCompra,
  setOpenDrawer,
  setRefresh,
} from "@/features/finanzasSlice";
import SkeletonCompras from "./SkeletonCompras";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NumberFormatUSD } from "@/helpers/functions";
import { CompraStatus, CompraStatusColor } from "@/types/compras";
dayjs.extend(customParseFormat);

const TableCompras = ({ form }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loadingTable, listaDeCompras = [] } = useSelector(
    (state: any) => state.finanzas
  );
  const { auth } = useSelector((state: any) => state.configuracion);
  const { listaDeProveedores = [] } = useSelector((state: any) => state.ventas);
  const [loadingLocal, setLoadingLocal] = React.useState(false);

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();

            form.resetFields();
            const { articulos, ...others } = record;

            form.setFieldsValue({
              ...others,
              fechaDeCompra: dayjs(others?.fechaDeCompra, 'YYYY-MM-DD'),// moment(record?.fechaDeCompra, 'YYYY-MM-DD'),
              fechaEstimadaDeLlegada: dayjs(others?.fechaEstimadaDeLlegada, 'YYYY-MM-DD'),// moment(record?.fechaEstimadaDeLlegada, 'YYYY-MM-DD'),
              // articulosRegistrados: articulos
            });

            dispatch(setDetalleDeCompra({
              ...others,
              fechaDeCompra: dayjs(others?.fechaDeCompra, 'YYYY-MM-DD'),// moment(record?.fechaDeCompra, 'YYYY-MM-DD'),
              fechaEstimadaDeLlegada: dayjs(others?.fechaEstimadaDeLlegada, 'YYYY-MM-DD'),// moment(record?.fechaEstimadaDeLlegada, 'YYYY-MM-DD'),
              articulos
            }));
            dispatch(setOpenDrawer(true));

          }}>Editar compra</a>
      ),
      icon: <FormOutlined />,
      disabled: record?.estatus !== CompraStatus.Pendiente || !record?.isParent
    },
    {
      key: "2",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            dispatch(
              setDetalleDeCompra({
                ...record,
              })
            );
            router.push(
              `/compras/compras/${record?.id}?cc=${record?.codigoCompra || ""}`
            );
          }}
        >
          Ver detalle de compra
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
              await FireStoreFinanzas.registrarCompra(auth?.empresa?.id, data);

              // Muestra mensaje de éxito
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `Compra duplicada con éxito!`,
                showConfirmButton: false,
                timer: 3000,
              });

              // Refresca la tabla llamando al setRefresh o una acción similar
              dispatch(setRefresh(Math.random()));
            } catch (error) {
              console.error("Error duplicando el artículo:", error);
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
          Duplicar compra
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
              title: "Seguro de eliminar compra?",
              text: "",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#1677ff",
              cancelButtonColor: "#d33",
              confirmButtonText: "Si",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.fire({
                  title: "Desactivado!",
                  text: "",
                  icon: "success",
                });
              }
            });
          }}
        >
          Eliminar compra
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
        >{`Lista de compras, ${listaDeCompras.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "Código",
          dataIndex: "codigoCompra",
          key: "codigoCompra",
        },
        {
          title: "Fecha de compra",
          dataIndex: "fechaDeCompra",
          key: "fechaDeCompra",
        },
        {
          title: "Proveedor",
          dataIndex: "proveedor",
          key: "proveedor",
          render: (text, record, index) => {
            const proveedores = (record?.articulos || []).map(
              (articulo: any) => {
                return articulo?.proveedor;
              }
            );

            const proveedoresUnicos = new Set(proveedores);
            const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);
            const proveedor = listaDeProveedores
              .filter((proveedor: any) =>
                proveedoresUnicosArray.includes(proveedor?.id)
              )
              .map((proveedor: any) => proveedor?.nombreProveedor);
            return <div>{proveedor.join(", ")}</div>;
          },
        },
        {
          title: "N° de artículos",
          dataIndex: "articulos",
          key: "articulos",
          render: (text, record, index) => (
            <div>{record?.articulos?.length}</div>
          ),
        },
        {
          title: "Total",
          dataIndex: "totalDeLaCompra",
          key: "totalDeLaCompra",
          render: (text, record, index) => (
            <div>{NumberFormatUSD(Number(text))}</div>
          ),
        },
        {
          title: "Estatus",
          dataIndex: "estatus",
          key: "estatus",
          render: (text: CompraStatus) => (
            <Tag color={CompraStatusColor[text] || "default"}>{text}</Tag>
          ),
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
    return <SkeletonCompras />;
  }

  return (
    <Table
      bordered
      columns={columns}
      // dataSource={ [] }
      dataSource={listaDeCompras}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableCompras;
