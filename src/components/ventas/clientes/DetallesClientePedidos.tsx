import React from 'react';
import { Row, Col, Typography, Divider, Image, Avatar, Card, Table, Badge, Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Grid } from 'antd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DetallesClientePedidosProps {
  perfilCliente: any;
  style: React.CSSProperties;
}

const DetallesClientePedidos: React.FC<DetallesClientePedidosProps> = ({ perfilCliente, style }) => {
  const screens = useBreakpoint();

  const dataSource = [
    {
      key: '1',
      pedido: 'PED-001',
      fecha: '2024-02-10',
      total: '$1,500.00',
      estado: 'Entregado',
    },
    {
      key: '2',
      pedido: 'PED-002',
      fecha: '2024-02-09',
      total: '$2,300.00',
      estado: 'En proceso',
    },
  ];

  const columns = [
    {
      title: 'Pedido',
      dataIndex: 'pedido',
      key: 'pedido',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Badge 
          status={estado === 'Entregado' ? 'success' : 'processing'} 
          text={estado} 
        />
      ),
    },
  ];

  return (
    <Row gutter={12} style={{ ...style, marginTop: "1rem" }}>
       <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={6}>
        <div style={{
          ...style,
          borderRadius: "1rem",
          background: "#f2f2f2",
          textAlign: "center",
          padding: screens.md ? "1rem" : "0.5rem",
          margin: "auto"
        }}>
          {Boolean(perfilCliente?.photoURL) ? (
            <Image
              style={{ borderRadius: "1rem" }}
              width={150}
              src={perfilCliente?.photoURL}
            />
          ) : (
            <Avatar shape="square" size={150}>
              <UserOutlined style={{ fontSize: "75px" }} />
            </Avatar>
          )}

          <Title level={4} style={{ width: "100%" }}>
            {perfilCliente?.nombreCliente}
          </Title>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text>{perfilCliente?.tipoIndustria}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text>{perfilCliente?.id}</Text>
          </div>

          <Divider />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: 8 }} />
            <Text>{perfilCliente?.telefonoContacto}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MailOutlined style={{ marginRight: 8 }} />
            <Text>{perfilCliente?.correoContacto}</Text>
          </div>

          <Divider />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            <Text>{perfilCliente?.direccion}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            <Text>{perfilCliente?.fechaRegistro}</Text>
          </div>

          <Divider />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text>{perfilCliente?.monedaUtilizada}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text>{perfilCliente?.regimenFiscal}</Text>
          </div>
        </div>
      </Col>
      <Col className="gutter-row" xs={24} sm={24} md={16} lg={18} xl={18}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>
              <ShoppingOutlined /> Historial de Pedidos
            </Title>
            <Table 
              dataSource={dataSource} 
              columns={columns}
              pagination={{ pageSize: 5 }}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default DetallesClientePedidos;
