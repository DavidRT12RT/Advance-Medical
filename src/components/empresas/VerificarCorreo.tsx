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
  ArrowLeftOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setCurrentStep, setListaDeSucursales, setLoading, setOpenDrawer, setRefresh } from '@/features/configuracionSlice';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import FireStoreEmpresas from '@/firebase/FireStoreEmpresas';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const style: React.CSSProperties = { width: '100%' };
const { Search } = Input;
const { Title } = Typography;

const { useBreakpoint } = Grid;

async function checkEmailVerification() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // Refresca el estado del usuario para verificar si el correo ya fue confirmado
    await user.reload();
    return user?.emailVerified || false;
  }
}




const VerificarCorreo = () => {

  const [form] = Form.useForm();
  const router = useRouter();
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
    auth
  } = useSelector((state: any) => state.configuracion);


  console.log('aaaaaaaaaaaaaaaaaaaaaaaaa', auth)
  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "3rem" : "1rem" }}
      /* requiredMark={customizeRequiredMark} */
      initialValues={{
        id: "",
        coordinates: { lat: null, lng: null },
        nombre: "",
        telefono: "",
        cargo: "",
      }}
      onFinish={(values) => {


      }} >
      {/* <Title level={3}>REGISTRAR CUENTA</Title> */}
      <Row gutter={12} style={{ marginTop: "1rem" }}>

        <Divider orientation="left">Verificación de correo</Divider>

        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>

            <Flex vertical gap="small" style={{ width: '100%' }}>
              <Button type="primary" block onClick={async () => {
                const emailVerified = await checkEmailVerification();
                if (emailVerified) {
                  router.push("/empresas/registrar");
                  dispatch(setCurrentStep(3));
                } else {
                  Swal.fire({
                    title: "Correo electrónico no verificado",
                    text: "Por favor, verifica tu cuenta para poder acceder.",
                    icon: "warning"
                  });
                }

              }}>
                Ya he verificado mi correo
              </Button>
              <Button block onClick={async () => {
                try {
                  const auth: any = getAuth();
                  // Envía un correo de verificación al usuario
                  await sendEmailVerification(auth.currentUser);

                  Swal.fire({
                    title: 'Correo de verificación reenviado',
                    text: `Se ha enviado un enlace de verificación a tu correo electrónico: ${auth.currentUser?.email}. Por favor, verifica tu cuenta para poder acceder.`,
                    icon: "success",
                  });
                } catch (error) {
                  console.log('error', error);
                  Swal.fire({
                    title: "ERROR",
                    text: error?.toString(),
                    icon: "error"
                  });
                }
              }}>
                Reenviar correo de verificación
              </Button>
              {auth?.empresa && (
                <Button danger loading={loading} icon={<LogoutOutlined />} type="primary" block onClick={async () => {
                  try {
                    await signOut(getAuth());
                    router.replace("/empresas/login");
                    console.log('Usuario deslogeado correctamente');
                  } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                  }
                }}>
                  Cerrar sesión
                </Button>
              )}
            </Flex>


          </Flex>
        </Col>
        <Divider></Divider>
      </Row>

    </Form>
  )
}

export default VerificarCorreo