"use client";
import React from 'react';

import { Col, Form, Grid, Layout, Row, Space, Spin, theme, Typography } from 'antd'
import {
  FileTextOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import FormLinkContrataciones from '@/components/recursos-humanos/FormLinkContrataciones';
import { useParams } from 'next/navigation';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setDetalleDeContratacion } from '@/features/recursosHumanosSlice';

const { Title } = Typography;
const { Header, Content } = Layout;
const { useBreakpoint } = Grid;


const page = () => {

  const [loading, setloading] = React.useState<Boolean>(true);

  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const dispatch = useDispatch();
  const { idContratacion } = useParams();
  const { detalleDeContratacion } = useSelector((state: any) => state.recursosHumanos);

  React.useEffect(() => {
    setloading(true);
    if (idContratacion) {
      FireStoreRecursosHumanos.buscarContratacion(idContratacion)
        .then((contratacion) => {
          dispatch(setDetalleDeContratacion(contratacion));
        }).finally(() => {
          setloading(false);
        });
    }

  }, [idContratacion]);


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    background: "#007BFF",
  };

  const contentStyle: React.CSSProperties = {
    margin: screens.md ? "24px" : "12px",
    padding: screens.md ? 24 : 6,
    // minHeight: `calc(100vh - ${screens.md ? '112' : '88'}px)`,
    background: colorBgContainer,
    /* overflowY: "auto", */
    borderRadius: borderRadiusLG,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "white" }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={headerStyle}>
        <Title level={4} style={{ marginBottom: '0px', color: "white" }}>
          {!loading && !detalleDeContratacion?.id
            ? "Contratación no encontrata!"
            : detalleDeContratacion?.nombreDelPuesto}
        </Title>
      </Header>
      <Content style={contentStyle}>
        <Row gutter={12}>
          <Col xs={24} sm={24} md={2} lg={5} xl={6} />
          <Col xs={24} sm={24} md={20} lg={14} xl={12}>
            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                  <Col>
                    <Space>
                      <Col>
                        <FileTextOutlined style={{ fontSize: '24px' }} />
                      </Col>
                      <Col>
                        <Title level={screens.md ? 4 : 5} style={{ marginBottom: '0px' }}>
                          Datos de Contacto e Información Profesional
                        </Title>
                      </Col>
                    </Space>
                  </Col>
                </Row>
              </Space>

              <FormLinkContrataciones form={form} />

            </div>
          </Col>
          <Col xs={24} sm={24} md={2} lg={5} xl={6} />
        </Row>
      </Content>
    </Layout>
  )
}

export default page;