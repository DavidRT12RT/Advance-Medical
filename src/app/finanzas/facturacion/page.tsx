"use client";
import React from "react";

import { Button, Col, Drawer, Form, Row, Space, Typography } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setOpenDrawer,
  setPerfilUsuario,
} from "@/features/recursosHumanosSlice";
import FormFacturacion from "@/components/finanzas/facturacion/FormFacturacion";
import SearchFacturacion from "@/components/finanzas/facturacion/SearchFacturacion";
import TableFacturacion from "@/components/finanzas/facturacion/TableFacturacion";

const { Title } = Typography;

const page = () => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { perfilUsuario, openDrawer } = useSelector(
    (state: any) => state.recursosHumanos
  );

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
                <Title level={4} style={{ marginBottom: "0px" }}>
                  Facturacion
                </Title>
              </Col>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                dispatch(setOpenDrawer(true));
                dispatch(setPerfilUsuario(null));
              }}
              disabled={false}
            >
              Nueva Factura
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title="Nueva Factura"
        width={768}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: perfilUsuario?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        <FormFacturacion form={form} />
      </Drawer>

      <SearchFacturacion />
      <TableFacturacion form={form} />
    </div>
  );
};

export default page;
