"use client";
import React from "react";
import Swal from "sweetalert2";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Tooltip,
  Drawer,
  Space,
} from "antd";
import {
  FileImageOutlined,
  UndoOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const style: React.CSSProperties = { width: "100%" };

const FormFacturacion = () => {
  return (
    <Form
      // form={form}
      name="login-form"
      layout="vertical"
      style={{ width: "100%" }}
    >
      <Row gutter={12}>
        <Divider orientation="left">Información general</Divider>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          {/* start input hidden */}
          <Form.Item
            style={{ display: "none" }}
            name="id"
            label="Id"
            rules={[{ required: false, message: "Ingrese Id" }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
          <Form.Item
            style={{ display: "none" }}
            name="firebaseUID"
            label="Firebase UID"
            rules={[{ required: false, message: "Ingrese Firebase UID" }]}
          >
            <Input placeholder="Ingrese Firebase UID" style={style} />
          </Form.Item>

          <Form.Item
            style={{ display: "none" }}
            name="photoURL"
            label="Firebase photoURL"
            rules={[{ required: false, message: "Ingrese Firebase UID" }]}
          >
            <Input placeholder="Ingrese Firebase photoURL" style={style} />
          </Form.Item>
          {/* end input hidden */}
          <Form.Item
            name="nombres"
            label="Nombres"
            rules={[{ required: true, message: "Ingrese Nombres" }]}
          >
            <Input placeholder="Ingrese Nombres" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="apellidos"
            label="Apellidos"
            rules={[{ required: true, message: "Ingrese Apellidos" }]}
          >
            <Input placeholder="Ingrese Apellidos" style={style} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: "Ingrese Teléfono" }]}
          >
            <Input placeholder="Ingrese Teléfono" style={style} />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: "Ingrese Correo electrónico" },
              { type: "email", message: "Ingrese Correo electrónico válido" },
            ]}
          >
            <Input placeholder="Ingrese Correo electrónico" style={style} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: true, message: "Ingrese Dirección" }]}
          >
            <Input
              showCount
              maxLength={200}
              placeholder="Ingrese Dirección"
              style={style}
            />
          </Form.Item>
        </Col>

        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="fechaNacimiento"
            label="Fecha de nacimiento"
            rules={[
              { required: true, message: "Seleccione Fecha de nacimiento" },
            ]}
          >
            <DatePicker
              onChange={(date, dateString: any) => {}}
              style={style}
              placeholder="Seleccione Fecha de nacimiento"
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="genero"
            label="Género"
            rules={[{ required: true, message: "Seleccione Género" }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Género"
              optionFilterProp="label"
              onChange={() => {}}
              onSearch={() => {}}
              // options={GENEROS}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Form.Item
            name="estadoCivil"
            label="Estado civil"
            rules={[{ required: true, message: "Seleccione Estado civil" }]}
          >
            <Select
              style={style}
              placeholder="Seleccione Estado civil"
              optionFilterProp="label"
              onChange={() => {}}
              onSearch={() => {}}
              // options={ESTADOS_CIVIL}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default Form;
