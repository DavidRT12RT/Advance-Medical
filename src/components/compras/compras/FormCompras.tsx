"use client";
import React from "react";
import { Badge, Button, Checkbox, Col, Collapse, DatePicker, Descriptions, Divider, Drawer, Flex, Form, Grid, Input, List, Row, Select, Tooltip, Typography, Upload } from 'antd';
import { UndoOutlined, SaveOutlined, PlusOutlined, FilePdfOutlined, EyeOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { setDetallePoliza, setListaPoliza, setOpenDrawerPoliza } from "@/features/ventasSlice";
import FireStoreVentas from "@/firebase/FireStoreVentas";
// import DynamicTableArticulos from "./DynamicTableArticulos";
import '../../../app/finanzas.css';
import DynamicTableGastos from "./DynamicTableGastos";
import FireStoreRecursosHumanos from "@/firebase/FireStoreRecursosHumanos";
import { setListaDeUsuarios } from "@/features/recursosHumanosSlice";
import FireStoreFinanzas from "@/firebase/FireStoreFinanzas";
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { setLoading, setOpenDrawer, setRefresh, setTotalDeLaCompra } from "@/features/finanzasSlice";
import Swal from "sweetalert2";
import FormPolizaDePago from "@/components/ventas/clientes/FormPolizaDePago";
import StaticTableArticulos from "./StaticTableArticulos";
import StaticTableGastos from "./StaticTableGastos";

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { generateRandomString, NumberFormatUSD } from "@/helpers/functions";
import { enviarEmail } from "@/helpers/email";
import DynamicTableCompras from "./DynamicTableCompras";
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import { setListaDeSucursales } from "@/features/configuracionSlice";
dayjs.extend(customParseFormat);


const { useBreakpoint } = Grid;

const uploadFilesEmpresaFB = async (file: any, proveedorId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `comprasFiles/${proveedorId}/${file?.name}`);
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

const swalAlertInput = async (title: string) => {
  return await Swal.fire({
    icon: "info",
    input: "text",
    title: title,
    // text: title,
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Agregar",
    denyButtonText: "Cancelar",
    confirmButtonColor: "#1677ff",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (!Boolean(value?.trim()?.length)) {
        return `Debe ${title?.toLowerCase()}`;
      }
    }
  });
}

const FORMA_DE_ENTREGA = [
  { label: 'Envío a domicilio', value: 'Envío a domicilio' },
  { label: 'Recogo en sucursal', value: 'Recogo en sucursal' },
];


const style: React.CSSProperties = { width: '100%' };

const FormCompras = ({ form }: any) => {

  const [listaMetodosPago, setListaMetodosPago] = React.useState<any[]>([]);
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [formPoliza] = Form.useForm();

  const {
    listaPoliza = [],
    openDrawerPoliza,
    refresh
  } = useSelector((state: any) => state.ventas);
  const { auth } = useSelector((state: any) => state.configuracion);
  const { listaDeUsuarios = [] } = useSelector((state: any) => state.recursosHumanos);

  const {
    loading,
    totalDeLaCompra = {},
    detalleDeCompra,
  } = useSelector((state: any) => state.finanzas);

  console.log('detalleDeCompra', detalleDeCompra)

  const { articulos = [], gastosAdicionales = [] } = totalDeLaCompra;
  console.log('articulos', articulos)
  const [totalArticulos = 0, totalGastosAdicionales = 0] = [
    articulos.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),
    gastosAdicionales.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),
  ];
  const totalDeTotales: any = (totalArticulos + totalGastosAdicionales);


  const [test, settest] = React.useState<any>({ factura: [] });
  const [metodoDePago, setMetodoDePago] = React.useState<any>();

  const [selectedPoliza, setSelectedPoliza] = React.useState<any[]>([]);

  // lista de bodegas
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreConfiguracion.listarSucursales({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeSucursales) => {
        dispatch(setListaDeSucursales(listaDeSucursales));
      });
    }
  }, [auth]);

  // lista de polizas
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarSubCollectionEmpresa(
        auth?.empresa?.id, "polizas"
      ).then((listaDePoliza: any) => {
        dispatch(setListaPoliza(listaDePoliza));
      });
    }
  }, [auth, refresh]);


  const POLIZAS = listaPoliza.map((poliza: any) => {
    return { ...poliza, label: `${/* poliza?.codigoPoliza */""} - ${poliza?.limiteCredito} monto máximo de crédito`, value: poliza?.id };
  });

  // lista de usuarios (colaboradores)
  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : "",
      }).then((listaDeUsuarios) => {
        dispatch(setListaDeUsuarios(listaDeUsuarios));
      });
    }
  }, [auth]);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreFinanzas.listarSubCollectionEmpresa(auth?.empresa?.id, "metodosDePago")
        .then((metodosPago: any) => {
          const formattedMetodos = metodosPago.map((metodo: any) => ({
            label: metodo.nombre,
            value: metodo.id
          }));
          setListaMetodosPago(formattedMetodos);
        })
        .catch((error) => console.error('Error al obtener métodos de pago:', error));
    }
  }, [auth]);
  

  const GERENTE_DE_COMPRAS = listaDeUsuarios.map((usuario: any) => {
    return { ...usuario, label: `${usuario?.nombres} ${usuario?.apellidos}`, value: usuario?.id };
  });

  let DOCUMENTOS_SOLICITADOS: any = [
    { "Factura": "Factura" },
  ]
    .map((doc: any, index: number) => {

      const [[key, value]] = Object.entries(doc);

      return [
        {
          key: `Documento-${String((index + 1))}`,
          label: "Documento",
          children: value,
        },
        {
          key: `Archivo-${String((index + 1))}`,
          label: "Archivo",
          children: (

            <Upload
              /* multiple */
              accept="application/pdf"
              listType="picture"
              fileList={(test?.[key] || []).map((f: any) => ({
                ...f,
                name: `${f?.name?.length > 30 ? f?.name.slice(0, 30) + "..." : f?.name}`
              }))}
              maxCount={1}
              onChange={({ fileList: newFileList }: any) => {
                settest((oldData: any) => ({ ...oldData, [key]: newFileList.slice(-1) }));
              }}
              beforeUpload={() => false}
            >
              <Button block type="dashed" icon={<FilePdfOutlined />}>Cargar archivo</Button>
            </Upload>

          ),
        }
      ]
    });

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  // DETALLES Y TOTALES

  let DETALLES_Y_TOTALES: any = [
    [
      {
        key: `Total-de-la-compra`,
        label: <Typography.Text strong>Total de la compra</Typography.Text>,
        children: <Typography.Text strong>{detalleDeCompra?.id ? NumberFormatUSD(Number(totalDeTotales) + Number(detalleDeCompra?.totalDeLaCompra)) : NumberFormatUSD(Number(totalDeTotales))}</Typography.Text>// totalDeLaCompra,
      },
    ]
  ];

  DETALLES_Y_TOTALES = DETALLES_Y_TOTALES.flat();

  // Documentos cargados
  let DOCUMENTOS_SOLICITADOS_CARGADOS = (detalleDeCompra?.documentos || [])
    .map((doc: any, index: number) => {
      return [
        {
          key: String((index + 1)),
          label: "Documento",
          children: doc?.documento || "---",
        },
        {
          key: String((index + 1)),
          label: "Archivo",
          children: (
            <Button.Group>
              <Button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<EyeOutlined />}>Visualizar archivo</Button>
              <Button
                onClick={async () => {
                  const a = document.createElement('a');
                  a.href = doc?.url;
                  a.target = "_blank";
                  a.download = doc?.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                block
                type="dashed"
                icon={<CloudDownloadOutlined />}>Descargar archivo</Button>
            </Button.Group>
          ),
        },

      ]
    });
    

  DOCUMENTOS_SOLICITADOS_CARGADOS = DOCUMENTOS_SOLICITADOS_CARGADOS.flat();


  return (
    <>
      <Form
        form={form}
        onValuesChange={(changedValues, allValues) => {

        }}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          // proveedor: "",
          fechaDeCompra: dayjs(),//moment('2019-09-03', 'YYYY-MM-DD'),
          fechaEstimadaDeLlegada: "",
          metodoDePago: "",
          poliza: "",
          articulos: "",
          gastosAdicionales: "",
          totalDeLaCompra: "",
          formaDeEntrega: "",
          responsableDeLaCompra: "",
          comentariosAdicionales: "",
          factura: "",
          solicitarFactura: false
        }}
        onFinish={async (values) => {

          const [fechaRegistro] = new Date().toISOString().split('T');
          const proveedores = articulos.map((articulo: any) => {
            return articulo?.proveedor;
          });

          const proveedoresUnicos = new Set(proveedores);
          const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);
          const subOrdenes: any[] = [];

          const codigoCompra = generateRandomString();

          try {
            dispatch(setLoading(true));

            const idPostulante = uuidv4();
            // CARGAMOS LOS ARCHIVOS A STORAGE
            const allFiles = [];
            for (const key in test) {
              const [firstFile] = test[key];
              if (firstFile) {
                allFiles.push(uploadFilesEmpresaFB(firstFile?.originFileObj, idPostulante))
              }
            }

            const responseFilesUpload = await Promise.all(allFiles);
            const filesUploaded: any[] = [];
            responseFilesUpload.forEach(({ url, contentType, fullPath, name }: any, index: number) => {
              filesUploaded.push({
                documento: Object.keys(test)[index],
                estatus: "En revisión",
                url,
                name,
                fullPath,
                contentType,
              });
            });


            if (detalleDeCompra?.id) {// UPDATE
              console.log('values :>> ', values);
              await FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                id: detalleDeCompra?.id,
                ...values,
                fechaDeCompra: values?.fechaDeCompra.format('YYYY-MM-DD'),
                fechaEstimadaDeLlegada: values?.fechaEstimadaDeLlegada.format('YYYY-MM-DD'),
                articulos: [...(detalleDeCompra?.articulos || []), ...articulos],
                gastosAdicionales: [...(detalleDeCompra?.gastosAdicionales || []), ...gastosAdicionales],
                totalDeLaCompra: (totalDeTotales + detalleDeCompra?.totalDeLaCompra),
                documentos: [...(detalleDeCompra?.documentos || []), ...filesUploaded],
              });

              
            } else {// REGISTER

              const idCompra = await FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                ...values,
                fechaDeCompra: values?.fechaDeCompra.format('YYYY-MM-DD'),
                fechaEstimadaDeLlegada: values?.fechaEstimadaDeLlegada.format('YYYY-MM-DD'),
                articulos: articulos,
                gastosAdicionales: gastosAdicionales,
                totalDeLaCompra: totalDeTotales,
                documentos: filesUploaded,
                fechaRegistroDoc: fechaRegistro,
                estatus: "Pendiente",
                codigoCompra,
                isParent: true
              });

              if (proveedoresUnicosArray.length > 1) {
                proveedoresUnicosArray.forEach((idProveedor: string, index: number) => {
                  const articulosSubOrden = articulos.filter((articulo: any) => articulo?.proveedor === idProveedor);
                  subOrdenes.push(
                    FireStoreFinanzas.registrarCompra(auth?.empresa?.id, {
                      ...values,
                      fechaDeCompra: values?.fechaDeCompra.format('YYYY-MM-DD'),
                      fechaEstimadaDeLlegada: values?.fechaEstimadaDeLlegada.format('YYYY-MM-DD'),
                      articulos: articulosSubOrden,// Filtramos solo los articulos de ese proveedor
                      gastosAdicionales: gastosAdicionales,// Establecer los mismos gastos adicionales???
                      totalDeLaCompra: articulosSubOrden.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),//totalDeTotales,// Calcular el total de la compra
                      documentos: filesUploaded,
                      fechaRegistroDoc: fechaRegistro,
                      estatus: "Pendiente",
                      codigoCompra: `${codigoCompra}-${(index + 1)}`,
                      isParent: false,
                      idParent: idCompra
                    }));
                });
              }

              await Promise.all(subOrdenes);

              const findResponsableDeLaCompra = GERENTE_DE_COMPRAS.find((responsable: any) => responsable?.id === values?.responsableDeLaCompra);
              await enviarEmail({
                to: findResponsableDeLaCompra?.email,
                subject: "Aprobación de Orden de Compra Requerida",
                plantilla: "generarPlantillaHTMLAprobacionCompra",
                // data para la plantilla
                numeroOrden: codigoCompra,
                solicitante: auth?.empresa?.nombre || "",
                fechaSolicitud: fechaRegistro || "",
                montoTotal: NumberFormatUSD(Number(totalDeTotales)),
                enlaceOrden: `${location.origin}/finanzas/compras/${idCompra}?cc=${codigoCompra}`,
                nombreEmpresa: auth?.empresa?.nombreDeLaEmpresa || "",
                nombreDelResponsable: `${findResponsableDeLaCompra?.nombres || ""} ${findResponsableDeLaCompra?.apellidos || ""}`
              });

            }

            settest({
              factura: []
            });

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawer(false));

            dispatch(setRefresh(Math.random()));
            dispatch(setTotalDeLaCompra({}));

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Compra ${detalleDeCompra?.id ? 'actualizada' : 'registrada'} con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            console.log('error', error);
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


          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item name="fechaDeCompra" label="Fecha de compra" rules={[{ required: true, message: 'Ingrese fecha de compra' }]}>
              <DatePicker onChange={() => { }} style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item name="fechaEstimadaDeLlegada" label="Fecha esperada de llegada" rules={[{ required: true, message: 'Ingrese fecha estimada de llegada' }]}>
              <DatePicker onChange={() => { }} style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={12} xl={12}>
            <Form.Item
              name="metodoDePago"
              label="Método de Pago"
              rules={[{ required: true, message: 'Seleccione método de pago' }]}
            >
              <Select
                onChange={setMetodoDePago}
                options={listaMetodosPago}
                placeholder="Seleccione método de pago"
                style={style}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      block
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput("Agregar método de pago");
                          if (isConfirmed && value) {
                            const newId = uuidv4();
                            await FireStoreFinanzas.agregarDocumentoEmpresasCollection(
                              auth?.empresa?.id,
                              newId,
                              { nombre: value },
                              "metodosDePago"
                            );

                            // Actualizar la lista de métodos de pago
                            const metodosPago = await FireStoreFinanzas.listarSubCollectionEmpresa(auth?.empresa?.id, "metodosDePago");
                            const formattedMetodos = metodosPago.map((metodo: any) => ({
                              label: metodo.nombre,
                              value: metodo.id
                            }));
                            setListaMetodosPago(formattedMetodos);

                            form.setFieldsValue({ metodoDePago: newId });

                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: 'Método de pago agregado con éxito',
                              showConfirmButton: false,
                              timer: 1500
                            });
                          }
                        } catch (error) {
                          console.error('Error al agregar método de pago:', error);
                          Swal.fire({
                            title: "Error",
                            text: "No se pudo agregar el método de pago",
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar método de pago
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={12} xl={12}>
            <Form.Item
              name="poliza"
              label="Politicas de pagos"
              style={{ display: metodoDePago == "Crédito" ? '' : 'none' }}
              rules={[{ required: metodoDePago == "Crédito" ? true : false, message: 'Seleccione politicas de pagos' }]}>
              <Input.Group compact style={{ display: 'flex' }}>
                <Select
                  options={POLIZAS}
                  placeholder="Seleccione politicas de pago"
                  style={{ flex: 1 }}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    form.setFieldValue("poliza", value);
                    setSelectedPoliza(value);
                  }}
                />
                <Tooltip title="Nueva póliza">
                  <Button icon={<PlusOutlined />} style={{ flex: '0 0 50px' }} onClick={() => {
                    // Abrir el formulario de registrar articulos
                    formPoliza.resetFields();
                    dispatch(setOpenDrawerPoliza(true));
                    dispatch(setDetallePoliza(null));
                  }} />
                </Tooltip>
              </Input.Group>
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
                      key: '1',
                      label: (
                        <Badge offset={[15, 12]} count={(detalleDeCompra?.articulos || [])?.length}>
                          <Typography.Text strong>
                            {`Lista de artículos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <StaticTableArticulos dataSource={detalleDeCompra?.articulos || []} />
                      )
                    },
                  ]}
                />
              </>
            )}
            <DynamicTableCompras form={form} />
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
                      key: '1',
                      label: (
                        <Badge offset={[15, 12]} count={(detalleDeCompra?.gastosAdicionales || [])?.length}>
                          <Typography.Text strong>
                            {`Lista de gastos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <StaticTableGastos dataSource={detalleDeCompra?.gastosAdicionales || []} />
                      )
                    },
                  ]}
                />
              </>
            )}
            <DynamicTableGastos form={form} />
          </Col>
        </Row>


        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            <div style={{ minWidth: screens.md ? "300px" : "600px", overflow: "auto" }}>
              <Descriptions size='small' column={1} bordered items={DETALLES_Y_TOTALES} />
            </div>
            <Divider />
          </Col>

          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item name="formaDeEntrega" label="Forma de entrega" rules={[{ required: false, message: 'Seleccione forma de entrega' }]}>
              <Select options={FORMA_DE_ENTREGA} placeholder="Seleccione forma de entrega" style={style} />
            </Form.Item>
          </Col>


          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item name="responsableDeLaCompra" label="Gerente de Compras" rules={[{ required: true, message: 'Seleccione responsable de la compra' }]}>
              <Select options={GERENTE_DE_COMPRAS} placeholder="Seleccione responsable de la compra" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item name="comentariosAdicionales" label="Comentarios adicionales" rules={[{ required: false, message: 'Ingrese comentarios adicionales' }]}>
              <Input.TextArea rows={3} showCount maxLength={400} placeholder="Ingrese comentarios adicionales" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={24} xl={24}>
            {Boolean(detalleDeCompra?.id) && (
              <>
                <Collapse
                  size="small"
                  defaultActiveKey={[]}
                  items={[
                    {
                      key: '1',
                      label: (
                        <Badge offset={[15, 12]} count={(detalleDeCompra?.documentos || [])?.length}>
                          <Typography.Text strong>
                            {`Documentos registrados`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <div style={{ minWidth: screens.md ? "300px" : "600px", overflow: "auto" }}>
                          <Descriptions size='small' column={1} bordered items={DOCUMENTOS_SOLICITADOS_CARGADOS} />
                        </div>
                      )
                    },
                  ]}
                />
                <Divider />
              </>
            )}
            <div style={{ minWidth: screens.md ? "300px" : "600px", overflow: "auto" }}>
              <Descriptions size='small' column={1} bordered items={DOCUMENTOS_SOLICITADOS} />
            </div>
          </Col>

          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item valuePropName="checked" name="solicitarFactura" rules={[{ required: false, message: '' }]}>
              <Checkbox>Solicitar factura</Checkbox>
            </Form.Item>
          </Col>

        </Row>


        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
              <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset"> Limpiar </Button>
              <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit"> Guardar </Button>
            </Flex>
          </Col>
        </Row>

      </Form>
      {(metodoDePago == "Crédito") && (
        <Drawer
          title={detalleDeCompra?.id ? 'Editar póliza' : 'Nueva póliza'}
          width={768}
          onClose={() => dispatch(setOpenDrawerPoliza(false))}
          open={openDrawerPoliza}
          styles={{
            body: {
              paddingBottom: 80,
            },
            /* header: {
              background: perfilProveedor?.id ? "#e6f7ff" : "white"
            } */
          }}>
          <FormPolizaDePago form={formPoliza} />
        </Drawer>

      )}
    </>

  );
};

export default FormCompras;
