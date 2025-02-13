"use client";
import React from "react";
import { Button, Col, Divider, Drawer, Flex, Form, Input, InputNumber, Row, Select, Tooltip } from 'antd';
import { UndoOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { setArticuloTemporal, setModalInformacionDelArticulo } from '@/features/inventarioSlice';
import { setOpenDrawerSucursal } from '@/features/recursosHumanosSlice';
import { setListaDeProveedores, setOpenDrawerProveedor, setPerfilProveedores } from "@/features/ventasSlice";
import FireStoreProveedores from '@/firebase/FireStoreVentas';
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import { setListaDeSucursales, setDetalleDeSucursal } from "@/features/configuracionSlice";
import FormSucursales from '@/components/configuracion/sucursales/FormSucursales';
import FormProveedores from '@/components/compras/proveedores/FormProveedores';

const IMPUESTOS = [
  { label: 'IVA (16%)', value: 'IVA (16%)' },
  { label: 'IVA Exento', value: 'IVA Exento' },
  { label: 'Retención de ISR (10%)', value: 'Retención de ISR (10%)' },
  { label: 'IVA (8%)', value: 'IVA (8%)' },
  { label: 'IEPS (8%)', value: 'IEPS (8%)' }
];

const style: React.CSSProperties = { width: '100%' };

const FormInformacionDelArticulo = ({ form }: any) => {

  const dispatch = useDispatch();
  const [formSucursal] = Form.useForm();
  const [formProveedor] = Form.useForm();

  const {
    loading,
    listaDeProveedores = [],
    openDrawerProveedor,
    proveedorRefresh,
    newProveedorId,
  } = useSelector((state: any) => state.ventas);
  const { auth, listaDeSucursales, refresh, newSucursalId } = useSelector((state: any) => state.configuracion);
  const { articuloTemporal } = useSelector((state: any) => state.inventario);
  const { openDrawerSucursal } = useSelector((state: any) => state.recursosHumanos);

  // Lista de proveedores
  React.useEffect(() => {
    FireStoreProveedores.listarProveedores({
      idEmpresa: auth?.empresa?.id || ""
    }).then((listaDeProveedores: any) => {
      dispatch(setListaDeProveedores(listaDeProveedores));
    });
  }, [auth, proveedorRefresh]);

  const PROVEEDORES = listaDeProveedores.map((proveedor: any) => {
    return { ...proveedor, label: proveedor?.nombreProveedor, value: proveedor?.id };
  });
  React.useEffect(() => {
    if (newProveedorId) {
      form.setFieldsValue({ proveedor: newProveedorId });
      // dispatch(newProveedorId(null)); // Reset the new proveedor ID after usage
    }
  }, [newProveedorId, listaDeProveedores]);

  // Lista de sucursales (bodegas)
  React.useEffect(() => {
    FireStoreConfiguracion.listarSucursales({
      idEmpresa: auth?.empresa?.id || ""
    }).then((listaDeSucursales: any) => {
      dispatch(setListaDeSucursales(listaDeSucursales));
    });
  }, [auth, refresh]);

  React.useEffect(() => {
    if (newSucursalId) {
      form.setFieldsValue({ bodega: newSucursalId });
      // dispatch(setNewSucursalId(null)); // Reset the new sucursal ID after usage
    }
  }, [newSucursalId, listaDeSucursales]);

  const BODEGAS = listaDeSucursales.map((sucursal: any) => {
    return { ...sucursal, label: `${sucursal?.tipoSucursal} - ${sucursal?.nombre}`, value: sucursal?.id };
  });



  return (
    <>
      <Form
        form={form}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          proveedor: "",
          precio: 0.00,
          costo: 0.00,
          bodega: "",
          cantidad: "",
          alerta: "",
          descuento: "",
          descuentoMaximo: ""
        }}
        onFinish={async (values) => {
          if (articuloTemporal) {
            dispatch(setArticuloTemporal({ ...articuloTemporal, informacionDelArticulo: values }));
            dispatch(setModalInformacionDelArticulo(false));
            form.resetFields();
          }
        }}
      >

        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item name="proveedor" label="Proveedor" rules={[{ required: true, message: 'Seleccione un proveedor' }]}>
              <Select
                options={PROVEEDORES}
                placeholder="Seleccione un proveedor"
                style={style}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button block type="text" icon={<PlusOutlined />} onClick={() => {
                      formProveedor.resetFields();
                      dispatch(setOpenDrawerProveedor(true))
                      dispatch(setPerfilProveedores(null));
                    }}>
                      Nuevo proveedor
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="precio" label="Precio" rules={[{ required: true, message: 'Ingrese el precio' }]}>
              <InputNumber style={style}
                formatter={(value: any) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                min={0}
                placeholder="Ingrese el precio" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="costo" label="Costo" rules={[{ required: true, message: 'Ingrese el costo' }]}>
              <InputNumber style={style}
                formatter={(value: any) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                min={0}
                placeholder="Ingrese el costo" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={24} lg={24} xl={24}>
            <Form.Item name="bodega" label="Bodega" rules={[{ required: true, message: 'Seleccione bodega' }]}>
              <Select
                options={BODEGAS}
                placeholder="Seleccione bodega"
                style={style}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button block type="text" icon={<PlusOutlined />} onClick={() => {
                      formSucursal.resetFields();
                      dispatch(setOpenDrawerSucursal(true))
                      dispatch(setDetalleDeSucursal(null));
                    }}>
                      Nueva bodega
                    </Button>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="cantidad" label="Cantidad en existencia" rules={[{ required: true, message: 'Ingrese la cantidad en existencia' }]}>
              <Input placeholder="Ingrese la cantidad en existencia" type="number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="alerta" label="Alerta" rules={[{ required: true, message: 'Ingrese el nivel de alerta' }]}>
              <Input placeholder="Ingrese el nivel de alerta" type="number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} lg={24}>
            <Form.Item name="impuestos" label="Impuestos" rules={[{ required: true, message: 'Seleccione impuestos' }]}>
              <Select options={IMPUESTOS} placeholder="Seleccione impuestos" style={style} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="descuento" label="Descuento">
              <Input placeholder="Ingrese el descuento" type="number" min={0} max={70} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="descuentoMaximo" label="Descuento Máximo">
              <Input placeholder="Ingrese el descuento máximo" type="number" min={0} max={90} />
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

      <Drawer
        title={'Nueva Sucursal'}
        width={768}
        onClose={() => dispatch(setOpenDrawerSucursal(false))}
        open={openDrawerSucursal}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormSucursales form={formSucursal} />
      </Drawer>

      <Drawer
        title={'Nuevo Proveedor'}
        width={768}
        onClose={() => dispatch(setOpenDrawerProveedor(false))}
        open={openDrawerProveedor}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormProveedores form={formProveedor} />
      </Drawer>
    </>
  );
};

export default FormInformacionDelArticulo;
