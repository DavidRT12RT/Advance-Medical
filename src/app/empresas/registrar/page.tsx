"use client";
import React from 'react';
import { Col, Grid, Row, Spin, Steps } from 'antd';

import { useSelector } from 'react-redux';
import ImageLogin from '@/components/empresas/ImageLogin';
import FormDatosDeContacto from '@/components/empresas/FormDatosDeContacto';
import FormDatosAdicionales from '@/components/empresas/FormDatosAdicionales';
import FormDocumentos from '@/components/empresas/FormDocumentos';
import VerificarCorreo from '@/components/empresas/VerificarCorreo';
import { useRouter } from 'next/navigation';

const { useBreakpoint } = Grid;


const page = () => {

  const router = useRouter();
  const screens = useBreakpoint();
  const {
    currentStep,
    auth
  } = useSelector((state: any) => state.configuracion);


  React.useEffect(() => {
    if (["Aceptado"].includes(auth?.empresa?.estatus)) {
      router.push("/");
    }
  }, [auth]);

  const [loading, setloading] = React.useState(true);
  React.useEffect(() => {
    setloading(false);
  }, []);


  // Array de formularios para mostrarlos según el paso actual
  const stepsContent = [
    <FormDatosDeContacto />,
    <FormDatosAdicionales />,
    <VerificarCorreo />,
    <FormDocumentos />,
  ];


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
      <Col xs={2} sm={2} md={2} lg={1} xl={1}>
        <Steps

          current={currentStep}
          progressDot
          direction="vertical"
          style={{
            width: "100%",
            height: "100vh",
            padding: screens.md ? "3rem" : "1rem",
            paddingBottom: "0px",
          }}>
          <Steps.Step />
          <Steps.Step />
          <Steps.Step />
          <Steps.Step />
        </Steps>
      </Col>
      <Col xs={22} sm={22} md={22} lg={11} xl={11}>
        <div style={{ maxHeight: "100vh", overflow: "auto" }}>
          <div style={{ width: "100%" }}>
            {stepsContent[currentStep]}
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default page;