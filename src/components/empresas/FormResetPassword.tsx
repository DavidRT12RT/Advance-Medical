"use client";
import { Button, Col, Form, Input, Row, Typography, Grid, Divider, Flex } from 'antd';
import React from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/features/administracionSlice';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface FormResetPasswordProps {
  onBack?: () => void;
}

const FormResetPassword: React.FC<FormResetPasswordProps> = ({ onBack }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const screens = useBreakpoint();
  const { loading } = useSelector((state: any) => state.administracion);
  const auth = getAuth();

  const handleResetPassword = async (values: { email: string }) => {
    try {
      dispatch(setLoading(true));
      const actionCodeSettings = {
        url: window.location.origin + '/empresas/confirm-reset-password',
        handleCodeInApp: true
      };
      await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
      Swal.fire({
        title: "¡Correo enviado!",
        text: "Se han enviado las instrucciones para restablecer tu contraseña",
        icon: "success"
      });
      if (onBack) {
        onBack();
      } else {
        router.push('/empresas/login');
      }
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = "Ocurrió un error al enviar el correo";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este correo electrónico";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El correo electrónico no es válido";
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error"
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Form
      form={form}
      name="reset-password-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "1rem 5rem" : "1rem" }}
      onFinish={handleResetPassword}
    >
      <Title level={3}>RESTABLECER CONTRASEÑA</Title>
      <Text type="secondary">
        Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
      </Text>

      <Row gutter={12} style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Por favor ingresa tu correo electrónico' },
              { type: 'email', message: 'Por favor ingresa un correo electrónico válido' }
            ]}
          >
            <Input size="large" placeholder="Ingresa tu correo electrónico" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Divider />
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              block
            >
              Volver
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SendOutlined />}
              block
            >
              Enviar
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  );
};

export default FormResetPassword;
