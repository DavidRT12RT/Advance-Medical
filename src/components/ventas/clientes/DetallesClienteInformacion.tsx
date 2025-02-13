import React from 'react';
import { Row, Col, Typography, Divider, Image, Avatar, Collapse, Badge, Descriptions } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { Grid } from 'antd';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DetallesClienteInformacionProps {
  perfilCliente: any;
  style: React.CSSProperties;
}

const DetallesClienteInformacion: React.FC<DetallesClienteInformacionProps> = ({ perfilCliente, style }) => {
  const screens = useBreakpoint();

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
        <div style={{
          ...style,
          textAlign: "left",
          padding: "0px",
          margin: "auto"
        }}>
          <Collapse
            defaultActiveKey={['1', '2', '3']}
            items={[
              {
                key: '1',
                label: (
                  <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                    Información del cliente
                  </Text>
                ),
                children: (
                  <>
                    <Row gutter={12} style={style}>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Nombre del Contacto</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.nombreContacto || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Teléfono del Contacto</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.telefonoContacto || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Correo del Contacto</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.correoContacto || "---"}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </>
                )
              },
              {
                key: '2',
                label: (
                  <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                    Información Fiscal
                  </Text>
                ),
                children: (
                  <>
                    <Row gutter={12} style={style}>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>RFC</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.RFC || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Denominación/Razón Social</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.Denominacion_Razon_Social || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Régimen Fiscal</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.regimenFiscal || "---"}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </>
                )
              },
              {
                key: '3',
                label: (
                  <Text style={{ fontWeight: "bold", textAlign: "left" }}>
                    Información de pagos
                  </Text>
                ),
                children: (
                  <>
                    <Row gutter={12} style={style}>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Moneda de Pago</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.monedaPago || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Email de Compras</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.emailCompras || "---"}
                          </Text>
                        </div>
                      </Col>
                      <Col className="gutter-row" xs={24} sm={24} md={12} lg={8} xl={8}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text>Email de Facturación</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {perfilCliente?.emailFacturacion || "---"}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </>
                )
              }
            ]}
          />
        </div>
      </Col>
    </Row>
  );
};

export default DetallesClienteInformacion;
