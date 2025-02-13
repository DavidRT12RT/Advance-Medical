"use client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import React, { useState, useEffect } from "react";
import { FilterOutlined } from "@ant-design/icons";

const { Search } = Input;

const style: React.CSSProperties = { width: "100%" };

const SearchFacturacion = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search
            size="large"
            placeholder="Buscar"
            allowClear
            // onChange={(e) => handleSearch(e.target.value)}
            style={style}
          />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="filtrar" style={{ width: "100%" }}>
            {/* <Badge
              count={
                selectedStates.length +
                (selectPuesto?.length ? 1 : 0) +
                (selectSucursal.length ? 1 : 0)
              }
            >
            </Badge> */}
            <Button
              onClick={() => setIsModalOpen(true)}
              size="large"
              block
              icon={<FilterOutlined />}
            >
              Filtrar
            </Button>
          </div>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            title="Filtrar Facturas"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form layout="vertical">
              <Form.Item label="Estatus" colon={false}>
                <Checkbox.Group
                  options={["Activo", "Baja"]}
                  // value={selectedStates}
                  // onChange={onChangeEstatus}
                  style={{ display: "flex", flexDirection: "column" }}
                />
              </Form.Item>

              <Form.Item label="Responsable" colon={false}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Seleccione Responsable"
                  // onChange={onChangePuesto}
                  // options={ROLES}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
};

export default SearchFacturacion;
