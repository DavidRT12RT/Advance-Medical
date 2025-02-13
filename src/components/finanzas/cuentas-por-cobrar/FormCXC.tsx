"use client";
import React from "react";
import {
  Badge,
  Button,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import "../../../app/finanzas.css";

import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  setDetalleDeCompra,
  setListaDeCompras,
  setLoading,
  setOpenDrawer,
  setRefresh,
  setTotalDeLaCompra,
  setIdNuevoProveedor,
} from "@/features/finanzasSlice";
import Swal from "sweetalert2";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { generateRandomString } from "@/helpers/functions";
import StaticTableArticulos from "@/components/compras/compras/StaticTableArticulos";
import DynamicTableArticulos from "@/components/compras/compras/DynamicTableArticulos";
import StaticTableGastos from "@/components/compras/compras/StaticTableGastos";
import DynamicTableGastos from "@/components/compras/compras/DynamicTableGastos";
import { enviarEmail } from "@/helpers/email";
import FormProveedores from "@/components/compras/proveedores/FormProveedores";
import {
  setPerfilProveedores,
  setOpenDrawer as setOpenDrawerProveedor,
} from "@/features/ventasSlice";
dayjs.extend(customParseFormat);

const { useBreakpoint } = Grid;

const uploadFilesEmpresaFB = async (file: any, proveedorId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `CXPFiles/${proveedorId}/${file?.name}`);
  try {
    // Subir imagen
    const { metadata } = await uploadBytes(storageRef, file, {
      contentType: file?.type,
    });
    const { bucket, contentType, name, fullPath } = metadata;
    // Obtener URL de descarga
    const imageUrl = await getDownloadURL(storageRef);
    return { url: imageUrl, bucket, contentType, name, fullPath };
  } catch (error) {
    throw error;
  }
};

const TIPO = [
  { label: "Nota de crédito", value: "Nota de crédito" },
  { label: "Factura", value: "Factura" },
];

const style: React.CSSProperties = { width: "100%" };

const FormCXC = ({ form }: any) => {
  const [formProveedores] = Form.useForm();

  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const {
    listaDeProveedores = [],
    perfilProveedor,
    openDrawer,
  } = useSelector((state: any) => state.ventas);

  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    loading,
    totalDeLaCompra = {},
    detalleDeCompra,
    detalleDeCXP,
    listaDeCompras = [],
    idNuevoProveedor,
  } = useSelector((state: any) => state.finanzas);

  const { articulos = [], gastosAdicionales = [] } = totalDeLaCompra;
  const [totalArticulos = 0, totalGastosAdicionales = 0] = [
    articulos.reduce(
      (a: any, cv: any) => a + (cv.subtotal ? Number(cv.subtotal) : 0),
      0
    ),
    gastosAdicionales.reduce(
      (a: any, cv: any) => a + (cv.subtotal ? Number(cv.subtotal) : 0),
      0
    ),
  ];

  const totalDeTotales: any = totalArticulos + totalGastosAdicionales;

  const [test, settest] = React.useState<any>({ factura: [] });
  const [tipoDocumento, setTipoDocumento] = React.useState<any>();
  const [correo, setCorreo] = React.useState<string>();

  const PROVEEDORES = listaDeProveedores.map((proveedor: any) => {
    return {
      ...proveedor,
      label: proveedor?.nombreProveedor,
      value: proveedor?.id,
    };
  });

  const COMPRAS = listaDeCompras.map((compra: any) => {
    return { ...compra, label: compra?.codigoCompra, value: compra?.id };
  });

  // LISTAR COMPRAS (ORDENES DE COMPRAS)
  React.useEffect(() => {
    FireStoreFinanzas.listarCompras({
      idEmpresa: auth?.empresa?.id || "",
    }).then((listaDeCompras) => {
      dispatch(setListaDeCompras(listaDeCompras));
    });
  }, []);

  // Este efecto se ejecuta cuando cambia el detalle de compra desde ordenes en transito
  React.useEffect(() => {
    form.setFieldsValue(detalleDeCompra);
    // form.submit();
  }, [detalleDeCompra]);

  let DOCUMENTOS_SOLICITADOS: any = [{ [tipoDocumento]: tipoDocumento }].map(
    (doc: any, index: number) => {
      const [[key, value]] = Object.entries(doc);

      return [
        {
          key: `Documento-${String(index + 1)}`,
          label: "Documento",
          children: value,
        },
        {
          key: `Archivo-${String(index + 1)}`,
          label: "Archivos",
          children: (
            <Upload
              multiple
              accept="application/pdf,application/xml"
              listType="picture"
              fileList={(test?.[key] || []).map((f: any) => ({
                ...f,
                name: `${
                  f?.name?.length > 30 ? f?.name.slice(0, 30) + "..." : f?.name
                }`,
              }))}
              maxCount={2}
              onChange={({ fileList: newFileList }: any) => {
                settest((oldData: any) => ({
                  ...oldData,
                  [key]: newFileList.slice(-2),
                }));
              }}
              beforeUpload={() => false}
            >
              <Button block type="dashed" icon={<FilePdfOutlined />}>
                Cargar archivo
              </Button>
            </Upload>
          ),
        },
      ];
    }
  );

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  // DETALLES Y TOTALES

  let DETALLES_Y_TOTALES: any = [
    [
      {
        key: `Total-de-la-compra`,
        label: <Typography.Text strong>Total de la compra</Typography.Text>,
        children: (
          <Typography.Text strong>
            {Number(
              totalDeTotales || detalleDeCompra?.totalDeLaCompra || 0
            ).toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </Typography.Text>
        ), // totalDeLaCompra,
      },
    ],
  ];

  DETALLES_Y_TOTALES = DETALLES_Y_TOTALES.flat();

  // Documentos cargados
  let DOCUMENTOS_SOLICITADOS_CARGADOS = (detalleDeCompra?.documentos || []).map(
    (doc: any, index: number) => {
      return [
        {
          key: String(index + 1),
          label: "Documento",
          children: doc?.documento || "---",
        },
        {
          key: String(index + 1),
          label: "Archivo",
          children: (
            <Button.Group>
              <Button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<EyeOutlined />}
              >
                Visualizar archivo
              </Button>
              <Button
                onClick={async () => {
                  const a = document.createElement("a");
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<CloudDownloadOutlined />}
              >
                Descargar archivo
              </Button>
            </Button.Group>
          ),
        },
      ];
    }
  );

  DOCUMENTOS_SOLICITADOS_CARGADOS = DOCUMENTOS_SOLICITADOS_CARGADOS.flat();

  // AL REGISTRAR UN NUEVO PROVEEDOR AGREGAMOS ESE PROVEEDOR AL SELECT MULTIPLE
  React.useEffect(() => {
    if (idNuevoProveedor) {
      setTimeout(() => {
        dispatch(setIdNuevoProveedor(null));
        const idsProveedores = form.getFieldValue("proveedor") || [];
        form.setFieldValue("proveedor", [...idsProveedores, idNuevoProveedor]);
      }, 600);
    }
  }, [listaDeProveedores, idNuevoProveedor]);

  return (
    <>
      <Form
        form={form}
        onValuesChange={(changedValues, allValues) => {}}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          codigo: generateRandomString(),
          fechaDeCompra: dayjs(), //moment('2019-09-03', 'YYYY-MM-DD'),
          ordenDeCompra: "",
          conceptoDeCompra: "",
          tipo: "",
          proveedor: [],
          factura: "",
          solicitarFactura: false,
        }}
        onFinish={async (values) => {
          try {
            dispatch(setLoading(true));

            const uuid = uuidv4();
            // CARGAMOS LOS ARCHIVOS A STORAGE
            const allFiles: any[] = [];
            for (const key in test) {
              (test[key] || []).forEach((file: any) => {
                allFiles.push(uploadFilesEmpresaFB(file?.originFileObj, uuid));
              });
            }

            const responseFilesUpload = await Promise.all(allFiles);
            const filesUploaded: any[] = [];
            responseFilesUpload.forEach(
              ({ url, contentType, fullPath, name }: any, index: number) => {
                filesUploaded.push({
                  documento: Object.keys(test)[index],
                  estatus: "En revisión",
                  url,
                  name,
                  fullPath,
                  contentType,
                });
              }
            );

            if (detalleDeCXP?.id) {
              // UPDATE
              /* await FireStoreFinanzas.registrarCXP(auth?.empresa?.id, {
                ...values,
                articulos: [...(detalleDeCompra?.articulos || []), ...articulos],
                gastosAdicionales: [...(detalleDeCompra?.gastosAdicionales || []), ...gastosAdicionales],
                totalDeLaCompra: totalDeTotales,
                documentos: [...(detalleDeCompra?.documentos || []), ...filesUploaded],
              }); */
            } else {
              // REGISTER
              const [fechaRegistro] = new Date().toISOString().split("T");
              await FireStoreFinanzas.registrarCXP(auth?.empresa?.id, {
                ...values,
                articulos: Boolean(values?.ordenDeCompra)
                  ? detalleDeCompra?.articulos
                  : articulos,
                gastosAdicionales: Boolean(values?.ordenDeCompra)
                  ? detalleDeCompra?.gastosAdicionales
                  : gastosAdicionales,
                totalDeLaCompra: Boolean(values?.ordenDeCompra)
                  ? detalleDeCompra?.totalDeLaCompra
                  : totalDeTotales,
                documentos: filesUploaded,
                fechaRegistroDoc: fechaRegistro,
                fechaDeCompra: values?.fechaDeCompra.format("YYYY-MM-DD"),
                estatus: "Pendiente",
              });

              if (values?.solicitarFactura) {
                const findProveedor = listaDeProveedores.find(
                  ({ id: idProveedor }: any) => idProveedor == values?.proveedor
                );
                await enviarEmail({
                  to: correo,
                  subject: `Solicitud de Factura para Pago de ${values?.conceptoDeCompra}`,
                  plantilla: "generarPlantillaHTMLSolicitudFactura",
                  // data
                  nombreProveedor: findProveedor?.nombreProveedor || "",
                  montoFactura: Boolean(values?.ordenDeCompra)
                    ? detalleDeCompra?.totalDeLaCompra
                    : totalDeTotales,
                  conceptoCompra: values?.conceptoDeCompra || "",
                  listaArticulos: Boolean(values?.ordenDeCompra)
                    ? detalleDeCompra?.articulos
                    : articulos,
                  nombreSolicitante: auth?.empresa?.nombre || "",
                  nombreEmpresa: auth?.empresa?.nombreDeLaEmpresa || "",
                });
              }
            }

            settest({
              factura: [],
            });

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawer(false));

            dispatch(setRefresh(Math.random()));
            dispatch(setTotalDeLaCompra({}));

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Compra por pagar ${
                detalleDeCompra?.id ? "actualizada" : "registrada"
              } con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            console.log("error", error);
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error",
            });
          } finally {
            dispatch(setLoading(false));
          }
        }}
      >
        <Row gutter={12}>
          {/* <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item name="proveedor" label="Proveedor" rules={[{ required: true, message: 'Seleccione un proveedor' }]}>
              <Select options={PROVEEDORES} placeholder="Seleccione un proveedor" style={style} />
            </Form.Item>
          </Col> */}

          <Col xs={24} sm={12} lg={8} xl={8}>
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ required: true, message: "Código" }]}
            >
              <Input placeholder="Ingrese Código" maxLength={6} style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={8}>
            <Form.Item
              name="ordenDeCompra"
              label="Orden de compra"
              rules={[
                { required: false, message: "Seleccione Orden de compra" },
              ]}
            >
              <Select
                onChange={(idCompra) => {
                  const findOrdenDeCompra = listaDeCompras.find(
                    (compra: any) => {
                      return compra?.id == idCompra;
                    }
                  );

                  if (findOrdenDeCompra) {
                    dispatch(setTotalDeLaCompra({}));
                    dispatch(setDetalleDeCompra(findOrdenDeCompra));
                    form.setFieldValue(
                      "fechaDeCompra",
                      dayjs(findOrdenDeCompra?.fechaDeCompra, "YYYY-MM-DD")
                    );

                    const proveedores = (
                      findOrdenDeCompra?.articulos || []
                    ).map((articulo: any) => {
                      return articulo?.proveedor;
                    });

                    const proveedoresUnicos = new Set(proveedores);
                    const proveedoresUnicosArray: any[] =
                      Array.from(proveedoresUnicos);

                    form.setFieldValue("proveedor", proveedoresUnicosArray);
                  } else {
                    dispatch(setDetalleDeCompra(null));
                  }
                }}
                options={[
                  {
                    label: "Seleccione compra",
                    value: "",
                  },
                  ...COMPRAS,
                ]}
                placeholder="Seleccione Orden de compra"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={8} xl={8}>
            <Form.Item
              name="fechaDeCompra"
              label="Fecha de compra"
              rules={[{ required: true, message: "Ingrese fecha de compra" }]}
            >
              <DatePicker onChange={() => {}} style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item
              name="conceptoDeCompra"
              label="Concepto de compra"
              rules={[{ required: true, message: "Concepto de compra" }]}
            >
              <Input.TextArea
                showCount
                maxLength={200}
                placeholder="Ingrese Concepto de compra"
                style={style}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean(detalleDeCompra?.id) && (
              <>
                <Collapse
                  size="small"
                  defaultActiveKey={[]}
                  items={[
                    {
                      key: "1",
                      label: (
                        <Badge
                          offset={[15, 12]}
                          count={(detalleDeCompra?.articulos || [])?.length}
                        >
                          <Typography.Text strong>
                            {`Lista de artículos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <StaticTableArticulos
                          dataSource={detalleDeCompra?.articulos || []}
                          showActions={false}
                        />
                      ),
                    },
                  ]}
                />
              </>
            )}
            {/* <div style={{ display: Boolean(detalleDeCompra) ? "none" : "" }}> */}
            {!Boolean(detalleDeCompra) && <DynamicTableArticulos form={form} />}
            {/* </div> */}
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean(detalleDeCompra) && <div style={{ padding: "0.75rem" }} />}
            {Boolean(detalleDeCompra?.id) && (
              <>
                <Collapse
                  size="small"
                  defaultActiveKey={[]}
                  items={[
                    {
                      key: "1",
                      label: (
                        <Badge
                          offset={[15, 12]}
                          count={
                            (detalleDeCompra?.gastosAdicionales || [])?.length
                          }
                        >
                          <Typography.Text strong>
                            {`Lista de gastos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <StaticTableGastos
                          dataSource={detalleDeCompra?.gastosAdicionales || []}
                          showActions={false}
                        />
                      ),
                    },
                  ]}
                />
              </>
            )}

            {/* <div style={{ display: Boolean(detalleDeCompra) ? "none" : "" }}> */}
            {!Boolean(detalleDeCompra) && <DynamicTableGastos form={form} />}
            {/* </div> */}
            {Boolean(detalleDeCompra) && <div style={{ padding: "0.75rem" }} />}
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24} style={{ display: "" }}>
            <div
              style={{
                minWidth: screens.md ? "300px" : "600px",
                overflow: "auto",
              }}
            >
              <Descriptions
                size="small"
                column={1}
                bordered
                items={DETALLES_Y_TOTALES}
              />
            </div>
            <Divider />
          </Col>
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              name="tipo"
              label="Tipo"
              rules={[{ required: true, message: "Seleccione Tipo" }]}
            >
              <Select
                onChange={(value) => {
                  setTipoDocumento(value);
                }}
                options={TIPO}
                placeholder="Seleccione Tipo"
                style={style}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              name="proveedor"
              label="Proveedor"
              rules={[{ required: true, message: "Seleccione Proveedor" }]}
            >
              <Select
                mode="multiple"
                onChange={() => {}}
                options={PROVEEDORES}
                placeholder="Seleccione Proveedor"
                style={style}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      block
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        // Abrir el formulario de registrar articulos
                        formProveedores.resetFields();
                        dispatch(setPerfilProveedores(null));
                        dispatch(setOpenDrawerProveedor(true));
                      }}
                    >
                      Nuevo proveedor
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean(detalleDeCompra?.id) && (
              <>
                <Collapse
                  size="small"
                  defaultActiveKey={[]}
                  items={[
                    {
                      key: "1",
                      label: (
                        <Badge
                          offset={[15, 12]}
                          count={(detalleDeCompra?.documentos || [])?.length}
                        >
                          <Typography.Text strong>
                            {`Documentos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <div
                          style={{
                            minWidth: screens.md ? "300px" : "600px",
                            overflow: "auto",
                          }}
                        >
                          <Descriptions
                            size="small"
                            column={1}
                            bordered
                            items={DOCUMENTOS_SOLICITADOS_CARGADOS}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
                <Divider />
              </>
            )}
            <div
              style={{
                minWidth: screens.md ? "300px" : "600px",
                overflow: "auto",
              }}
            >
              <Descriptions
                size="small"
                column={1}
                bordered
                items={DOCUMENTOS_SOLICITADOS}
              />
            </div>
          </Col>

          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item
              valuePropName="checked"
              name="solicitarFactura"
              rules={[{ required: false, message: "" }]}
            >
              <Checkbox
                onChange={async (event: any) => {
                  if (event.target.checked) {
                    const findProveedorSeleccionado = listaDeProveedores.find(
                      (proveedor: any) => {
                        return proveedor?.id == form.getFieldValue("proveedor");
                      }
                    );

                    const { value: email } = await Swal.fire({
                      inputValue:
                        findProveedorSeleccionado?.correoContacto ||
                        findProveedorSeleccionado?.emailCompras ||
                        findProveedorSeleccionado?.emailFacturacion ||
                        "",
                      title: "Correo de facturación del cliente",
                      input: "email",
                      inputLabel: "Ingrese correo de facturación del cliente",
                      inputPlaceholder:
                        "Ingrese correo de facturación del cliente",
                      showCancelButton: true,
                      cancelButtonText: "Cancelar",
                      confirmButtonText: "Aceptar",
                      inputValidator: (value) => {
                        if (!value) {
                          return "Correo electrónico no puede estar vacío.";
                        }
                        // Validar formato de correo
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                          return "Correo electrónico no válido!";
                        }
                        return null; // Retornar null si la validación pasa
                      },
                    });
                    if (email) {
                      setCorreo(email);
                      Swal.fire(`Correo electrónico seleccionado, ${email}`);
                    } else {
                      form.setFieldValue("solicitarFactura", false);
                      setCorreo("");
                    }
                  }
                }}
              >
                Solicitar factura
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: "50%", margin: "auto" }}>
              <Button
                loading={loading}
                icon={<UndoOutlined />}
                danger
                type="primary"
                block
                htmlType="reset"
              >
                {" "}
                Limpiar{" "}
              </Button>
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                type="primary"
                block
                htmlType="submit"
              >
                {" "}
                Guardar{" "}
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Drawer
        title={perfilProveedor?.id ? "Editar proveedor" : "Nuevo proveedor"}
        width={768}
        onClose={() => dispatch(setOpenDrawerProveedor(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilProveedor?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        <FormProveedores form={formProveedores} />
      </Drawer>
    </>
  );
};

export default FormCXC;
