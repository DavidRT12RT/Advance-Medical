import React from 'react';
import { Row, Col, Typography, Divider, Image, Avatar, Card, List, Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Grid } from 'antd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DetallesClienteMovimientosProps {
  perfilCliente: any;
  style: React.CSSProperties;
}

const DetallesClienteMovimientos: React.FC<DetallesClienteMovimientosProps> = ({ perfilCliente, style }) => {
  const screens = useBreakpoint();

  const data = [
    {
      title: 'Pago recibido',
      description: 'Pago de factura #123',
      amount: '+$1,500.00',
      date: '2024-02-10',
    },
    {
      title: 'Devolución',
      description: 'Devolución de producto',
      amount: '-$300.00',
      date: '2024-02-09',
    },
    {
      title: 'Pago recibido',
      description: 'Pago de factura #124',
      amount: '+$2,000.00',
      date: '2024-02-08',
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
              <DollarOutlined /> Movimientos Financieros
            </Title>
            <List
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Space direction="vertical" align="end">
                      <Text style={{ 
                        color: item.amount.includes('+') ? '#52c41a' : '#f5222d',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {item.amount}
                      </Text>
                      <Text type="secondary">{item.date}</Text>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={<Text strong>{item.title}</Text>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default DetallesClienteMovimientos;
