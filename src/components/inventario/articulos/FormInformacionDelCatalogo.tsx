"use client";
import React from "react";
import { Button, Col, Divider, Flex, Form, Input, Row, Select } from 'antd';
import { UndoOutlined, SaveOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { setCatalogoTemporal, setModalInformacionDelCatalogo } from '@/features/inventarioSlice';
import { setListaDeProveedores } from "@/features/ventasSlice";
import FireStoreProveedores from '@/firebase/FireStoreVentas';
import FireStoreConfiguracion from "@/firebase/FireStoreConfiguracion";
import { setListaDeSucursales } from "@/features/configuracionSlice";

const style: React.CSSProperties = { width: '100%' };

const FormInformacionDelCatalogo = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    loading,
    listaDeProveedores = [],
  } = useSelector((state: any) => state.ventas);
  const { auth, listaDeSucursales } = useSelector((state: any) => state.configuracion);
  const { catalogoTemporal } = useSelector((state: any) => state.inventario);

  // Lista de proveedores
  React.useEffect(() => {
    FireStoreProveedores.listarProveedores({
      idEmpresa: auth?.empresa?.id || ""
    }).then((listaDeProveedores: any) => {
      dispatch(setListaDeProveedores(listaDeProveedores));
    });
  }, [auth]);

  const PROVEEDORES = listaDeProveedores.map((proveedor: any) => {
    return { ...proveedor, label: proveedor?.nombreProveedor, value: proveedor?.id };
  });

  // Lista de sucursales (bodegas)
  React.useEffect(() => {
    FireStoreConfiguracion.listarSucursales({
      idEmpresa: auth?.empresa?.id || ""
    }).then((listaDeSucursales: any) => {
      dispatch(setListaDeSucursales(listaDeSucursales));
    });
  }, [auth]);

  const BODEGAS = listaDeSucursales.map((sucursal: any) => {
    return { ...sucursal, label: sucursal?.nombre, value: sucursal?.id };
  });




  return (
    <Form
      form={form}
      name="create-catalog-form"
      layout="vertical"
      style={{ width: "100%" }}
      initialValues={{
        id: "",
        proveedor: "",
        precio: "",
        costo: "",
        bodega: "",
        cantidad: "",
        alerta: "",
        descuento: "",
        descuentoMaximo: ""
      }}
      onFinish={async (values) => {
        if (catalogoTemporal) {
          dispatch(setCatalogoTemporal({ informacionDelArticulo: values }));
          dispatch(setModalInformacionDelCatalogo(false));
          form.resetFields();
        }
      }}
    >

      <Row gutter={12}>
        <Col xs={24} sm={24} lg={24} >
          <Form.Item name="proveedor" label="Proveedor" rules={[{ required: true, message: 'Seleccione un proveedor' }]}>
            <Select options={PROVEEDORES} placeholder="Seleccione un proveedor" style={style} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={12} lg={12}>
          <Form.Item name="precio" label="Precio" rules={[{ required: true, message: 'Ingrese el precio' }]}>
            <Input placeholder="Ingrese el precio" type="number" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <Form.Item name="costo" label="Costo" rules={[{ required: true, message: 'Ingrese el costo' }]}>
            <Input placeholder="Ingrese el costo" type="number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} sm={24} lg={24}>
          <Form.Item name="bodega" label="Bodega" rules={[{ required: true, message: 'Seleccione una bodega' }]}>
            <Select options={BODEGAS} placeholder="Seleccione una bodega" style={style} />
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
  );
};

export default FormInformacionDelCatalogo;
