"use client";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useRef } from "react";
import {
  FileExcelOutlined,
  SecurityScanOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import FireStoreInventario from "@/firebase/FireStoreInventario";
import {
  setListaDeArticulos,
  setListaDeCatalogos,
  setLoadingTable,
  setSubCollectionEmpresa,
} from "@/features/inventarioSlice";
import {
  setDetalleDeCompra,
  setOpenDrawer,
  setRefresh,
  setTotalDeLaCompra,
} from "@/features/finanzasSlice";
import { generateRandomString, NumberFormatUSD } from "@/helpers/functions";
import FormCXP from "@/components/finanzas/cuentas-por-pagar/FormCXP";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { CompraStatus } from "@/types/compras";
import { setIsModalOpen } from "@/features/recursosHumanosSlice";

export function calcularSubTotalArticulos(
  monto: number,
  descuentoPorcentaje: number,
  impuestoPorcentaje: number
) {
  // Aplica el descuento
  const montoConDescuento = monto - (monto * descuentoPorcentaje) / 100;

  // Calcula el impuesto sobre el monto con descuento
  const impuesto = (montoConDescuento * impuestoPorcentaje) / 100;

  // Precio final sumando el impuesto
  const precioFinal = montoConDescuento + impuesto;

  return precioFinal;
}

export const getImpuesto = (inpuesto: string) => {
  let valor = 0;
  switch (inpuesto) {
    case "IVA (16%)":
      valor = 16;
      break;
    case "Retención de ISR (10%)":
      valor = 10;
      break;
    case "IVA (8%)":
    case "IEPS (8%)":
      valor = 8;
      break;
    default:
      valor = 0;
      break;
  }

  return valor;
};

const style: React.CSSProperties = { width: "100%", marginBottom: "0px" };
const styleMB0: React.CSSProperties = { marginBottom: "0px" };
/* var UUIDS: any[] = [
  // uuidv4()
];*/
const columns: TableProps<any>["columns"] = [
  {
    title: "Nombre del artículo.",
    dataIndex: "descripcion",
    key: "descripcion",
    align: "center",
  },
  {
    title: "Cantidad ordenada",
    dataIndex: "cantidad",
    key: "cantidad",
    align: "center",
  },
  {
    title: "Cantidad recibida",
    dataIndex: "cantidadRecibida",
    key: "cantidadRecibida",
    align: "center",
    render: (text: any, record: any, index: any) => {
      return (
        <Form.Item
          style={styleMB0}
          name={["cantidadRecibida", record.key, "cantidad"]}
          rules={[{ required: true, message: "" }]}
        >
          <Input
            onChange={(event) => {
              event.preventDefault();
              /* // actualizamos el estado
            const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

              const { impuestos = '', precioUnitario = 0, cantidad = 0, descuento = 0 } = filaTablaArticulos;
              const impuestoPorcentaje = getImpuesto(impuestos);
              const subtotalCalculado = calcularSubTotalArticulos(Number(precioUnitario) * Number(event.target.value), descuento, impuestoPorcentaje);

              return filaTablaArticulos.key == record.key
                ? {
                  ...filaTablaArticulos,
                  cantidad: event.target.value,
                  subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap); */
            }}
            size="small"
            type="number"
            min={0}
            placeholder="Ingrese cantidad"
          />
        </Form.Item>
      );
    },
  },
];

export const DynamicTableArticulosOrdenados = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [formCXP] = Form.useForm();

  const { auth } = useSelector((state: any) => state.configuracion);
  const { detalleDeCompra, openDrawer } = useSelector(
    (state: any) => state.finanzas
  );
  const { subCollectionEmpresa } = useSelector(
    (state: any) => state.inventario
  );
  const [loading, setloading] = React.useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([]);
  const [dataSource, setDataSource] = React.useState<any[]>([]);

  useEffect(() => {
    const idEmpresa = auth?.empresa?.id;
    if (!idEmpresa) return;

    const fetchData = async () => {
      dispatch(setLoadingTable(true));

      try {
        // Fetch las subcolecciones y los datos relacionados con la unidad
        const [sucursales, unidadesVehiculares] = await Promise.all([
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "sucursales"
          ),
          FireStoreInventario.listarSubCollectionEmpresa(
            idEmpresa,
            "unidadVehiculos"
          ),
        ]);

        // Dispatch para subcolecciones de la empresa
        dispatch(
          setSubCollectionEmpresa({
            sucursales: sucursales.map(({ marca, modelo, id }: any) => ({
              label: `${marca} ${modelo}`,
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
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        dispatch(setLoadingTable(false));
      }
    };

    fetchData();
  }, [auth, dispatch]);

  React.useEffect(() => {
    if (detalleDeCompra) {
      setDataSource(detalleDeCompra?.articulos || []);
    }
  }, [detalleDeCompra]);

  const handleRegistrarEntrada = async (values: any) => {
    const idEmpresa = auth?.empresa?.id as string;
    const [fechaRegistro] = new Date().toISOString().split("T");

    const proveedores = (detalleDeCompra?.articulos || []).map(
      (articulo: any) => articulo?.proveedor
    );

    const proveedoresUnicos = new Set(proveedores);
    const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);

    const articulosMap = dataSource.map((articulo: any) => {
      return {
        ...articulo,
        articulosRecibidos: values?.cantidadRecibida[articulo?.key]?.cantidad,
        bodega: "F6lNzaxKqCYGml5UR7ho",
      };
    });

    const articulosSinUbicacion = articulosMap.filter(
      (articulo: any) => !articulo.bodega && !articulo.unidad
    );

    if (articulosSinUbicacion.length > 0) {
      const nombresArticulos = articulosSinUbicacion
        .map((articulo: any) => articulo.descripcion || articulo.key)
        .join(", ");
      await Swal.fire({
        title: "Error",
        text: `Los siguientes artículos no tienen asignada una bodega o unidad: ${nombresArticulos}.`,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (
      articulosMap.every(
        (articulo: any) => articulo?.cantidad == articulo?.articulosRecibidos
      )
    ) {
      const result = await Swal.fire({
        title: `Seguro de registrar cuenta por pagar para la orden ${detalleDeCompra?.codigoCompra}?`,
        text: "",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#1677ff",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        setloading(true);
        await FireStoreFinanzas.registrarCXP(auth?.empresa?.id, {
          codigo: generateRandomString(),
          articulos: detalleDeCompra?.articulos,
          gastosAdicionales: detalleDeCompra?.gastosAdicionales,
          totalDeLaCompra: detalleDeCompra?.totalDeLaCompra,
          documentos: detalleDeCompra?.documentos,
          fechaRegistroDoc: fechaRegistro,
          fechaDeCompra: detalleDeCompra?.fechaDeCompra,
          estatus: "Pendiente",
          ordenDeCompra: detalleDeCompra?.id,
          tipo: "Factura",
          proveedor: proveedoresUnicosArray,
          solicitarFactura: false,
          conceptoDeCompra: "...",
        });

        const subOrdenes = await FireStoreFinanzas.listarSubCompras(
          auth?.empresa?.id,
          detalleDeCompra?.id
        );

        const subOrdenesPromises = subOrdenes?.map((suborden: any) =>
          FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
            id: suborden?.id,
            estatus: CompraStatus.Terminada,
          })
        );

        await Promise.all([
          FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
            id: detalleDeCompra?.id,
            estatus: CompraStatus.Terminada,
          }),
          ...subOrdenesPromises,
        ]);

        // Agrupar los artículos por bodega
        const articulosPorBodega = articulosMap.reduce(
          (acc: any, articulo: any) => {
            const { bodega } = articulo;
            if (!acc[bodega]) {
              acc[bodega] = [];
            }
            acc[bodega].push(articulo);
            3;
            return acc;
          },
          {}
        );
        //Actualizar los articulos de cada bodega y crear el inventario
        for (const [destino, articulos] of Object.entries(articulosPorBodega)) {

          const inventarioData = {
            idEmpresa,
            origen: detalleDeCompra?.id,
            tipoDestino: "sucursal", // TODO: Este valor puede ser unidad o sucursal por mientras lo dejaremos asi
            destino: destino,
            entradaInventarioPorCompra: true,
            //@ts-ignore
            articulos: articulos.map((articulo: any) => ({
              articulo_id: articulo.articulo as string,
              cantidad: Number(articulo.articulosRecibidos),
            })),
          };

          //@ts-ignore
          await FireStoreInventario.actualizarInventario(inventarioData);

          const tipoDestino = subCollectionEmpresa.sucursales.some(
            (sucursal: any) => sucursal.id == destino
          )
            ? "Sucursal"
            : subCollectionEmpresa.unidades.some(
                (unidad: any) => unidad.id == destino
              )
            ? "Unidad"
            : "Desconocido"; 

          const movimientoData = {
            fecha: dayjs().format("YYYY-MM-DD"),
            hora: dayjs().format("HH:mm:ss"),
            tipoMovimiento: "Entrada",
            origen: detalleDeCompra?.id,
            destino,
            idCompra: detalleDeCompra?.id,
            idVenta: null,
            idTransferencia:null,
            //@ts-ignore
            noArtInvolucrados: articulos.length,
            usuarioResponsable: auth?.uid,

            nombreOrigen: "Compra",
            nombreDestino: tipoDestino, // Sucursal || Venta || Unidad ( Unidad vehicular)
            nombreUsuarioResponsable:
              auth?.displayName ?? "Sin nombre del responsable",
          };

          // Registrar el movimiento en Firestore
          await FireStoreInventario.registrarMovimiento(
            idEmpresa,
            movimientoData
          );
        }

        dispatch(setOpenDrawer(false));
        dispatch(setRefresh(Math.random()));
        setloading(false);
        dispatch(setDetalleDeCompra(null));

        await Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Cuenta por pagar registrada con éxito!`,
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } else {
      const { value: opcionSeleccionada } = await Swal.fire({
        title: "La orden está incompleta?",
        text: "Seleccione una opción",
        icon: "question",
        input: "select",
        inputOptions: {
          notaCredito: "Solicitar nota de crédito por artículos faltantes",
          nuevaFactura: "Solicitar cancelación de factura",
        },
        inputPlaceholder: "Seleccione una opción",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve();
            } else {
              resolve("Debe seleccionar una opción");
            }
          });
        },
      });

      if (opcionSeleccionada) {
        if (opcionSeleccionada === "notaCredito") {
          // Lógica de nota de crédito...
        } else if (opcionSeleccionada === "nuevaFactura") {
          dispatch(
            setDetalleDeCompra({
              ...detalleDeCompra,
              codigo: generateRandomString(),
              articulos: detalleDeCompra?.articulos,
              gastosAdicionales: detalleDeCompra?.gastosAdicionales,
              totalDeLaCompra: detalleDeCompra?.totalDeLaCompra,
              documentos: detalleDeCompra?.documentos,
              fechaRegistroDoc: fechaRegistro,
              fechaDeCompra: dayjs(detalleDeCompra?.fechaDeCompra),
              estatus: "Pendiente",
              ordenDeCompra: detalleDeCompra?.id,
              tipo: "Factura",
              proveedor: proveedoresUnicosArray,
              solicitarFactura: false,
              opcionIncompleta: opcionSeleccionada,
            })
          );
          dispatch(setOpenDrawer(true));
        }
      }
    }
  };

  return (
    <>
      <Row gutter={4} style={style}>
        <Divider>Lista de artículos ordenados {dataSource?.length}</Divider>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{ width: "100%", maxHeight: "50vh", overflowY: "auto" }}>
            <Form
              form={form}
              name="login-form"
              layout="vertical"
              style={{ width: "100%" }}
              /* requiredMark={customizeRequiredMark} */
              initialValues={{
                // cantidadRecibida: [],
                registroManual: false,
                // documentos
              }}
              onFinish={handleRegistrarEntrada}
            >
              <Table
                bordered
                pagination={false}
                columns={columns}
                dataSource={dataSource}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (selectedKeys: React.Key[], selectedRows: any) => {
                    setSelectedRowKeys(selectedKeys);

                    if (selectedRows?.length) {
                      selectedRows.forEach((articulo: any) => {
                        form.setFieldValue(
                          ["cantidadRecibida", articulo?.key, "cantidad"],
                          articulo?.cantidad
                        );
                      });
                    } else {
                      dataSource.forEach((articulo: any) => {
                        form.setFieldValue(
                          ["cantidadRecibida", articulo?.key, "cantidad"],
                          ""
                        );
                      });
                    }
                  },
                  type: "checkbox",
                }}
                scroll={{
                  x: 425,
                }}
                size="small"
                footer={() => (
                  <>
                    <Flex
                      gap="small"
                      style={{
                        minWidth: "25%",
                        maxWidth: "55%",
                        margin: "auto",
                      }}
                    >
                      <Button
                        loading={loading}
                        icon={<SaveOutlined />}
                        type="primary"
                        block
                        htmlType="submit"
                      >
                        Confirmar entrada
                      </Button>
                    </Flex>
                  </>
                )}
              />
            </Form>
          </div>
        </Col>
        <Divider />
        <Drawer
          title={"Nueva cuenta por pagar"}
          width={868}
          onClose={() => dispatch(setOpenDrawer(false))}
          open={openDrawer}
          styles={{
            body: {
              paddingBottom: 80,
            },
            /* header: {
              background: perfilProveedor?.id ? "#e6f7ff" : "white"
            } */
          }}
        >
          {openDrawer && <FormCXP form={formCXP} />}
        </Drawer>
      </Row>
    </>
  );
};

export default DynamicTableArticulosOrdenados;
