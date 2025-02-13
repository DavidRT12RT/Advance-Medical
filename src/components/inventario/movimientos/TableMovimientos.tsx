"use client";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Table, Tag, Button, Dropdown, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import SkeletonUsuarios from "@/components/recursos-humanos/colaboradores/SkeletonColaboradores";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import {
  setDetalleTransferencia,
  setLoadingTable,
  setOpenDrawerTransferencia,
} from "@/features/inventarioSlice";

const TableMovimientos = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loadingTable, listaDeMovimientos = [] } = useSelector(
    (state: any) => state.inventario
  );
  const { auth } = useSelector((state: any) => state.configuracion);

  const fetchDataTransferencia = async (id: string) => {
    const listaTransferencia = await FireStoreInventario.listarTransferencias(
      auth?.empresa.id
    );

    const matchTransferencia = listaTransferencia.find(
      (transferencia) => transferencia.id === id
    );

    return matchTransferencia;
  };

  const getMenuItems = (record: any) => {
    const items = [];

    // Ver Detalle de Compra
    if (record.nombreOrigen === "Compra" && record.idCompra) {
      items.push({
        key: "detalleCompra",
        label: "Ver Detalle de Compra",
        icon: <EyeOutlined />,
        onClick: () => router.push(`/compras/compras/${record.idCompra}`),
      });
    }

    // Ver Detalle de Venta
    if (record.nombreDestino === "Venta" && record.idVenta) {
      items.push({
        key: "detalleVenta",
        label: "Ver Detalle de Venta",
        icon: <EyeOutlined />,
        onClick: () => router.push(`/ventas/ventas/${record.idVenta}`),
      });
    }

    // Ver Detalle de Transferencia
    if (record.tipoMovimiento === "Transferencia") {
      items.push({
        key: "detalleTransferencia",
        label: "Ver Detalle de Transferencia",
        icon: <EyeOutlined />,
        onClick: async () => {
          dispatch(setLoadingTable(true));
          const dataPropTransferencia = await fetchDataTransferencia(
            record.idTransferencia
          );

          router.push(`/inventario/transferencias`);
          dispatch(setOpenDrawerTransferencia(true));
          dispatch(setDetalleTransferencia(dataPropTransferencia));
          dispatch(setLoadingTable(false));
        },
      });
    }

    //No Hay Detalle Para Mostrar
    if (
      record.nombreOrigen !== "Compra" &&
      record.nombreDestino !== "Venta" &&
      record.tipoMovimiento !== "Transferencia"
    ) {
      items.push({
        key: "noDetalleParaMostrar",
        label: "No Hay Detalle Para Mostrar",
      });
    }

    return items;
  };

  const columns = [
    {
      title: (
        <Typography.Title
          level={5}
        >{`Lista de Movimientos, ${listaDeMovimientos.length} resultados`}</Typography.Title>
      ),
      dataIndex: "id",
      key: "id",
      children: [
        {
          title: "Fecha",
          dataIndex: "fecha",
          key: "fecha",
        },
        {
          title: "Hora",
          dataIndex: "hora",
          key: "hora",
        },
        {
          title: "Tipo de Movimiento",
          dataIndex: "tipoMovimiento",
          key: "tipoMovimiento",
          render: (tipoMovimiento: string, record: any) => {
            if (tipoMovimiento === "Transferencia" && record.idTransferencia) {
              return (
                <Tooltip title="Info de Transferencia">
                  <Typography.Link
                    onClick={async () => {
                      dispatch(setLoadingTable(true));
                      const dataPropTransferencia =
                        await fetchDataTransferencia(record.idTransferencia);
                      console.log(
                        "dataPropTransferencia:",
                        dataPropTransferencia
                      );

                      // router.push(`/inventario/transferencias`);
                      dispatch(setOpenDrawerTransferencia(true));
                      dispatch(setDetalleTransferencia(dataPropTransferencia));
                      dispatch(setLoadingTable(false));
                    }}
                  >
                    {tipoMovimiento}
                  </Typography.Link>
                </Tooltip>
              );
            }
            return tipoMovimiento;
          },
        },
        {
          title: "Origen",
          dataIndex: "nombreOrigen",
          key: "origen",
          render: (nombreOrigen: string, record: any) => {
            if (nombreOrigen === "Compra" && record.idCompra) {
              return (
                <Tooltip title="Info de Compra">
                  <Typography.Link
                    onClick={() =>
                      router.push(`/compras/compras/${record.idCompra}`)
                    }
                  >
                    {nombreOrigen}
                  </Typography.Link>
                </Tooltip>
              );
            }
            return nombreOrigen;
          },
        },
        {
          title: "Destino",
          dataIndex: "nombreDestino",
          key: "destino",
          render: (nombreDestino: string, record: any) => {
            if (nombreDestino === "Venta" && record.idVenta) {
              return (
                <Tooltip title="Info de Venta">
                  <Typography.Link
                    onClick={() =>
                      router.push(`/ventas/ventas/${record.idVenta}`)
                    }
                  >
                    {nombreDestino}
                  </Typography.Link>
                </Tooltip>
              );
            }
            return nombreDestino;
          },
        },
        {
          title: "Articulos Involucrados",
          dataIndex: "noArtInvolucrados",
          key: "noArtInvolucrados",
        },
        {
          title: "Usuario Responsable",
          dataIndex: "nombreUsuarioResponsable",
          key: "usuarioResponsable",
        },
        {
          title: "",
          align: "center",
          width: 50,
          render: (_: any, record: any) => (
            <Dropdown
              menu={{ items: getMenuItems(record) }}
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

  // if (loadingTable) {
  //   return <SkeletonUsuarios />;
  // } else {
  // }
  return (
    <Table
      columns={columns}
      dataSource={listaDeMovimientos}
      loading={loadingTable}
      rowKey={(record) => record.id}
    />
  );
};

export default TableMovimientos;
