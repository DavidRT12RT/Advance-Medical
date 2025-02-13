"use client";
import React from 'react';
import { Col, Row, Spin } from 'antd';

import FormLogin from '@/components/empresas/FormLogin';
import ImageLogin from '@/components/empresas/ImageLogin';


const page = () => {

  const [loading, setloading] = React.useState(true);
  React.useEffect(() => {
    setloading(false);
  }, []);


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "white" }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }


  return (
    <Row gutter={0} style={{ background: "white" }}>
      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <ImageLogin />
      </Col>
      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <div style={{ maxHeight: "100vh", overflow: "auto" }}>
          <FormLogin />
        </div>
      </Col>
    </Row>
  )
}

export default page;