"use client";
import { Button, Col, Row, Space, Tooltip, Typography } from "antd";
import React from "react";
import { ArrowLeftOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const HeaderArticulosBodega = () => {

  const router = useRouter();

  const { detalleSucursal } = useSelector((state:any) => state.inventario);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
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
              <FileTextOutlined style={{ fontSize: "24px" }} />
            </Col>
            <Col>
              <Typography.Title level={4} style={{ marginBottom: "0px" }}>
                Articulos ({detalleSucursal?.nombre})
              </Typography.Title>
            </Col>
          </Space>
        </Col>
        <Col>
        </Col>
      </Row>
    </Space>
  );
};

export default HeaderArticulosBodega;
