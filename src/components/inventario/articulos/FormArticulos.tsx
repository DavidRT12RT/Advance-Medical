"use client";
import React from "react";
import Swal from "sweetalert2";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Modal,
  Drawer,
  Checkbox,
  Space,
} from "antd";
import {
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setOpenDrawerArticulo,
  setRefresh,
  setModalInformacionDelCatalogo,
  setRefreshSubCollection,
  setRefreshTable,
  setSubCollectionEmpresa,
  setNewArticuloId,
} from "@/features/inventarioSlice";
import FireStoreInventario from "@/firebase/FireStoreInventario";

import { v4 as uuidv4 } from "uuid";
import FormInformacionDelCatalogo from "./FormInformacionDelCatalogo";
import { generateRandomString } from "@/helpers/functions";
import FormProveedor from "@/components/compras/proveedores/FormProveedores";
import { setOpenDrawer } from "@/features/comprasSlice";
import unidadesSAT from "./unidadesSat";

const style: React.CSSProperties = { width: "100%" };

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
    },
  });
};

const TIPO_PRODUCTO = [
  { label: "Producto", value: "Producto" },
  { label: "Servicio", value: "Servicio" },
  { label: "Seguro", value: "Seguro" },
];

const ESTATUS = [
  { label: "Activo", value: "Activo" },
  { label: "Inactivo", value: "Inactivo" },
  { label: "No a la Venta", value: "No a la Venta" },
];


const PRESENTACIONES_ESTATICAS = [
  { label: "Caja", value: "Caja" },
  { label: "Bolsa", value: "Bolsa" },
  { label: "Botella", value: "Botella" },
  { label: "Lata", value: "Lata" },
  { label: "Saco", value: "Saco" },
];

const TIPOS_DE_UNIDADES_ESTATICAS = [
  { label: "Pieza", value: "Pieza" },
  { label: "Litro", value: "Litro" },
  { label: "Mililitro", value: "Mililitro" },
  { label: "Gramo", value: "Gramo" },
  { label: "Kilogramo", value: "Kilogramo" },
  { label: "Onza", value: "Onza" },
  { label: "Libra", value: "Libra" },
  { label: "Metro", value: "Metro" },
  { label: "Centímetro", value: "Centímetro" },
  { label: "Milímetro", value: "Milímetro" },
  { label: "Metro cúbico", value: "Metro cúbico" },
  { label: "Centímetro cúbico", value: "Centímetro cúbico" },
  { label: "Galón", value: "Galón" },
  { label: "Barril", value: "Barril" },
  { label: "Unidad", value: "Unidad" },
  { label: "Paquete", value: "Paquete" },
  { label: "Caja", value: "Caja" },
  { label: "Saco", value: "Saco" },
  { label: "Docena", value: "Docena" },
  { label: "Tonelada", value: "Tonelada" },
];

const FormArticulo = ({ form }: any) => {
  const [formInformacionDelCatalogo] = Form.useForm();
  const [formProveedores] = Form.useForm();

  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { openDrawer, newProveedorId } = useSelector(
    (state: any) => state.compras
  );
  const {
    loading,
    refreshSubCollection,
    detalleArticulo,
    modalInformacionDelCatalogo,
    subCollectionEmpresa,
  } = useSelector((state: any) => state.inventario);

  const {
    categorias = [],
    marcas = [],
    presentaciones = [],
    familias = [],
    unidades = [],
    proveedores = [],
  } = subCollectionEmpresa;

  React.useEffect(() => {
    if (newProveedorId) {
      //Asignar el nuevo provedor recien creado y refrescar a los provedores actuales
      dispatch(setRefreshSubCollection(true));
      const currentProveedores = form.getFieldValue("provedoresArticulo") || [];
      form.setFieldsValue({
        provedoresArticulo: Array.from(
          new Set([...currentProveedores, newProveedorId])
        ),
      });
    }
  }, [newProveedorId]);

  React.useEffect(() => {
    if (auth?.empresa) {
      Promise.all([
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "categorias"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "marcas"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "presentaciones"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "familias"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "unidades"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "catalogos"
        ),
        FireStoreInventario.listarSubCollectionEmpresa(
          auth?.empresa?.id,
          "proveedores"
        ),
      ]).then(
        ([
          categorias = [],
          marcas = [],
          presentaciones = [],
          familias = [],
          unidades = [],
          catalogos = [],
          proveedores = [],
        ]) => {
          dispatch(
            setSubCollectionEmpresa({
              categorias: [
                ...categorias.map(({ nombre, id }: any) => ({
                  label: nombre,
                  value: id,
                })),
              ],
              marcas: [
                ...marcas.map(({ nombre, id }: any) => ({
                  label: nombre,
                  value: id,
                })),
              ],
              presentaciones: [
                ...PRESENTACIONES_ESTATICAS,
                ...presentaciones.map(({ nombre, id }: any) => ({
                  label: nombre,
                  value: id,
                })),
              ],
              familias: [
                ...familias.map(({ nombre, id }: any) => ({
                  label: nombre,
                  value: id,
                })),
              ],
              unidades: [
                ...TIPOS_DE_UNIDADES_ESTATICAS,
                ...unidades.map(({ nombre, id }: any) => ({
                  label: nombre,
                  value: id,
                })),
              ],
              catalogos: [
                ...catalogos.map(({ nombreCatalogo, id }: any) => ({
                  label: nombreCatalogo,
                  value: id,
                  id,
                })),
              ],
              proveedores: [
                ...proveedores.map(({ nombreProveedor, id }: any) => ({
                  label: nombreProveedor,
                  value: id,
                  id,
                })),
              ],
            })
          );
        }
      );
    }
  }, [auth, refreshSubCollection]);

  return (
    <>
      <Form
        form={form}
        name="create-article-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          codigoArticulo: generateRandomString(),
          descripcion: "",
          categoria: "",
          marca: "",
          presentacion: "",
          tipoProducto: "",
          estatus: "",
          familia: "",
          tipoUnidad: "",
          codigoBarras: "",
          alertaInventario: undefined,
          provedoresArticulo: [],
        }}
        onFinish={async (values) => {
          try {
            dispatch(setLoading(true));

            // Registrar el articulo en Firestore
            const newArticuloId = await FireStoreInventario.registrarArticulos(
              auth?.empresa?.id,
              {
                ...values,
              }
            );

            dispatch(setLoading(false));
            form.resetFields();
            dispatch(setOpenDrawerArticulo(false));
            dispatch(setRefresh(Math.random()));
            dispatch(setRefreshTable(true));
            dispatch(setNewArticuloId(newArticuloId));
            form.resetFields();

            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Articulo ${
                detalleArticulo?.id ? "actualizado" : "registrado"
              } con éxito!`,
              showConfirmButton: false,
              timer: 3000,
            });
          } catch (error: any) {
            Swal.fire({
              title: "ERROR",
              text: error?.toString(),
              icon: "error",
            });
          }
        }}
      >
        <Row gutter={12}>
          <Divider orientation="left">Información del Artículo</Divider>
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
              name="codigoArticulo"
              label="Código del Artículo"
              rules={[
                { required: true, message: "Ingrese el código del artículo" },
              ]}
            >
              <Input
                maxLength={6}
                placeholder="Ingrese el código del artículo"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="descripcion"
              label="Descripción"
              rules={[{ required: true, message: "Ingrese la descripción" }]}
            >
              <Input placeholder="Ingrese la descripción del artículo" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="categoria"
              label="Categoría"
              rules={[{ required: true, message: "Seleccione una categoría" }]}
            >
              <Select
                options={categorias}
                placeholder="Seleccione una categoría"
                showSearch
                optionFilterProp="label"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar categoría"
                          );
                          if (isConfirmed) {
                            const newId =
                              await FireStoreInventario.agregarDocumentoEmpresasCollection(
                                auth?.empresa?.id,
                                uuidv4(),
                                { nombre: value },
                                "categorias"
                              );
                            dispatch(setRefreshSubCollection(Math.random()));
                            form.setFieldsValue({ categoria: newId });

                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Categoría registrada con éxito!",
                              showConfirmButton: false,
                              timer: 3000,
                            });
                          }
                        } catch (error) {
                          console.log("error", error);
                          Swal.fire({
                            title: "ERROR",
                            text: error?.toString(),
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nueva categoría
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="marca"
              label="Marca"
              rules={[{ required: true, message: "Seleccione una marca" }]}
            >
              <Select
                options={marcas}
                placeholder="Seleccione una marca"
                style={style}
                showSearch
                optionFilterProp="label"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar marca"
                          );
                          if (isConfirmed) {
                            const newId =
                              await FireStoreInventario.agregarDocumentoEmpresasCollection(
                                auth?.empresa?.id,
                                uuidv4(),
                                { nombre: value },
                                "marcas"
                              );
                            dispatch(setRefreshSubCollection(Math.random()));
                            form.setFieldsValue({ marca: newId });

                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Marca registrada con éxito!",
                              showConfirmButton: false,
                              timer: 3000,
                            });
                          } else {
                            form.setFieldsValue({ marca: "" });
                          }
                        } catch (error) {
                          console.log("error", error);
                          Swal.fire({
                            title: "ERROR",
                            text: error?.toString(),
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nueva marca
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="presentacion"
              label="Presentación"
              rules={[
                { required: true, message: "Seleccione una presentación" },
              ]}
            >
              <Select
                options={presentaciones}
                placeholder="Seleccione una presentación"
                style={style}
                showSearch
                optionFilterProp="label"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar presentación"
                          );
                          if (isConfirmed) {
                            const newId =
                              await FireStoreInventario.agregarDocumentoEmpresasCollection(
                                auth?.empresa?.id,
                                uuidv4(),
                                { nombre: value },
                                "presentaciones"
                              );
                            dispatch(setRefreshSubCollection(Math.random()));
                            form.setFieldsValue({ presentacion: newId });

                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Presentación registrada con éxito!",
                              showConfirmButton: false,
                              timer: 3000,
                            });
                          } else {
                            form.setFieldsValue({ presentacion: "" });
                          }
                        } catch (error) {
                          console.log("error", error);
                          Swal.fire({
                            title: "ERROR",
                            text: error?.toString(),
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nueva presentación
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="tipoProducto"
              label="Tipo de Producto"
              rules={[
                { required: true, message: "Seleccione el tipo de producto" },
              ]}
            >
              <Select
                options={TIPO_PRODUCTO}
                placeholder="Seleccione el tipo de producto"
                style={style}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="estatus"
              label="Estatus"
              rules={[{ required: true, message: "Seleccione el estatus" }]}
            >
              <Select
                options={ESTATUS}
                placeholder="Seleccione el estatus"
                style={style}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="familia"
              label="Familia"
              rules={[{ required: true, message: "Seleccione una familia" }]}
            >
              <Select
                options={familias}
                placeholder="Seleccione una familia"
                style={style}
                showSearch
                optionFilterProp="label"
                // Si se selecciona una opción existente, simplemente se actualiza el campo.
                onChange={(familia) => form.setFieldsValue({ familia })}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar familia"
                          );
                          if (isConfirmed) {
                            const newId =
                              await FireStoreInventario.agregarDocumentoEmpresasCollection(
                                auth?.empresa?.id,
                                uuidv4(),
                                { nombre: value },
                                "familias"
                              );
                            dispatch(setRefreshSubCollection(Math.random()));
                            form.setFieldsValue({ familia: newId });
                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Familia registrada con éxito!",
                              showConfirmButton: false,
                              timer: 3000,
                            });
                          } else {
                            form.setFieldsValue({ familia: "" });
                          }
                        } catch (error) {
                          console.log("error", error);
                          Swal.fire({
                            title: "ERROR",
                            text: error?.toString(),
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nueva familia
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="tipoUnidad"
              label="Tipo de Unidad"
              rules={[
                { required: true, message: "Seleccione el tipo de unidad" },
              ]}
            >
              <Select
                options={unidades}
                placeholder="Seleccione el tipo de unidad"
                style={style}
                showSearch
                optionFilterProp="label"
                // Actualiza el campo al seleccionar una opción existente.
                onChange={(tipoUnidad) => form.setFieldsValue({ tipoUnidad })}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        try {
                          const { isConfirmed, value } = await swalAlertInput(
                            "Agregar tipo de unidad"
                          );
                          if (isConfirmed) {
                            const newId =
                              await FireStoreInventario.agregarDocumentoEmpresasCollection(
                                auth?.empresa?.id,
                                uuidv4(),
                                { nombre: value },
                                "unidades"
                              );
                            dispatch(setRefreshSubCollection(Math.random()));
                            form.setFieldsValue({ tipoUnidad: newId });
                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Tipo de unidad registrada con éxito!",
                              showConfirmButton: false,
                              timer: 3000,
                            });
                          } else {
                            form.setFieldsValue({ tipoUnidad: "" });
                          }
                        } catch (error) {
                          console.log("error", error);
                          Swal.fire({
                            title: "ERROR",
                            text: error?.toString(),
                            icon: "error",
                          });
                        }
                      }}
                    >
                      Agregar nuevo tipo de unidad
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="codigoBarras" label="Código de Barras">
              <Input placeholder="Ingrese el código de barras" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="alertaInventario"
              label="Stock minimo para alerta"
              rules={[
                {
                  required: true,
                  message: "Seleccione el minimo numero de stock para alerta",
                },
              ]}
            >
              <Input placeholder="Ingrese el numero para alerta de inventario" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="provedoresArticulo" label="Proveedores">
              <Select
                options={proveedores}
                placeholder="Seleccione los proveedores del artículo"
                style={style}
                showSearch
                optionFilterProp="label"
                mode="multiple"
                onChange={(provedores) =>
                  form.setFieldsValue({ provedoresArticulo: provedores })
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      style={{ width: "100%" }}
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={async () => {
                        const { isConfirmed } = await Swal.fire({
                          title:
                            "¿Desea continuar con el registro del proveedor?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Sí, continuar",
                          cancelButtonText: "No, cancelar",
                        });

                        if (isConfirmed) {
                          dispatch(setOpenDrawer(true));
                        }
                      }}
                    >
                      Agregar nuevo proveedor
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* Campos Fiscales */}
{/* 
        <Row>
          <Col xs={24}>
            <Form.Item name="datosFiscales" valuePropName="checked">
              <Checkbox disabled>Agregar datos fiscales</Checkbox>
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.datosFiscales !== currentValues.datosFiscales
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("datosFiscales") && (
                  <>
                    <Divider orientation="left">Datos Fiscales</Divider>
                    <Row gutter={12}>
                      {/* SKU (solo lectura, calculado a partir de codigoArticulo) 
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="SKU"
                          tooltip="Número de parte identificador del producto. La clave de servicio, SKU o equivalente (Este ya está ingresado de forma automática)"
                          // name="IdentificationNumber"
                          shouldUpdate={(prev: any, curr) =>
                            prev.codigoArticulo !== curr.codigoArticulo
                          }
                        >
                          {({ getFieldValue }) => {
                            const codigoArticulo =
                              getFieldValue("codigoArticulo");
                            return (
                              <Input
                                disabled
                                value={`SKU (${codigoArticulo})`}
                                placeholder="SKU (generado automáticamente)"
                              />
                            );
                          }}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          name="Price"
                          label="Precio Unitario"
                          rules={[
                            {
                              required: true,
                              message: "Ingrese el precio unitario",
                            },
                          ]}
                        >
                          <Input placeholder="Ingrese el precio del producto" />
                        </Form.Item>
                      </Col>
                      {/* Clave Producto/Servicio *
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          name="CodeProdServ"
                          label="Clave Producto/Servicio"
                          rules={[
                            {
                              required: true,
                              message:
                                "Ingrese la clave del producto o servicio",
                            },
                          ]}
                        >
                          <Input placeholder="Ingrese la clave del producto/servicio" />
                        </Form.Item>
                      </Col>
                      {/* Cuenta Predial *
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          name="CuentaPredial"
                          label="Cuenta Predial"
                          rules={[
                            {
                              pattern: /^[0-9]{1,150}$/,
                              message:
                                "La cuenta predial debe contener de 1 a 150 dígitos",
                            },
                          ]}
                        >
                          <Input placeholder="Ingrese la cuenta predial (si aplica)" />
                        </Form.Item>
                      </Col>
                      {/* Código de Unidad (UnitCode) *
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          name="UnitCode"
                          label="Código de Unidad"
                          rules={[
                            {
                              required: true,
                              message:
                                "Ingrese el código de unidad en base al catálogo del SAT",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Ingrese el código de unidad"
                            options={unidadesSAT.map((u: any) => ({
                              label: `${u.value} ${u.label}`,
                              value: u.value,
                            }))}
                            showSearch
                            optionFilterProp="label"
                            onChange={(value) => {
                              // Al seleccionar un código, actualizamos el campo 'unit'
                              const selected = unidadesSAT.find(
                                (opt) => opt.value === value
                              );
                              form.setFieldsValue({
                                Unit: selected ? selected.label : "",
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      {/* Unidad (Unit) - se muestra automáticamente en base a unitCode *
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item name="Unit" label="Unidad">
                          <Input
                            disabled
                            placeholder="Se completa automáticamente"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* Impuestos *
                    <Divider orientation="left">Impuestos</Divider>
                    <Form.List name="taxes">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field) => (
                            <Space
                              key={field.key}
                              align="baseline"
                              style={{ display: "flex", marginBottom: 8 }}
                            >
                              <Form.Item
                                {...field}
                                name={[field.name, "taxName"]}
                                //@ts-ignore
                                fieldKey={[field.fieldKey, "taxName"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Ingrese el nombre del impuesto",
                                  },
                                ]}
                              >
                                <Input placeholder="Nombre del impuesto" />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "rate"]}
                                //@ts-ignore
                                fieldKey={[field.fieldKey, "rate"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Ingrese la tasa (ej. 0.16)",
                                  },
                                ]}
                              >
                                <Input placeholder="Tasa (ej. 0.16)" />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "isRetention"]}
                                //@ts-ignore
                                fieldKey={[field.fieldKey, "isRetention"]}
                                valuePropName="checked"
                              >
                                <Checkbox>Retención</Checkbox>
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(field.name)}
                              />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Agregar Impuesto
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </>
                )
              }
            </Form.Item>
          </Col>
        </Row>
 */}

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
        title={"Nuevo proveedor"}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
      >
        <FormProveedor form={formProveedores} />
      </Drawer>
      <Modal
        title={`Detalles del catálogo`}
        open={modalInformacionDelCatalogo}
        maskClosable={false} // Evita el cierre al hacer clic fuera del modal
        footer={null} // Oculta los botones de "Cancelar" y "OK"
        onCancel={() => dispatch(setModalInformacionDelCatalogo(false))}
      >
        <FormInformacionDelCatalogo form={formInformacionDelCatalogo} />
      </Modal>
    </>
  );
};

export default FormArticulo;
