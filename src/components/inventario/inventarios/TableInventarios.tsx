import React, { useEffect } from "react";
import SkeletonInventarios from "./SkeletonInventarios";
import { Button, Dropdown, Table, TableProps, Tooltip, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined, MoreOutlined, FormOutlined } from "@ant-design/icons";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import { setListaDeInventarios } from "@/features/inventarioSlice";

const TableInventarios = ({ form }: any) => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { loadingTable, listaDeInventarios, listaDeArticulos, listaDeSucursales,listaDeUnidadesVehiculares } = useSelector(
    (state: any) => state.inventario
  );

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: <a onClick={() => {}}>Editar inventario</a>,
      icon: <FormOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: <a onClick={() => {}}>Desactivar inventario</a>,
      icon: <DeleteOutlined />,
    },
  ];

  // Función para obtener el nombre de la sucursal o unidad vehicular desde las listas en Redux
  const obtenerNombreSucursalOUnidad = (record: any) => {
    const { sucursal_id, unidad_id } = record;

    if (sucursal_id) {
      const sucursal = listaDeSucursales?.find((s: any) => s.id === sucursal_id);
      return sucursal ? sucursal.nombre : "Sucursal no encontrada";
    }

    if (unidad_id) {
      const unidad = listaDeUnidadesVehiculares?.find((u: any) => u.id === unidad_id);
      return unidad ? `${unidad.marca} ${unidad.modelo}` : "Unidad no encontrada";
    }

    return "No asignado";
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title level={5}>
          {`Lista de inventarios, ${listaDeInventarios.length} resultados`}
        </Typography.Title>
      ),
      dataIndex: "catalogo",
      key: "catalogo",
      children: [
        {
          title: "Código",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "Articulo",
          dataIndex: "articulo_id",
          key: "articulo_id",
          render:(text) => {
            const articulo = listaDeArticulos?.find((a: any) => a.id == text);
            return articulo ? articulo.descripcion : "Artículo no encontrado";
          }
        },
        {
          title: "Tipo de origen",
          dataIndex: "tipoOrigen",
          key: "tipoOrigen",
          render:(text) => {
            return text[0].toUpperCase() + text.slice(1);
          }
        },
        {
          title: "Cantidad en existencia",
          dataIndex: "cantidad",
          key: "cantidad",
          render: (text) => text ?? 0,
          align: "center",
        },
        {
          title: "Sucursal o unidad",
          key: "sucursal_unidad",
          render: (_, record) => obtenerNombreSucursalOUnidad(record),
        },
        {
          title: "",
          align: "center",
          width: 50,
          render: (_, record) => (
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
          ),
        },
      ],
    },
  ];

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;
    if (!idEmpresa) return;

    const fetchInventarios = async () => {
      const inventarios = await FireStoreInventario.listarInventarios({ idEmpresa });
      dispatch(setListaDeInventarios(inventarios));
    };

    fetchInventarios();
  }, [auth,dispatch]);

  if (loadingTable) {
    return <SkeletonInventarios />;
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeInventarios}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableInventarios;
