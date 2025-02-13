"use client";
import React from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  MenuProps,
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
} from "@ant-design/icons";
import {
  setOpenDrawerArticulo,
  setDetalleArticulos,
  setRefresh,
  setLoadingTable,
} from "@/features/inventarioSlice";
import { useRouter } from "next/navigation";
import SkeletonClientes from "./SkeletonArticulos";
import FireStoreInventario from "@/firebase/FireStoreInventario";

const TableArticulos = ({ form }: any) => {
  const dispatch = useDispatch();

  const {
    loadingTable,
    listaDeArticulos = [],
    subCollectionEmpresa,
  } = useSelector((state: any) => state.inventario);

  const { auth } = useSelector((state: any) => state.configuracion);
  const { categorias = [], marcas = [], familias = [] } = subCollectionEmpresa;

  // 1. Función para duplicar el artículo en Firebase
  const duplicarArticulo = async (record: any) => {
    try {
      // Modifica el objeto para asignarle un nuevo ID (Firebase lo puede generar automáticamente)
      const nuevoArticulo = { ...record };
      delete nuevoArticulo.id; // eliminamos el ID existente

      dispatch(setLoadingTable(true));
      // Llamada a Firebase para crear el nuevo artículo
      await FireStoreInventario.registrarArticulos(auth?.empresa?.id, {
        ...nuevoArticulo,
      });

      // Muestra mensaje de éxito
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Artículo duplicado con éxito!`,
        showConfirmButton: false,
        timer: 3000,
      });

      // Refresca la tabla llamando al setRefresh o una acción similar
      dispatch(setRefresh(Math.random()));
    } catch (error) {
      console.error("Error duplicando el artículo:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo duplicar el artículo",
        icon: "error",
      });
    }
  };

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
            });

            dispatch(
              setDetalleArticulos({
                ...record,
              })
            );
            dispatch(setOpenDrawerArticulo(true));
          }}
        >
          Editar artículo
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

            // Llamada a la función de duplicación
            duplicarArticulo(record);
          }}
        >
          Duplicar artículo
        </a>
      ),
      icon: <EyeOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            Swal.fire({
              title: "Seguro de desactivar articulo?",
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
          Desactivar articulo
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
        >{`Lista de articulos, ${listaDeArticulos.length} resultados`}</Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "Código",
          dataIndex: "codigoArticulo",
          key: "codigoArticulo",
        },
        {
          title: "Nombre",
          dataIndex: "descripcion",
          key: "descripcion",
          // dataIndex: 'nombreArticulo',
          // key: 'nombreArticulo',
        },
        {
          title: "Categoría",
          dataIndex: "categoria",
          key: "categoria",
          render: (text, record, index) => {
            return (
              <div>
                {categorias.find(({ value }: any) => value == text)?.label ||
                  ""}
              </div>
            );
          },
        },
        {
          title: "Familia",
          dataIndex: "familia",
          key: "familia",
          render: (text, record, index) => {
            return (
              <div>
                {familias.find(({ value }: any) => value == text)?.label || ""}
              </div>
            );
          },
        },
        {
          title: "Marca",
          dataIndex: "marca",
          key: "marca",
          render: (text, record, index) => {
            return (
              <div>
                {marcas.find(({ value }: any) => value == text)?.label || ""}
              </div>
            );
          },
        },
        {
          title: "Estatus",
          dataIndex: "estatus",
          key: "estatus",
          render: (text, record, index) => {
            return text == "Activo" ? (
              <Tag color="success">{text}</Tag>
            ) : (
              <Tag color="processing">{text}</Tag>
            );
          },
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
                  <Button shape="circle" icon={<MoreOutlined />} />
                </Tooltip>
              </Dropdown>
            );
          },
        },
      ],
    },
  ];

  if (loadingTable) {
    return <SkeletonClientes />;
  }

  return (
    <Table
      bordered
      columns={columns}
      // dataSource={ [] }
      dataSource={listaDeArticulos}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableArticulos;
