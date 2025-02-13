"use client";
import React from 'react';
import { Button, Col, Drawer, Form, Row, Space, Typography, Tooltip } from 'antd'
import { useRouter } from 'next/navigation';
import {
  FileTextOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'

import { setDetalleDeListaDePrecios, setOpenDrawerListaDePrecios } from '@/features/ventasSlice';

import FireStoreVentas from '@/firebase/FireStoreVentas';
import TableDetalleListaDePrecios from '@/components/ventas/lista-de-precios/TableDetalleListaDePrecios';
import SearchDetalleListaDePrecios from '@/components/ventas/lista-de-precios/SearchDetalleListaDePrecios';
import FormListaDePrecios from '@/components/ventas/lista-de-precios/FormListaDePrecios';


const page = ({ params }: any) => {

  const router = useRouter();
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const {
    refresh,
    detalleDeListaDePrecios,
    openDrawerListaDePrecios
  } = useSelector((state: any) => state.ventas);

  React.useEffect(() => {
    if (params?.idLista) {
      FireStoreVentas.buscarListaDePrecios(auth?.empresa?.id, params?.idLista)
        .then((detalleDeLaLista) => {
          dispatch(setDetalleDeListaDePrecios(detalleDeLaLista));
        });
    }
  }, [params, refresh]);



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
                <FileTextOutlined style={{ fontSize: '24px' }} />
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Articulos ({detalleDeListaDePrecios?.nombreDeLaListaDePrecios})</Typography.Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              /* style={{ background: "orange" }} */
              icon={<PlusOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
              onClick={() => {
                form.resetFields();

                form.setFieldsValue({
                  ...detalleDeListaDePrecios, fechaRegistro: ""
                });

                dispatch(setDetalleDeListaDePrecios({
                  ...detalleDeListaDePrecios, fechaRegistro: ""
                }));
                dispatch(setOpenDrawerListaDePrecios(true));
              }}
              disabled={false}
            >
              Agregar Artículos
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={detalleDeListaDePrecios?.id ? 'Editar lista de precios' : 'Nueva lista de precios'}
        width={768}
        onClose={() => dispatch(setOpenDrawerListaDePrecios(false))}
        open={openDrawerListaDePrecios}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeListaDePrecios?.id ? "orange" : "rgba(5, 5, 5, 0.06)"
          }
        }}>
        <FormListaDePrecios form={form} isAgregarArticulos />
      </Drawer>

      <SearchDetalleListaDePrecios />
      <TableDetalleListaDePrecios form={form} />
    </div>
  )
}

export default page