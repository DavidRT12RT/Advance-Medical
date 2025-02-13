"use client";
import React from "react";
import Swal from "sweetalert2";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  List,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload,
  Drawer,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  FilePdfOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setOpenDrawer,
  setPerfilClientes,
  setRefresh,
  setDetallePoliza,
  setOpenDrawerPoliza,
  setListaPoliza,
  setIdNuevoCliente,
} from "@/features/ventasSlice";
import FireStoreVentas from "@/firebase/FireStoreVentas";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import GoogleAddress from "@/components/GoogleAddress";
import {
  setAddressMultiple,
  setDirecciones,
} from "@/features/configuracionSlice";
import FormPolizaDePago from "./FormPolizaDePago";

const style: React.CSSProperties = { width: "100%" };
const { useBreakpoint } = Grid;

const uploadFilesEmpresaFB = async (file: any, clienteId: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `clientesFiles/${clienteId}/${file?.name}`);
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

const DOCUMENTOS: any = {
  contratos: "Contratos",
  cfdi: "Cédula de identificación fiscal",
  otros: "Otros",
};

const MONEDAS = [
  { label: "USD", value: "USD" },
  { label: "Euros", value: "EUR" },
  { label: "Pesos Mexicanos", value: "MXN" },
  { label: "Pesos Colombianos", value: "COP" },
  { label: "Pesos Ecuatorianos", value: "ECS" },
];

const FormClientes = ({ form }: any) => {
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const [formPoliza] = Form.useForm();

  const { refresh, loading, listaPoliza, perfilCliente, openDrawerPoliza } =
    useSelector((state: any) => state.ventas);

  const idAddress = uuidv4();
  const { direcciones, addressMultiple, auth } = useSelector(
    (state: any) => state.configuracion
  );

  const [selectedPoliza, setSelectedPoliza] = React.useState<any[]>([]);

  React.useEffect(() => {
    dispatch(
      setDirecciones([
        { id: idAddress, element: <GoogleAddress id={idAddress} /> },
      ])
    );
  }, []);

  const [test, settest] = React.useState<any>({
    contratos: [],
    cfdi: [],
    otros: [],
  });

  let DOCUMENTOS_SOLICITADOS: any = [
    { contratos: "Contratos" },
    { cfdi: "Cédula de identificación fiscal" },
    { otros: "Otros" },
  ].map((doc: any, index: number) => {
    const [[key, value]] = Object.entries(doc);
    return [
      {
        key: `Documento-${String(index + 1)}`,
        label: "Documento",
        children: value,
      },
      {
        key: `Estado-${String(index + 1)}`,
        label: "Estado",
        children: <Badge status="warning" text="Pendiente" />,
      },
      {
        key: `Archivo-${String(index + 1)}`,
        label: "Archivo",
        children: (
          <Upload
            /* multiple */
            accept="application/pdf"
            listType="picture"
            fileList={(test?.[key] || []).map((f: any) => ({
              ...f,
              name: `${
                f?.name?.length > 30 ? f?.name.slice(0, 30) + "..." : f?.name
              }`,
            }))}
            maxCount={8}
            onChange={({ fileList: newFileList }: any) => {
              settest((oldData: any) => ({
                ...oldData,
                [key]: newFileList.slice(-1),
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
  });

  DOCUMENTOS_SOLICITADOS = DOCUMENTOS_SOLICITADOS.flat();

  // Documentos cargados
  let DOCUMENTOS_SOLICITADOS_CARGADOS = (perfilCliente?.documentos || []).map(
    (doc: any, index: number) => {
      console.log("doc", doc);
      return [
        {
          key: String(index + 1),
          label: "Documento",
          children: DOCUMENTOS[doc?.documento] || "---",
        },
        {
          key: String(index + 1),
          label: "Estado",
          children: (
            <Badge
              status={
                doc?.estatus == "Aceptado"
                  ? "success"
                  : doc?.estatus == "Rechazado"
                  ? "error"
                  : "processing"
              }
              text={doc?.estatus || "---"}
            />
          ),
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

  const POLIZAS = listaPoliza.map((poliza: any) => {
    return {
      ...poliza,
      label: `${poliza?.codigoPoliza} - ${poliza?.limiteCredito} monto máximo de crédito`,
      value: poliza?.id,
    };
  });

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarSubCollectionEmpresa(
        auth?.empresa?.id,
        "polizas"
      ).then((listaDePoliza: any) => {
        dispatch(setListaPoliza(listaDePoliza));
      });
    }
  }, [auth, refresh]);

  return (
    <>
      <Form
        form={form}
        name="login-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          // Informacion GENERAL
          nombreCliente: "",
          tipoIndustria: "",
          direccion: "",
          coordinates: { lat: null, lng: null },
          tipoDireccion: "",
          emailCompras: "",
          emailFacturacion: "",
          monedaUtilizada: "",
          // Informacion de Contacto
          nombreContacto: "",
          telefonoContacto: "",
          correoContacto: "",
          documentos: [],
          // Informacion pagos (Opcional)
          nombreBanco: "",
          numeroCuenta: "",
          nombreBeneficiario: "",
          monedaPago: "",
          fechaRegistroDoc: "",
          // Informacion por verificar con Hamer
          regimenFiscal: "",
          tipoProducto: "",
          // Poliza de pago
          poliza: "",
        }}
        onFinish={async (values) => {
          try {
            if (!perfilCliente?.id && !addressMultiple?.length) {
              Swal.fire({
                title: "Ingrese una dirección",
                text: "",
                icon: "warning",
              });
              return;
            }
            if (selectedPoliza.length === 0) {
              Swal.fire({
                title: "Ingrese politicas de pago",
                text: "",
                icon: "warning",
              });
              return;
            }

            dispatch(setLoading(true));

            const idPostulante = uuidv4();
            // CARGAMOS LOS ARCHIVOS A STORAGE
            const allFiles = [];
            for (const key in test) {
              const [firstFile] = test[key];
              if (firstFile) {
                allFiles.push(
                  uploadFilesEmpresaFB(firstFile?.originFileObj, idPostulante)
                );
              }
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

            if (perfilCliente?.id) {
              // UPDATE
              // Registrar el proveedor en Firestore
              await FireStoreVentas.registrarCliente(auth?.empresa?.id, {
                ...values,
                direcciones: [
                  ...(perfilCliente?.direcciones || []),
                  ...addressMultiple,
                ],
                documentos: [
                  ...(perfilCliente?.documentos || []),
                  ...filesUploaded,
                ],
              });
            } else {
              // REGISTER
              const [fechaRegistro] = new Date().toISOString().split("T");
              // Registrar el proveedor en Firestore
              const idNuevoCliente = await FireStoreVentas.registrarCliente(
                auth?.empresa?.id,
                {
                  ...values,
                  fechaRegistroDoc: fechaRegistro,
                  direcciones: addressMultiple,
                  documentos: filesUploaded,
                  poliza: selectedPoliza,
                }
              );
              dispatch(setIdNuevoCliente(idNuevoCliente));
            }

            settest({
              contratos: [],
              cfdi: [],
              otros: [],
            });

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawer(false));

            const idAddress = uuidv4();
            dispatch(
              setDirecciones([
                { id: idAddress, element: <GoogleAddress id={idAddress} /> },
              ])
            );
            dispatch(setAddressMultiple([]));
            dispatch(setRefresh(Math.random()));

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Cliente ${
                perfilCliente?.id ? "actualizado" : "registrado"
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
          }
        }}
      >
        <Row gutter={12}>
          <Divider orientation="left">Información del cliente</Divider>
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: "Ingrese Id" }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="nombreCliente"
              label="Nombre del cliente"
              rules={[
                { required: true, message: "Ingrese el nombre del proveedor" },
              ]}
            >
              <Input
                placeholder="Ingrese el nombre del cliente"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="tipoIndustria"
              label="Tipo de industria"
              rules={[
                { required: true, message: "Ingrese el tipo de industria" },
              ]}
            >
              <Input placeholder="Ingrese el tipo de industria" style={style} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="tipoProducto"
              label="Tipo de cliente"
              rules={[
                { required: true, message: "Ingrese el tipo de industria" },
              ]}
            >
              <Input placeholder="Ingrese el tipo de industria" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={24}>
            {Boolean(perfilCliente?.id) && (
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
                          count={(perfilCliente?.direcciones || [])?.length}
                        >
                          <Typography.Text strong>
                            {`Direcciones registradas`}
                          </Typography.Text>
                        </Badge>
                      ),
                      children: (
                        <>
                          <List
                            size="small"
                            header={null}
                            footer={null}
                            dataSource={perfilCliente?.direcciones || []}
                            renderItem={(item: any, index) => (
                              <List.Item
                                actions={[
                                  <Tooltip title="Eliminar">
                                    <Button
                                      type="dashed"
                                      shape="circle"
                                      danger
                                      icon={<MinusCircleOutlined />}
                                      onClick={() => {
                                        const direccion =
                                          (perfilCliente?.direcciones || [])[
                                            index
                                          ];
                                        Swal.fire({
                                          title:
                                            "Seguro de eliminar dirección?",
                                          text: direccion?.place,
                                          icon: "question",
                                          showCancelButton: true,
                                          confirmButtonColor: "#1677ff",
                                          cancelButtonColor: "#d33",
                                          confirmButtonText: "Si",
                                          cancelButtonText: "No",
                                        }).then(async (result) => {
                                          if (result.isConfirmed) {
                                            const filterDirecciones = (
                                              perfilCliente?.direcciones || []
                                            ).filter((d: any) => {
                                              return d?.id != direccion?.id;
                                            });
                                            // Registrar el proveedor en Firestore
                                            await FireStoreVentas.registrarProveedor(
                                              auth?.empresa?.id,
                                              {
                                                ...perfilCliente,
                                                direcciones: filterDirecciones,
                                              }
                                            );

                                            // simulamos la eliminacion local
                                            dispatch(
                                              setPerfilClientes({
                                                ...perfilCliente,
                                                direcciones: filterDirecciones,
                                              })
                                            );

                                            dispatch(setRefresh(Math.random()));
                                            Swal.fire({
                                              title: "Eliminado!",
                                              text: "",
                                              icon: "success",
                                            });
                                          }
                                        });
                                      }}
                                    />
                                  </Tooltip>,
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar>
                                      <EnvironmentOutlined
                                        style={{ fontSize: "16px" }}
                                      />
                                    </Avatar>
                                  }
                                  title={
                                    <Typography.Link
                                      href="#"
                                      onClick={(e) => e.preventDefault()}
                                      style={{
                                        color: "#1a79ff",
                                        textDecoration: "none",
                                      }}
                                      underline={false}
                                    >
                                      {item?.place}
                                    </Typography.Link>
                                  }
                                  description={
                                    <Typography.Text
                                      strong
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      {item?.tipoDireccion || "---"}
                                    </Typography.Text>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </>
                      ),
                    },
                  ]}
                />
                <Divider />
              </>
            )}

            <Badge offset={[15, 12]} count={addressMultiple?.length}>
              <Typography.Text strong>Nuevas direcciones</Typography.Text>
            </Badge>

            <div
              style={{
                ...style,
                maxHeight: "200px",
                overflow: "auto",
                padding: "0.5rem 0rem",
              }}
            >
              {direcciones.map(
                (elementDireccion: any) => elementDireccion.element
              )}
            </div>
            <div style={{ width: "100%", textAlign: "center", margin: "auto" }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => {
                  const idAddress = uuidv4();
                  dispatch(
                    setDirecciones([
                      ...direcciones,
                      {
                        id: idAddress,
                        element: <GoogleAddress id={idAddress} />,
                      },
                    ])
                  );
                }}
              >
                Agregar dirección
              </Button>
            </div>
            <Divider />
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item
              name="emailCompras"
              label="Email de compras"
              rules={[
                { required: false, message: "Ingrese el email de compras" },
                {
                  type: "email",
                  message: "Ingrese un correo electrónico válido",
                },
              ]}
            >
              <Input placeholder="Ingrese el email de compras" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item
              name="emailFacturacion"
              label="Email de facturación"
              rules={[
                { required: false, message: "Ingrese el email de facturación" },
                {
                  type: "email",
                  message: "Ingrese un correo electrónico válido",
                },
              ]}
            >
              <Input
                placeholder="Ingrese el email de facturación"
                style={style}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">Información de contacto</Divider>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="nombreContacto"
              label="Nombre"
              rules={[
                { required: true, message: "Ingrese el nombre del contacto" },
              ]}
            >
              <Input
                placeholder="Ingrese el nombre del contacto"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="telefonoContacto"
              label="Número de teléfono"
              rules={[
                { required: true, message: "Ingrese el número de teléfono" },
              ]}
            >
              <Input
                placeholder="Ingrese el número de teléfono"
                style={style}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="correoContacto"
              label="Correo"
              rules={[
                { required: true, message: "Ingrese el correo" },
                {
                  type: "email",
                  message: "Ingrese un correo electrónico válido",
                },
              ]}
            >
              <Input placeholder="Ingrese el correo" style={style} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">Información de pagos (Opcional)</Divider>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="nombreBanco" label="Nombre del banco">
              <Input placeholder="Ingrese el nombre del banco" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="numeroCuenta" label="Número de cuenta">
              <Input placeholder="Ingrese el número de cuenta" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item
              name="nombreBeneficiario"
              label="Nombre del beneficiario"
            >
              <Input
                placeholder="Ingrese el nombre del beneficiario"
                style={style}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item
              name="monedaUtilizada"
              label="Moneda utilizada"
              rules={[
                { required: true, message: "Seleccione la moneda utilizada" },
              ]}
            >
              <Select
                options={MONEDAS}
                placeholder="Seleccione la moneda utilizada"
                style={style}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={24}>
            <Form.Item name="poliza" label="Politicas de Pago" rules={[{ required: false, message: 'Seleccione un término de pago' }]}>
              {/* <Select options={TERMINOS_PAGO} placeholder="Seleccione un término de pago" style={style} /> */}
              <Input.Group compact style={{ display: 'flex' }}>
                <Select
                  value={form.getFieldValue("poliza")}
                  options={POLIZAS}
                  placeholder="Seleccione Politicas de pago"
                  style={{ flex: 1 }}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    form.setFieldValue("poliza",value);
                    setSelectedPoliza(value);
                  }}
                />
                <Tooltip title="Nuevas politicas de pago">
                  <Button icon={<PlusOutlined />} style={{ flex: '0 0 50px' }} onClick={() => {
                    // Abrir el formulario de registrar articulos
                    formPoliza.resetFields();
                    dispatch(setOpenDrawerPoliza(true))
                    dispatch(setDetallePoliza(null));
                  }} />
                </Tooltip>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider orientation="left">Documentos</Divider>
          <Col xs={24} sm={24} lg={24}>
            {Boolean(perfilCliente?.id) && (
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
                          count={(perfilCliente?.documentos || [])?.length}
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
                Limpiar
              </Button>
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                type="primary"
                block
                htmlType="submit"
              >
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>

      <Drawer
        title={"Nueva Póliza"}
        width={768}
        onClose={() => dispatch(setOpenDrawerPoliza(false))}
        open={openDrawerPoliza}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <FormPolizaDePago form={formPoliza} />
      </Drawer>
    </>
  );
};

export default FormClientes;
