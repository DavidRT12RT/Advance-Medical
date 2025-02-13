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
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setCurrentStep, setListaDeSucursales, setLoading, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import FireStoreEmpresas from '@/firebase/FireStoreEmpresas';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile } from 'firebase/auth';

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



const FormDatosAdicionales = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const {
    loading,
    detalleDeSucursal,
    tempDataEmpresa,
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
        coordinates: { lat: null, lng: null },
        nombre: "",
        telefono: "",
        cargo: "",
      }}
      onFinish={async (values) => {

        try {
          if (!address || !coordinates?.lat || !coordinates?.lng) {
            Swal.fire({
              title: "Ingrese una dirección",
              text: "",
              icon: "warning"
            });
            return;
          }
          dispatch(setLoading(true));

          const userCredential = await createUserWithEmailAndPassword(
            getAuth(),
            tempDataEmpresa?.email,// email
            tempDataEmpresa?.password// password
          );

          // Agregar el displayName
          await updateProfile(userCredential.user, {
            displayName: tempDataEmpresa?.nombreDeLaEmpresa || ""
          });

          // Envía un correo de verificación al usuario
          await sendEmailVerification(userCredential?.user);

          // REGISTRAMOS LA EMPRESA EN FIRESTORE
          await FireStoreEmpresas.registrarEmpresa({
            ...tempDataEmpresa,
            ...values,
            direccion: address,
            coordinates,
            estatus: "Nuevo registro",
            id: userCredential?.user?.uid,
            fechaRegistro: new Date().toISOString()
          });
          dispatch(setLoading(false));

          Swal.fire({
            title: 'Cuenta registrada con éxito!',
            text: `Se ha enviado un enlace de verificación a tu correo electrónico: ${tempDataEmpresa?.email}. Por favor, verifica tu cuenta para poder continuar.`,
            icon: "success",
          });
          //form.resetFields();
          dispatch(setCurrentStep(currentStep + 1));


        } catch (error: any) {
          console.log('error', error);
          Swal.fire({
            title: "ERROR",
            text: error?.toString(),
            icon: "error"
          });
        }

      }} >
      {/* <Title level={3}>REGISTRAR CUENTA</Title> */}
      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Divider orientation="left">Datos adicionales</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <GoogleMaps title="Dirección de operación" showMap={false} />
          {/* <Form.Item
            name="direccion"
            label="Dirección completa"
            rules={[{ required: true, message: 'Ingrese Dirección completa' }]}
          >
            <Input size="large" showCount maxLength={200} placeholder="Ingrese Dirección completa" style={style} />
          </Form.Item> */}
        </Col>
        <Divider orientation="left">Persona de contacto principal</Divider>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese Nombre' }]}
          >
            <Input size="large" placeholder="Ingrese Nombre" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: 'Ingrese Teléfono' }]}
          >
            <Input size="large" placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="cargo"
            label="Cargo"
            rules={[{ required: true, message: 'Ingrese Cargo' }]}
          >
            <Input size="large" placeholder="Ingrese Cargo" style={style} />
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
              <Button loading={loading} type="primary" block htmlType="submit">
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

export default FormDatosAdicionales