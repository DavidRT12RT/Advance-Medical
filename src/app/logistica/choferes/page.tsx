"use client";
import React from "react";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Form, Row, Space, Typography } from "antd";
import TableChoferes from "@/components/logistica/choferes/TableChoferes";
import SearchChoferes from "@/components/logistica/choferes/SearchChoferes";
import { useDispatch, useSelector } from "react-redux";
import {
  setOpenDrawer,
  setPerfilUsuario,
} from "@/features/recursosHumanosSlice";
import FormColaboradores from "@/components/recursos-humanos/colaboradores/FormColaboradores";

const { Title } = Typography;

const page = () => {
  const [form] = Form.useForm();
  const { perfilUsuario, openDrawer } = useSelector(
    (state: any) => state.recursosHumanos
  );
  const dispatch = useDispatch();

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <UserOutlined style={{ fontSize: "24px" }} />
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: "0px" }}>
                  Choferes
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
              Nuevo Chofer
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title={perfilUsuario?.id ? "Editar colaborador" : "Nuevo colaborador"}
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
        <FormColaboradores form={form} />
      </Drawer>
      <SearchChoferes />
      <TableChoferes form={form} />
    </div>
  );
};

export default page;
