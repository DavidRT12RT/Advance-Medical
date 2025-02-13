"use client";
import React from "react";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import { UndoOutlined, SaveOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import {
  setArticuloTemporal,
  setModalInformacionDelArticulo,
  setUpdateArticulo,
} from "@/features/ventasSlice";

const IMPUESTOS = [
  { label: "IVA (16%)", value: "IVA (16%)" },
  { label: "IVA Exento", value: "IVA Exento" },
  { label: "Retención de ISR (10%)", value: "Retención de ISR (10%)" },
  { label: "IVA (8%)", value: "IVA (8%)" },
  { label: "IEPS (8%)", value: "IEPS (8%)" },
];

const style: React.CSSProperties = { width: "100%" };

const FormInformacionDelArticulo = ({ form }: any) => {
  const dispatch = useDispatch();

  const { loading, articuloTemporal, modalInformacionDelArticulo } =
    useSelector((state: any) => state.ventas);

  const refFirstInput = React.useRef<any>(null);
  React.useEffect(() => {
    if (modalInformacionDelArticulo) {
      setTimeout(refFirstInput.current?.focus.bind(), 100);
    } else {
      form.resetFields();
    }
  }, [modalInformacionDelArticulo, form]);

  return (
    <>
      <Form
        form={form}
        name="create-catalog-form"
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={{
          id: "",
          precioDeVenta: 0.0,
          impuestos: "",
          descuento: "",
          descuentoMaximo: "",
        }}
        onFinish={async (values) => {
          if (articuloTemporal) {
            dispatch(
              setArticuloTemporal({
                ...articuloTemporal,
                informacionDelArticulo: values,
              })
            );
            dispatch(setModalInformacionDelArticulo(false));
            // efecto de actualizacion de articulo
            if (values.id === "editar") {
              dispatch(setUpdateArticulo(true));
            }
            form.resetFields();
          }
        }}
      >
        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              style={{ display: "none" }}
              name="id"
              label="Id"
              rules={[{ required: false, message: "Ingrese Id" }]}
            >
              <Input placeholder="Ingrese Id" style={style} />
            </Form.Item>
            <Form.Item
              name="precioDeVenta"
              label="Precio de venta"
              rules={[{ required: true, message: "Ingrese precio de venta" }]}
            >
              <InputNumber<number>
                ref={refFirstInput}
                min={0.01}
                // controls={false}
                style={style}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ""))}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={12} xl={12}>
            <Form.Item
              name="impuestos"
              label="Impuestos"
              rules={[{ required: true, message: "Seleccione impuestos" }]}
            >
              <Select
                options={IMPUESTOS}
                placeholder="Seleccione impuestos"
                style={style}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="descuento" label="Descuento">
              <Input
                placeholder="Ingrese el descuento"
                type="number"
                min={0}
                max={100}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Form.Item name="descuentoMaximo" label="Descuento Máximo">
              <Input
                placeholder="Ingrese el descuento máximo"
                type="number"
                min={0}
                max={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Divider></Divider>
          <Col span={24}>
            <Flex gap="small" style={{ width: "50%", margin: "auto" }}>
              <Button
                loading={loading}
                icon={<UndoOutlined />}
                danger
                type="primary"
                block
                htmlType="reset"
              >
                Limpiar
              </Button>
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                type="primary"
                block
                htmlType="submit"
              >
                Guardar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FormInformacionDelArticulo;
