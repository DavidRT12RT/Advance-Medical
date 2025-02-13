"use client";
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ConfirmResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Código de verificación no válido');
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
      } catch (error) {
        console.error('Error verifying reset code:', error);
        setError('El enlace ha expirado o no es válido');
      }
    };

    verifyCode();
  }, [oobCode, auth]);

  const onFinish = async (values: { password: string }) => {
    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      message.success('Contraseña actualizada exitosamente');
      router.push('/empresas/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ width: '100%', maxWidth: 400, margin: '20px', textAlign: 'center' }}>
          <Title level={4} style={{ color: '#ff4d4f' }}>{error}</Title>
          <Button type="primary" onClick={() => router.push('/empresas/login')}>
            Volver al inicio de sesión
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: '100%', maxWidth: 400, margin: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Establecer nueva contraseña
        </Title>
        {email && (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
            Para la cuenta: {email}
          </Text>
        )}
        <Form
          form={form}
          name="reset-password-confirm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="Nueva contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Ingresa tu nueva contraseña"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Confirma tu nueva contraseña"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Actualizar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ConfirmResetPasswordPage;
