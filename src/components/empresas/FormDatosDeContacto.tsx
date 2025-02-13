"use client";
import { Button, Col, DatePicker, Divider, Flex, Form, Grid, Input, Row, Select, Slider, Switch, Tag, TimePicker, Typography } from 'antd';
import React, { useRef } from 'react'
import Swal from 'sweetalert2';
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
  CheckOutlined,
  UndoOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  RightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setCurrentStep, setListaDeSucursales, setLoading, setOpenDrawer, setRefresh, setTempDataEmpresa } from '@/features/configuracionSlice';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import FireStoreEmpresas from '@/firebase/FireStoreEmpresas';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from 'firebase/auth';

const style: React.CSSProperties = { width: '100%' };
const { Search } = Input;
const { Title } = Typography;

const { useBreakpoint } = Grid;

const TIPO_DE_SUCURSAL = [
  { label: 'Tienda', value: 'Tienda' },
  { label: 'Oficina', value: 'Oficina' },
  { label: 'Bodega', value: 'Bodega' },
  { label: 'Centro de Distribución', value: 'Centro de Distribución' }
];



const FormDatosDeContacto = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const {
    loading,
    currentStep,
    // google maps
    coordinates,
    address,
  } = useSelector((state: any) => state.configuracion);



  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "1rem 5rem" : "1rem" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        nombreDeLaEmpresa: "",
        email: "",
        password: "",
        sitioWeb: "",
        giroDeLaEmpresa: "",
        numeroDeEmpleados: "",
      }}
      onFinish={async (values) => {
        dispatch(setTempDataEmpresa(values));
        dispatch(setCurrentStep(currentStep + 1));
      }} >
      {/* <Title level={3}>REGISTRAR CUENTA</Title> */}
      <Row gutter={12} style={{ marginTop: "1rem" }}>
        <Divider orientation="left">Datos de contacto</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {/* start input hidden */}
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: 'Ingrese Id' }]}
          >
            <Input size="large" placeholder="Ingrese Id" style={style} />
          </Form.Item>
          {/* end input hidden */}
          <Form.Item
            name="nombreDeLaEmpresa"
            label="Nombre de la empresa"
            rules={[{ required: true, message: 'Ingrese Nombre de la empresa' }]}
          >
            <Input size="large" placeholder="Ingrese Nombre de la empresa" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Ingrese Correo electrónico' },
              { type: 'email', message: 'Ingrese Correo electrónico válido' }
            ]}
          >
            <Input size="large" placeholder="Ingrese Correo electrónico" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Ingrese Contraseña' },
            ]}
          >
            <Input size="large" type='password' placeholder="Ingrese Contraseña" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="sitioWeb"
            label="Sitio web"
            rules={[
              { required: false, message: 'Ingrese Sitio web' },
              { type: 'url', message: 'Ingrese una URL válida' }
            ]}
          >
            <Input size="large" placeholder="Ingrese Sitio web" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="giroDeLaEmpresa"
            label="Giro de la empresa"
            rules={[
              { required: true, message: 'Ingrese Giro de la empresa' },
            ]}
          >
            <Input size="large" placeholder="Ingrese Giro de la empresa" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="numeroDeEmpleados"
            label="Número de empleados"
            rules={[
              { required: true, message: 'Ingrese Número de empleados' },
            ]}
          >
            <Input size="large" type='number' placeholder="Ingrese Número de empleados" style={style} />
          </Form.Item>
        </Col>

      </Row>


      <Row gutter={12}>
        <Divider></Divider>
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>

            {currentStep > 0 && (
              <Button onClick={() => {
                dispatch(setCurrentStep(currentStep - 1));
              }}>
                <ArrowLeftOutlined /> Anterior
              </Button>
            )}
            {currentStep < 4 && (
              <Button type="primary" block htmlType="submit">
                Siguiente <ArrowRightOutlined />
              </Button>
            )}
          </Flex>
        </Col>

        {/* <Col span={24}>
          <div style={{ textAlign: "center" }}>
            <Typography.Text style={{ color: '#555555' }}>¿Ya tienes una cuenta? </Typography.Text>
            <Typography.Link href="/empresas/login" style={{ color: '#1890ff' }}>
              Iniciar sesión
            </Typography.Link>
          </div>
        </Col> */}
      </Row>
    </Form>
  )
}

export default FormDatosDeContacto