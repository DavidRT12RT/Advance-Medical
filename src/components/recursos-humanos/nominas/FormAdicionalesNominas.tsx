"use client";
import { Button, Col, Divider, Flex, Form, Input, Row, Select, Switch, TimePicker, Tooltip } from 'antd';
import * as React from 'react'
import Swal from 'sweetalert2';
import {
  UndoOutlined,
  SaveOutlined,
  SmileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setLoading, setNewSucursalId, setOpenDrawer, } from '@/features/configuracionSlice';
import { setColaboradoresSeleccionados, setIsNewAdicionalNominaId, setListaDeUsuarios, setOpenDrawerSucursal, setOpenModalAdicionales, setRefresh } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { onAuthStateChanged } from 'firebase/auth';
dayjs.extend(customParseFormat);

const style: React.CSSProperties = { width: '100%' };

const TIPO_DE_SUCURSAL = [
  { label: 'Tienda', value: 'Tienda' },
  { label: 'Oficina', value: 'Oficina' },
  { label: 'Bodega', value: 'Bodega' },
  { label: 'Centro de Distribución', value: 'Centro de Distribución' }
];

const METODO_DE_CALCULO = [
  { label: 'Con Salario Base', value: 'Con Salario Base' },
  { label: 'Cantidad Fija', value: 'Cantidad Fija' },
];

const TIPO_DE_OPERACION = [
  { label: 'Suma', value: 'suma' },
  { label: 'Resta', value: 'resta' },
];


const FormAdicionalesNominas = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    loading,
    detalleDeSucursal,
    // google maps
    coordinates,
    address,
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    colaboradoresSeleccionados,
    listaDeUsuarios,
  } = useSelector((state: any) => state.recursosHumanos);


  /* React.useEffect(() => {
    FireStoreRecursosHumanos.listarUsuarios({
      idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : ""
    }).then((listaDeUsuarios) => {
      dispatch(setListaDeUsuarios(listaDeUsuarios));
    });
  }, []); */


  /* // Efecto para actualizar los días seleccionados cuando cambian los horarios
  React.useEffect(() => {
    const values = form.getFieldsValue();
    form.setFieldsValue(values);
  }, [form]); */


  return (
    <Form
      form={form}
      name="login-form"
      layout="horizontal"
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
      labelAlign="left"
      autoComplete="off"
      style={{ width: "100%" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        nombre: "",
        metodoDeCalculo: "",
        tipoDeOperacion: "",
        multiplicador: "",
        tope: "",
      }}
      onFinish={async (values) => {
        try {
          dispatch(setLoading(true));
          // REGISTRAMOS EL ADICIONAL EN FIRESTORE
          const newAdicionalId = await FireStoreRecursosHumanos.registrarAdicionalesNominas(auth?.empresa?.id, {
            ...values,
          });
          dispatch(setLoading(false));

          form.resetFields();
          dispatch(setOpenModalAdicionales(false));
          dispatch(setIsNewAdicionalNominaId(newAdicionalId));
          // dispatch(setRefresh(Math.random()));

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Adicional ${false ? 'actualizado' : 'registrado'} con éxito!`,
            showConfirmButton: false,
            timer: 3000
          });
        } catch (error: any) {
          dispatch(setLoading(false));
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        }
      }} >

      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {/* start input hidden */}
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input placeholder="Ingrese Id" style={style} />
          </Form.Item>
          {/* end input hidden */}
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese Nombre' }]}
          >
            <Input placeholder="Ingrese Nombre" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="metodoDeCalculo"
            label="Método de calculo"
            rules={[{ required: true, message: 'Seleccione Método de calculo' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Método de calculo"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={METODO_DE_CALCULO}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="tipoDeOperacion"
            label="Tipo de operacion"
            rules={[{ required: true, message: 'Seleccione Tipo de operacion' }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Tipo de operacion"
              optionFilterProp="label"
              onChange={() => { }}
              onSearch={() => { }}
              options={TIPO_DE_OPERACION}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="multiplicador"
            label="Multiplicador"
            rules={[{ required: true, message: 'Ingrese multiplicador' }]}
          >
            <Input placeholder="Ingrese multiplicador" type="number" min={0} style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="tope"
            label="Tope"
            rules={[{ required: false, message: 'Ingrese tope' }]}
          >
            <Input placeholder="Ingrese tope" type="number" min={0} style={style} />
          </Form.Item>
        </Col>

      </Row>



      <Row gutter={12}>
        <Divider></Divider>
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset">
              Limpiar
            </Button>
            <Button loading={loading} icon={<SaveOutlined />} type="primary" block htmlType="submit">
              Guardar
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  )
}

export default FormAdicionalesNominas;