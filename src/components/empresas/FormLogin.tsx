"use client";
import React from 'react'
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Divider, Flex, Form, Grid, Input, Row, Typography } from 'antd';
import {
  UndoOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { setLoading } from '@/features/administracionSlice';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import GoogleMaps from '@/components/GoogleMaps';
import FireStoreEmpresas from '@/firebase/FireStoreEmpresas';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import FormResetPassword from './FormResetPassword';
import FormChangePassword from './FormChangePassword';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';

const style: React.CSSProperties = { width: '100%' };
const { Title } = Typography;
const { useBreakpoint } = Grid;

const FormLogin = ({ form }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [showResetForm, setShowResetForm] = React.useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = React.useState(false);
  const [tempUsuarios, setTempUsuarios] = React.useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = React.useState<string>("");

  const {
    loading,
  } = useSelector((state: any) => state.administracion);

  const auth = getAuth();
  const user = auth.currentUser;

  // Add effect to handle tab closing during temporary password change
  React.useEffect(() => {
    if (showChangePasswordForm) {
      const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        await signOut(auth);
      };

      // Handle tab/window closing
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }

    // Cleanup on unmount if showing change password form
    return () => {
      if (showChangePasswordForm) {
        signOut(auth).catch(console.error);
      }
    };
  }, [showChangePasswordForm, auth]);

  React.useEffect(() => {
    const loadTempUsers = async () => {
      try {
        const listaDeUsuarios = await FireStoreRecursosHumanos.listarUsuarios({
          idEmpresa: ""
        });
        setTempUsuarios(listaDeUsuarios);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadTempUsers();
  }, []);

  // Handle temporary password check after login
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      dispatch(setLoading(true));
      
      // Verificar si es un primer inicio de sesión con contraseña temporal
      const userDetail = tempUsuarios.find((user: any) => user.email === values.email);
      console.log("userDetail: ", userDetail);
      const isFirstLogin = userDetail?.tmpKey === values.password;
      console.log("isFirstLogin: ", isFirstLogin);
      // Iniciar sesión con Firebase
      const userCredential = await signInWithEmailAndPassword(
        getAuth(), 
        values.email, 
        values.password
      );

      if (isFirstLogin) {
        // Si es primer inicio de sesión, mostrar mensaje y formulario de cambio de contraseña
        await Swal.fire({
          title: "¡Cambio de contraseña requerido!",
          text: "Por seguridad, debes cambiar tu contraseña temporal antes de continuar.",
          icon: "info",
          confirmButtonText: "Entendido"
        });
        setCurrentUserEmail(values.email);
        setShowChangePasswordForm(true);
      } else {
        // Si no es primer inicio de sesión, proceder normalmente
        router.push("/");
      }

      dispatch(setLoading(false));
      console.log('Usuario logeado:', userCredential.user);
    } catch (error: any) {
      dispatch(setLoading(false));
      console.error('Error al iniciar sesión:', error);
      Swal.fire({
        title: "Error!",
        text: error.toString(),
        icon: "error"
      });
    }
  };

  // Cerrar sesión si el usuario cancela el cambio de contraseña
  const handleBackFromChangePassword = async () => {
    try {
      await signOut(auth);
      setShowChangePasswordForm(false);
      setCurrentUserEmail("");
      form.resetFields();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (showResetForm) {
    return <FormResetPassword onBack={() => setShowResetForm(false)} />;
  }

  if (showChangePasswordForm) {
    return (
      <FormChangePassword
        onBack={handleBackFromChangePassword}
        email={currentUserEmail}
        isFirstLogin={true}
      />
    );
  }

  return (
    <Form
      form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "1rem 5rem" : "1rem" }}
      initialValues={{
        email: "",
        password: "",
      }}
      onFinish={handleLogin}
    >
      <Title level={3}>INICIAR SESIÓN</Title>
      <Row gutter={12} style={{ marginTop: "1rem" }}>
        <Divider />
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
      </Row>

      <Row gutter={12}>
        <Divider />
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button loading={loading} icon={<UndoOutlined />} danger type="primary" block htmlType="reset">
              Limpiar
            </Button>
            <Button loading={loading} icon={<LoginOutlined />} type="primary" block htmlType="submit">
              Ingresar
            </Button>
          </Flex>
        </Col>

        <Col span={24}>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Typography.Text style={{ color: '#555555' }}>¿No tienes una cuenta? </Typography.Text>
            <Typography.Link href="/empresas/registrar" style={{ color: '#1890ff' }}>
              Crear una cuenta
            </Typography.Link>
          </div>
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <Button type="link" onClick={() => setShowResetForm(true)}>
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  )
}

export default FormLogin