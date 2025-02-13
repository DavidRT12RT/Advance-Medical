import React from "react";
import { Button, Col, Form, Row, Space, Typography } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setOpenDrawerTransferencia } from "@/features/inventarioSlice";

const HeaderTransferencias = () => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Space>
            <Col>
              <FileTextOutlined style={{ fontSize: "24px" }} />
            </Col>
            <Col>
              <Typography.Title level={4} style={{ marginBottom: "0px" }}>
                Transferencias
              </Typography.Title>
            </Col>
          </Space>
        </Col>
        <Col>
          <Button
            color="default"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              dispatch(setOpenDrawerTransferencia(true));
            }}
            disabled={false}
          >
            Nueva transferencia
          </Button>
        </Col>
      </Row>
    </Space>
  );
};

export default HeaderTransferencias;
