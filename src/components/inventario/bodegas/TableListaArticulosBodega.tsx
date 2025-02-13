import React from "react";
import {
  Button,
  Dropdown,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import SkeletonCatalogos from "../catalogos/SkeletonCatalogos";
import {
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  MoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import {
  setDetalleArticulos,
  setOpenDrawerArticulo,
  setRefreshTable,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";

const TableListaArticulosBodega = ({ form }: any) => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { loadingTable, listaDeArticulos, subCollectionEmpresa } = useSelector(
    (state: any) => state.inventario
  );

  const {
    categorias = [],
    familias = [],
    provedores = [],
    marcas = [],
  } = subCollectionEmpresa;

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
      type: "divider",
    },
    {
      key: "3",
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            Swal.fire({
              title: "Seguro quieres activar el articulo?",
              text: "",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#1677ff",
              cancelButtonColor: "#d33",
              confirmButtonText: "Si",
              cancelButtonText: "No",
            }).then(async (result) => {
              if (result.isConfirmed) {
                await FireStoreInventario.cambiarEstatusArticulo(
                  auth?.empresa?.id,
                  record.id,
                  "Activo"
                );
                dispatch(setRefreshTable(true));
                Swal.fire({
                  title: "Activado!",
                  text: "",
                  icon: "success",
                });
              }
            });
          }}
        >
          Activar articulo
        </a>
      ),
      icon: <ReloadOutlined />,
      disabled: record.estatus == "Activo",
    },
    {
      key: "4",
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
            }).then(async (result) => {
              if (result.isConfirmed) {
                await FireStoreInventario.cambiarEstatusArticulo(
                  auth?.empresa?.id,
                  record.id,
                  "Inactivo"
                );
                dispatch(setRefreshTable(true));
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
      disabled: record.estatus == "Inactivo",
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title level={5}>
          {`Lista de artículos, ${listaDeArticulos.length} resultados`}
        </Typography.Title>
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
        },
        {
          title: "Proveedor",
          dataIndex: "proveedoresArticulo",
          key: "proveedoresArticulo",
          render: (text, record) => {
            const proveedores = record?.provedoresArticulo?.map(
              (id: string) => {
                return provedores.find((prov: any) => prov.value === id);
              }
            );

            const nombresProveedores = proveedores
              ?.filter((prov: any) => prov)
              ?.map((prov: any) => prov.label);

            return (
              <p>
                {nombresProveedores?.length > 0
                  ? nombresProveedores.join(", ")
                  : "No disponible"}
              </p>
            );
          },
        },
        {
          title: "Familia",
          dataIndex: "familia",
          key: "familia",
          render: (text) => {
            const familia = familias.find((fam: any) => fam.value === text);
            return <p>{familia?.label || "No disponible"}</p>;
          },
        },
        {
          title: "Categoría",
          dataIndex: "categoria",
          key: "categoria",
          render: (text) => {
            const categoria = categorias.find((cat: any) => cat.value === text);
            return <p>{categoria?.label || "No disponible"}</p>;
          },
        },
        {
          title: "Marca",
          dataIndex: "marca",
          key: "marca",
          render: (text, record) => {
            const marca = marcas.find((mar: any) => mar.value == text);
            return <p>{marca?.label || "No disponible"}</p>;
          },
        },
        {
          title: "Cantidad en existencia",
          dataIndex: "cantidad",
          key: "cantidad",
          align: "center",
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
            console.log("Record",record?.id);
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
    return <SkeletonCatalogos />;
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeArticulos}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableListaArticulosBodega;
