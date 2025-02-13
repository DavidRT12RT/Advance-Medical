"use client";
import React, { useState, useEffect } from 'react';
import { Col, Input, Row, Image, Typography, Divider, Button, Space, Tooltip, Grid, Collapse, Avatar, Badge, Descriptions, Tabs, Card } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { useDispatch, useSelector } from 'react-redux';
import { setloadingDetalle, setPerfilClientes } from '@/features/ventasSlice';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  EyeOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import SkeletonClientes from '@/components/ventas/clientes/SkeletonClientes';
import DetallesCliente from '@/components/ventas/clientes/DetallesClienteInformacion';
import DetallesClientePedidos from '@/components/ventas/clientes/DetallesClientePedidos';
import DetallesClienteMovimientos from '@/components/ventas/clientes/DetallesClienteMovimientos';
import DetallesClienteCompras from '@/components/ventas/clientes/DetallesClienteCompras';
import TabsClientes from '@/components/ventas/clientes/TabsClientes';
import DetallesClienteInformacion from '@/components/ventas/clientes/DetallesClienteInformacion';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const DOCUMENTOS: any = {
  "contratos": "Contratos",
  "cfdi": "Cédula de identificación fiscal",
  "otros": "Otros"
};

const style: React.CSSProperties = { width: '100%' };

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const perfilCliente = useSelector((state: any) => state.ventas.perfilCliente);
  const { auth } = useSelector((state: any) => state.configuracion);

  useEffect(() => {
    const getCliente = async () => {
      setLoading(true);
      try {
        const clienteId = Array.isArray(params.idCliente) ? params.idCliente[0] : params.idCliente;
        const response = await FireStoreVentas.buscarCliente(auth?.empresa?.id || "", clienteId);
        dispatch(setPerfilClientes({ ...response, fechaRegistro: "" }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCliente();
  }, [params.idCliente, auth?.empresa?.id]);

  if (loading) {
    return <SkeletonClientes />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case '1':
        return <DetallesClienteInformacion perfilCliente={perfilCliente} style={style} />;
      case '2':
        return <DetallesClientePedidos perfilCliente={perfilCliente} style={style} />;
      case '3':
        return <DetallesClienteMovimientos perfilCliente={perfilCliente} style={style} />;
      case '4':
        return <DetallesClienteCompras perfilCliente={perfilCliente} style={style} />;
      default:
        return <DetallesClienteInformacion perfilCliente={perfilCliente} style={style} />;
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button
                    onClick={() => {
                      router.back();
                    }}
                    type="primary"
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: '0px' }}>
                  Perfil completo del cliente
                </Title>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>

      <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <TabsClientes onTabChange={(key) => {
            setActiveTab(key);
          }} />
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          {renderContent()}
        </Col>
      </Row>
    </div>
  );
};

export default Page;