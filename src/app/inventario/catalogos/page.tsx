"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { setOpenDrawer, setDetalleCatalogos } from '@/features/inventarioSlice';

import FormCatalogos from '@/components/inventario/catalogos/FormCatalogos';
import TableCatalogos from '@/components/inventario/catalogos/TableCatalogos';
import SearchCatalogos from '@/components/inventario/catalogos/SearchCatalogos';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { setListaDeClientes } from '@/features/ventasSlice';


const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleCatalogo, openDrawer } = useSelector((state: any) => state.inventario);
  const { auth } = useSelector((state: any) => state.configuracion);
  const { idNuevoCliente } = useSelector((state: any) => state.ventas);

  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && idNuevoCliente)) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth, idNuevoCliente]);


  /*  React.useEffect(() => {
     const unsubscribe = onAuthStateChanged(getAuth(), async (userImpl) => {
       try {
         console.log('userImpl', userImpl)
         registrarUsuario({name: "test"})
       } catch (error) {
         console.log('error', error)
       }
     });
     return () => {
       unsubscribe();
     };
   }, []); */


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
                <Typography.Title level={4} style={{ marginBottom: '0px' }}>Catálogos</Typography.Title>
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
                dispatch(setOpenDrawer(true));
                dispatch(setDetalleCatalogos(null));
              }}
              disabled={false}
            >
              Nuevo Catálogo
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={detalleCatalogo?.id ? 'Editar catálogo' : 'Nuevo catálogo'}
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}>
        <FormCatalogos form={form} />
      </Drawer>
      <SearchCatalogos />
      <TableCatalogos form={form} />
    </div>
  )
}

export default page