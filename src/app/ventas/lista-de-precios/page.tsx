"use client";
import React from "react";

import { Button, Col, Drawer, Form, Row, Space, Typography } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setOpenDrawer, setDetalleCatalogos } from "@/features/inventarioSlice";
import SearchListaDePrecios from "@/components/ventas/lista-de-precios/SearchListaDePrecios";
import FormListaDePrecios from "@/components/ventas/lista-de-precios/FormListaDePrecios";
import TableListaDePrecios from "@/components/ventas/lista-de-precios/TableListaDePrecios";
import {
  setDetalleDeListaDePrecios,
  setListaDeClientes,
  setOpenDrawerListaDePrecios,
} from "@/features/ventasSlice";
import FireStoreVentas from "@/firebase/FireStoreVentas";

const page = () => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeListaDePrecios, openDrawerListaDePrecios } = useSelector(
    (state: any) => state.ventas
  );

  const { auth } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarClientes({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeClientes) => {
        dispatch(setListaDeClientes(listaDeClientes));
      });
    }
  }, [auth]);

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <FileTextOutlined style={{ fontSize: "24px" }} />
              </Col>
              <Col>
                <Typography.Title level={4} style={{ marginBottom: "0px" }}>
                  Lista de precios
                </Typography.Title>
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
                dispatch(setOpenDrawerListaDePrecios(true));
                dispatch(setDetalleDeListaDePrecios(null));
              }}
              disabled={false}
            >
              Nueva lista de precios
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={
          detalleDeListaDePrecios?.id
            ? "Editar lista de precios"
            : "Nueva lista de precios"
        }
        width={768}
        destroyOnClose
        onClose={() => dispatch(setOpenDrawerListaDePrecios(false))}
        open={openDrawerListaDePrecios}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeListaDePrecios?.id
              ? "orange"
              : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        <FormListaDePrecios form={form} />
      </Drawer>

      <SearchListaDePrecios />
      <TableListaDePrecios form={form} />
    </div>
  );
};

export default page;
