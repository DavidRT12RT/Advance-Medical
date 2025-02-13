import { Col, Row, Space, Typography } from 'antd';
import React from "react";
import { FileTextOutlined } from '@ant-design/icons';

const HeaderInventarios = () => {
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
                Inventario
              </Typography.Title>
            </Col>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default HeaderInventarios;
