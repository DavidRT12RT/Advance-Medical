"use client";
import FormResetPassword from '@/components/empresas/FormResetPassword';
import { Card } from 'antd';
import React from 'react';

const ResetPasswordPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: '100%', maxWidth: 600, margin: '20px' }}>
        <FormResetPassword />
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
