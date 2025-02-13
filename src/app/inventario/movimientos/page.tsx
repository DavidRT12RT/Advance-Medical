"use client";
import React from "react";
import { TransactionOutlined } from "@ant-design/icons";
import { Col, Row, Space, Typography } from "antd";
import FilterMovimientos from "@/components/inventario/movimientos/FilterMovimientos";
import TableMovimientos from "@/components/inventario/movimientos/TableMovimientos";
import FormDrawerTransferencias from "@/components/inventario/transferencias/FormDrawerTransferencias";

const { Title } = Typography;

const page = () => {
  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space>
              <Col>
                <TransactionOutlined style={{ fontSize: "24px" }} />
              </Col>
              <Col>
                <Title level={4} style={{ marginBottom: "0px" }}>
                  Movimientos
                </Title>
              </Col>
            </Space>
          </Col>
        </Row>
      </Space>
      <FormDrawerTransferencias />
      <FilterMovimientos />
      <TableMovimientos />
    </div>
  );
};

export default page;
