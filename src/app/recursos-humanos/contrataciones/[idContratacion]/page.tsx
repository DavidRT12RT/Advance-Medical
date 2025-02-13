"use client";
import { Avatar, Button, Col, Collapse, Flex, List, Row, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CheckOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { setDetalleDeContratacion, setDetalleDelPostulante, setListaDePostulantes } from '@/features/recursosHumanosSlice';
import { doc } from 'firebase/firestore';
import SkeletonPostulantes from '@/components/recursos-humanos/SkeletonPostulantes';

const { Title, Text } = Typography;
const style: React.CSSProperties = { width: '100%' };


const page = () => {

  const [loading, setloading] = React.useState<Boolean>(true);
  const [pageSize, setPageSize] = React.useState(5); // Tamaño de página inicial

  const router = useRouter();
  const dispatch = useDispatch();
  const { idContratacion } = useParams();
  const { detalleDeContratacion, listaDePostulantes } = useSelector((state: any) => state.recursosHumanos);


  React.useEffect(() => {
    setloading(true);
    if (idContratacion) {
      (async () => {
        const contratacion = await FireStoreRecursosHumanos.buscarContratacion(idContratacion);
        dispatch(setDetalleDeContratacion(contratacion));
        const postulantesContratacion = await FireStoreRecursosHumanos.listarPostulantesContratacion(idContratacion);
        dispatch(setListaDePostulantes(postulantesContratacion));
        setloading(false);
      })()
    }
  }, [idContratacion]);

  const postulantes = loading ? <SkeletonPostulantes /> : (
    <List
      size='small'
      pagination={{
        position: "bottom",
        align: "end",
        onChange: (page, size) => setPageSize(size),
        pageSize: pageSize,
        showSizeChanger: true, // Mostrar el selector para cambiar el tamaño de la página
        pageSizeOptions: ['5', '10', '25', '50', '100'], // Opciones de tamaño de página
        //  showQuickJumper: true,
      }}
      dataSource={listaDePostulantes}
      renderItem={(postulante: any) => (
        <List.Item
          actions={[
            <Tooltip title="Ver detalle completo">
              <Button onClick={() => {
                dispatch(setDetalleDelPostulante(postulante));
                router.push(`/recursos-humanos/contrataciones/${detalleDeContratacion?.id}/${postulante?.id}`);
              }} shape="circle" icon={<EyeOutlined />} />
            </Tooltip>
          ]}>
          <List.Item.Meta
            avatar={<Avatar><UserOutlined /></Avatar>}
            title={postulante?.nombreCompleto}
            description={(
              <>
                <Tag color={["En entrevista", "En firma"].includes(postulante?.estatus) ? "success" : "processing"}>{postulante?.estatus}</Tag>
                <Text>{postulante?.fechaDeNacimiento}</Text>
              </>
            )}
          />
        </List.Item>
      )}
    />
  );


  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <Tooltip title="Atras">
                  <Button onClick={() => {
                    router.back();
                  }} type="primary" shape="circle" icon={<ArrowLeftOutlined />} />
                </Tooltip>
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: '0px' }}>
                  Detalle completo de contratación
                </Title>
              </Col>
            </Space>
          </Col>

        </Row>
      </Space>
      <Row gutter={12} style={{ ...style, marginTop: "1.5rem" }}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{
            ...style,
            /* borderRadius: "1rem", */
            /* background: "#f2f2f2", */
            textAlign: "left",
            padding: "0px",//screens.md ? "1rem" : "0.5rem",
            margin: "auto"
          }}>
            <Collapse
              defaultActiveKey={['1', '2']}
              items={[
                {
                  key: '1',
                  label: (
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Información de contratación
                    </Text>
                  ),
                  children: (
                    <>
                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Nombre del puesto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.nombreDelPuesto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Descripción del puesto</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.descripcionDelPuesto || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Rol</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.rol || "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>

                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Departamento</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.departamento || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Fecha de apertura</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.fechaDeApertura || "---"}
                            </Text>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Salario aproximado</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {detalleDeContratacion?.salarioAproximado || "---"}
                            </Text>
                          </div>
                        </Col>
                      </Row>

                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Personas responsables</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
                              {(detalleDeContratacion?.personasResponsables || []).map((item: any, index: number) => (
                                <Tag
                                  style={{
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    display: 'flex', // Usar flexbox para alinear la "X"
                                    alignItems: 'center', // Alinear el texto y la "X"
                                  }}
                                  key={index}
                                // icon={<CheckOutlined />}
                                // color='#1a88ff'// verde
                                >
                                  <span style={{ flex: 1 }}>{`${item?.nombres} ${item?.apellidos}`}</span>
                                </Tag>
                              ))}
                            </Flex>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Requisitos clave</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
                              {(detalleDeContratacion?.requisitosClave || []).map((item: any, index: number) => (
                                <Tag
                                  style={{
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    display: 'flex', // Usar flexbox para alinear la "X"
                                    alignItems: 'center', // Alinear el texto y la "X"
                                  }}
                                  key={index}
                                  icon={<CheckOutlined />}
                                  color='#1a88ff'// verde
                                >
                                  <span style={{ flex: 1 }}>{item}</span>
                                </Tag>
                              ))}
                            </Flex>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Prestaciones</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
                              {(detalleDeContratacion?.prestaciones || []).map((item: any, index: number) => (
                                <Tag
                                  style={{
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    display: 'flex', // Usar flexbox para alinear la "X"
                                    alignItems: 'center', // Alinear el texto y la "X"
                                  }}
                                  key={index}
                                  icon={<CheckOutlined />}
                                  color='#1a88ff'// verde
                                >
                                  <span style={{ flex: 1 }}>{item}</span>
                                </Tag>
                              ))}
                            </Flex>
                          </div>
                        </Col>
                      </Row>

                      <Row gutter={12} style={style}>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text>Documentos solicitados</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Flex gap="4px 0" wrap style={{ ...style, margin: "0.5rem 0rem" }}>
                              {(detalleDeContratacion?.documentosSolicitados || []).map((item: any, index: number) => (
                                <Tag
                                  style={{
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    display: 'flex', // Usar flexbox para alinear la "X"
                                    alignItems: 'center', // Alinear el texto y la "X"
                                  }}
                                  key={index}
                                  icon={<CheckOutlined />}
                                  color='#1a88ff'// verde
                                >
                                  <span style={{ flex: 1 }}>{item}</span>
                                </Tag>
                              ))}
                            </Flex>
                          </div>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                        </Col>
                        <Col className="gutter-row" xs={24} sm={24} md={8} lg={8} xl={8}>
                        </Col>
                      </Row>
                    </>
                  )
                },
                {
                  key: '2',
                  label: (
                    <Text style={{ fontWeight: "bold",/*  fontSize: "1rem", */ textAlign: "left" }}>
                      Postulantes registrados {listaDePostulantes?.length}
                    </Text>
                  ),
                  children: postulantes
                }
              ]}
            />
          </div>
        </Col>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>

        </Col>
      </Row>

    </div>

  )
}

export default page;