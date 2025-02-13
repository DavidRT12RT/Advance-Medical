import React, { useEffect } from "react";
import { Button, Dropdown, Table, TableProps, Tooltip, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { EyeOutlined, MoreOutlined, CopyOutlined } from "@ant-design/icons";
import SkeletonTransferencias from "./SkeletonTransferencias";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import {
  setDetalleTransferencia,
  setListaDeArticulos,
  setListaDeTransferencias,
  setLoadingTable,
  setOpenDrawerTransferencia,
  setRefreshTransferencias,
} from "@/features/inventarioSlice";
import dayjs from "dayjs";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { setListaDeUsuarios } from "@/features/recursosHumanosSlice";

const TableTransferencias = ({ form }: any) => {
  const { auth } = useSelector((state: any) => state.configuracion);

  const dispatch = useDispatch();

  const {
    loadingTable,
    listaDeTransferencias = [],
    listaDeSucursales,
    listaDeUnidadesVehiculares,
    listaDeArticulos,
  } = useSelector((state: any) => state.inventario);

  useEffect(() => {
    const idEmpresa = auth?.empresa.id;
    const fetchArticulos = async () => {
      const articulos = await FireStoreInventario.listarArticulos({
        idEmpresa,
      });
      dispatch(setListaDeArticulos(articulos));
    };
    fetchArticulos();
  }, [auth]);

  const { listaDeUsuarios } = useSelector(
    (state: any) => state.recursosHumanos
  );

  const getMenuItems = (record: any): any[] => [
    {
      key: "1",
      label: (
        <a
          onClick={() => {
            dispatch(setOpenDrawerTransferencia(true));
            dispatch(setDetalleTransferencia(record));
          }}
        >
          Ver detalle
        </a>
      ),
      icon: <EyeOutlined />,
    },
    {
      key: "2",
      label: (
        <a
          onClick={() => {
            if (record.disponible) {
              // Lógica para duplicar transferencia
            } else {
              alert("No hay suficiente inventario disponible.");
            }
          }}
        >
          Duplicar
        </a>
      ),
      icon: <CopyOutlined />,
    },
  ];

  const columns: TableProps<any>["columns"] = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de transferencias, ${listaDeTransferencias.length} resultados`}</Typography.Title>
      ),
      dataIndex: "transferencias",
      key: "transferencias",
      children: [
        {
          title: "Origen",
          dataIndex: "origen",
          key: "origen",
          render: (origen: string) => {
            // Mostrar nombre de sucursal o unidad
            const sucursal = listaDeSucursales.find(
              (suc: any) => suc.id === origen
            );
            const unidad = listaDeUnidadesVehiculares.find(
              (uni: any) => uni.id === origen
            );
            return (
              sucursal?.nombre ||
              `${unidad?.marca} ${unidad?.modelo}  ${unidad?.rutaAsignada}` ||
              "Desconocido"
            );
          },
        },
        {
          title: "Destino",
          dataIndex: "destino",
          key: "destino",
          render: (destino: string) => {
            const sucursal = listaDeSucursales.find(
              (suc: any) => suc.id === destino
            );
            const unidad = listaDeUnidadesVehiculares.find(
              (uni: any) => uni.id === destino
            );
            return (
              sucursal?.nombre ||
              ` ${unidad?.marca} ${unidad?.modelo}  ${unidad?.rutaAsignada}` ||
              "Desconocido"
            );
          },
        },
        {
          title: "Fecha y hora",
          dataIndex: "fechaRegistro",
          key: "fechaRegistro",
          render: (timestamp: string) => {
            return timestamp
              ? dayjs(timestamp).format("DD/MM/YYYY h:mm A")
              : "Sin fecha";
          },
        },
        {
          title: "Artículos transferidos",
          dataIndex: "articulos",
          key: "numArticulos",
          align: "center",
          render: (articulos: any[]) => {
            const articulosFormated = articulos
              .map((a) =>
                listaDeArticulos.find((ar: any) => ar.id == a.articulo)
              )
              .map((a) => a.descripcion);

            return (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Typography.Text strong>
                  Num.({articulos.length})
                </Typography.Text>
                <Typography.Text>
                  {articulosFormated.slice(0, 3)}
                </Typography.Text>
                {articulosFormated.length >= 3 && (
                  <Typography.Text>...</Typography.Text>
                )}
              </div>
            );
          },
        },
        {
          title: "Usuario Responsable",
          dataIndex: "usuario",
          key: "usuario",
          render: (usuarioId: string) => {
            // Buscar el usuario en listaDeUsuarios
            const usuario = listaDeUsuarios.find(
              (usr: any) => usr.id == usuarioId || usr.firebaseUID == usuarioId
            );
            return `${usuario?.nombres} ${usuario?.apellidos}` || "Desconocido";
          },
        },
        {
          title: "Opciones",
          align: "center",
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
    const fetchListaDeTransferencias = async () => {
      const listarTransferencias =
        await FireStoreInventario.listarTransferencias(idEmpresa);
      dispatch(setListaDeTransferencias(listarTransferencias));
    };

    const fetchUsuarios = async () => {
      const listaDeUsuarios = await FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa,
      });
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    };

    if (idEmpresa) {
      fetchListaDeTransferencias();
      fetchUsuarios();
    }
  }, [auth]);

  if (loadingTable) {
    return <SkeletonTransferencias />;
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={listaDeTransferencias}
      scroll={{
        x: 768,
      }}
      size="small"
    />
  );
};

export default TableTransferencias;
