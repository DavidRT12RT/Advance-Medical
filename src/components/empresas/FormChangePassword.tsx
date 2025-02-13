"use client";
import React from 'react';
import { Button, Col, Divider, Flex, Form, Input, Row, Typography, Grid } from 'antd';
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, updatePassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import { setLoading } from '@/features/administracionSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { useRouter } from 'next/navigation';

const { useBreakpoint } = Grid;
const { Title } = Typography;
const style: React.CSSProperties = { width: '100%' };

interface FormChangePasswordProps {
  onBack: () => void;
  email?: string;
  isFirstLogin?: boolean;
  onSuccess?: () => void;
}

const FormChangePassword: React.FC<FormChangePasswordProps> = ({ onBack, email, isFirstLogin, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const screens = useBreakpoint();
  const { loading } = useSelector((state: any) => state.administracion);
  const auth = getAuth();

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        Swal.fire({
          title: "Error",
          text: "Las contraseñas nuevas no coinciden",
          icon: "error"
        });
        return;
      }

      dispatch(setLoading(true));
      const user = auth.currentUser;
      
      if (!user && !email) {
        throw new Error('No hay usuario autenticado');
      }

      const userEmail = email || user?.email;
      if (!userEmail) {
        throw new Error('No se encontró el correo electrónico');
      }

      // Reautenticar al usuario
      await signInWithEmailAndPassword(auth, userEmail, values.currentPassword);

      // Cambiar la contraseña
      await updatePassword(auth.currentUser!, values.newPassword);

      Swal.fire({
        title: "¡Éxito!",
        text: "Contraseña actualizada correctamente",
        icon: "success"
      });

      form.resetFields();
      
      if (isFirstLogin) {
        // For first login, just call onSuccess if provided, otherwise redirect to home
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/");
        }
      } else {
        // For normal password change, sign out and redirect to login
        await signOut(auth);
        router.push("/empresas/login");
      }
    } catch (error: any) {
      console.error('Error al cambiar la contraseña:', error);
      let errorMessage = "Error al cambiar la contraseña";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "La contraseña actual es incorrecta";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La nueva contraseña es demasiado débil";
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
      name="change-password-form"
      layout="vertical"
      style={{ width: "100%", padding: screens.md ? "1rem 5rem" : "1rem" }}
      onFinish={handleChangePassword}
    >
      <Title level={3}>{isFirstLogin ? 'CAMBIAR CONTRASEÑA TEMPORAL' : 'CAMBIAR CONTRASEÑA'}</Title>
      {isFirstLogin && (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '2rem' }}>
          Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
        </Typography.Text>
      )}

      <Row gutter={12} style={{ marginTop: "2rem" }}>
        <Col span={24}>
          <Form.Item
            name="currentPassword"
            label="Contraseña actual"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña actual' }
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Ingresa tu contraseña actual"
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="newPassword"
            label="Nueva contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Ingresa la nueva contraseña"
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="confirmPassword"
            label="Confirmar nueva contraseña"
            rules={[
              { required: true, message: 'Por favor confirma la nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Confirma la nueva contraseña"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Divider />
        <Col span={24}>
          <Flex gap="small" style={{ width: '50%', margin: "auto" }}>
            {!isFirstLogin && (
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                block
              >
                Volver
              </Button>
            )}
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<LockOutlined />}
              block
            >
              Cambiar Contraseña
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  );
};

export default FormChangePassword;
