"use client";
import React from 'react'
import { useSelector } from 'react-redux';
import { Card, Typography, Row, Col, Modal, Space, Descriptions, Badge, Timeline, Empty } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

interface DetallesRutaProps {
  isOpen: boolean;
  onClose: () => void;
  rutaData?: any; // Replace with proper type when real data structure is available
}

const DetallesRuta: React.FC<DetallesRutaProps> = ({ isOpen, onClose, rutaData }) => {


  const {
    listaDeRutas
  } = useSelector((state: any) => state.finanzas);

  const {
    listaDeProveedores = [],
  } = useSelector((state: any) => state.ventas);

  const {
    listaDeSucursales = [],
  } = useSelector((state: any) => state.configuracion);



  const getRutaLabel = (rutaId: string) => {
    const ruta = listaDeRutas.find((r: any) => r.id === rutaId);
    if (!ruta) return "";

    if (ruta.tipoDeRuta === "Proveedor") {
      const proveedor = listaDeProveedores.find((p: any) => p.id === ruta.proveedor);
      return `${ruta.tipoDeRuta} - ${proveedor?.nombreProveedor || ''}`;
    } else if (ruta.tipoDeRuta === "Automática") {
      const sucursal = listaDeSucursales.find((s: any) => s.id === ruta.sucursal);
      return `${ruta.tipoDeRuta} - ${sucursal?.nombre || ''}`;
    }
    return ruta.tipoDeRuta;
  };
  // Temporary mock data
  const mockData = {
    id: "RT001",
    conductor: "Juan Pérez",
    unidad: "Toyota Hilux 2022",
    placas: "ABC-123",
    estado: "En Progreso",
    fechaInicio: "2024-12-16 08:00",
    fechaFin: "2024-12-16 17:00",
    paradas: [
      {
        id: 1,
        lugar: "Centro de Distribución Principal",
        horario: "08:00",
        estado: "Completado",
        tipo: "Inicio"
      },
      {
        id: 2,
        lugar: "Cliente A - Zona Norte",
        horario: "10:30",
        estado: "Completado",
        tipo: "Entrega"
      },
      {
        id: 3,
        lugar: "Cliente B - Zona Centro",
        horario: "13:00",
        estado: "En Progreso",
        tipo: "Entrega"
      },
      {
        id: 4,
        lugar: "Centro de Distribución Principal",
        horario: "17:00",
        estado: "Pendiente",
        tipo: "Fin"
      }
    ]
  };

  const data = rutaData || mockData;

  return (
    <Modal
      title={<Typography.Title level={4}>Detalles de la Ruta {data?.rutaAsignada ? getRutaLabel(data?.rutaAsignada) : ''}</Typography.Title>}
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label={<><UserOutlined /> Conductor</>}>
                  {/* {data?.conductor || 'No asignado'} */}
                  {`${data?.choferAsignado ? data?.nombreChofer : 'No asignado'}`}
                </Descriptions.Item>
                <Descriptions.Item label={<><CarOutlined /> Unidad</>}>
                  {/* {data?.unidad || 'No asignada'} */}
                  {`${data?.marca} - ${data?.modelo}` || 'No asignada'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Inicio</>}>
                  {data?.fechaInicio || 'No definido'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Fin Estimado</>}>
                  {data?.fechaFin || 'No definido'}
                </Descriptions.Item>
                <Descriptions.Item label="Estado" span={2}>
                  <Badge status="processing" text={data?.status || 'Sin estado'} />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Cronograma de Ruta">
              {data?.paradas?.length > 0 ? (
                <Timeline
                  mode="left"
                  items={data.paradas.map((parada: any) => ({
                    label: parada.horario,
                    children: (
                      <Space direction="vertical">
                        <Typography.Text strong>{parada.lugar}</Typography.Text>
                        <Badge
                          status={
                            parada.estado === 'Completado' ? 'success' :
                              parada.estado === 'En Progreso' ? 'processing' :
                                'default'
                          }
                          text={parada.estado}
                        />
                      </Space>
                    ),
                    color: parada.estado === 'Completado' ? 'green' :
                      parada.estado === 'En Progreso' ? 'blue' :
                        'gray',
                  }))}
                />
              ) : (
                <Empty description="No hay paradas registradas en esta ruta" />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </Modal>
  );
};

export default DetallesRuta;
