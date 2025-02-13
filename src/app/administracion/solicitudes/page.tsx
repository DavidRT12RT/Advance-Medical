"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Result, Row, Space, Typography } from 'antd'
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setAddress, setCoordinates, setDetalleDeSucursal, setOpenDrawer } from '@/features/configuracionSlice';
import FormSucursales from '@/components/configuracion/sucursales/FormSucursales';
import SearchSolicitudesDeEmpresas from '@/components/administracion/solicitudes/SearchSolicitudesDeEmpresas';
import TableSolicitudesDeEmpresas from '@/components/administracion/solicitudes/TableSolicitudesDeEmpresas';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const router = useRouter();
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);

  if (!auth?.empresa?.isAdmin) {
    return <Result
      status="403"
      title="403"
      subTitle="Lo sentimos, no está autorizado a acceder a esta página."
      extra={<Button type="primary" onClick={() => {
        router.back();
      }}>Atras</Button>}
    />
  }


  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <FileTextOutlined style={{ fontSize: '24px' }} />
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: '0px', width: "100%" }}>Solicitudes</Title>
              </Col>
            </Space>
          </Col>
          <Col>
            {/* <Button
              type="primary"
              style={{ display: "none" }}
              icon={<PlusOutlined />} // Usa el ícono de Ant Design o tu propio ícono aquí
              onClick={() => {
                form.resetFields();

                dispatch(setOpenDrawer(true));
                dispatch(setDetalleDeSucursal(null));
                
              }}
              disabled={false}
            >
              Nueva sucursal
            </Button> */}
          </Col>
        </Row>
      </Space>

      {/* <Drawer
        title={detalleDeSucursal?.id ? 'Editar sucursal' : 'Nueva sucursal'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormSucursales form={form} />
      </Drawer> */}

      <SearchSolicitudesDeEmpresas />
      <TableSolicitudesDeEmpresas form={form} />
    </div>
  )
}

export default page