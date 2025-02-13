"use client";
import React from "react";
import { Button, Col, Drawer, Form, Row, Space, Typography } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import {
  setDetalleDeCompra,
  setDetalleDeVenta,
  setOpenDrawer,
  setTotalDeLaCompra,
} from "@/features/finanzasSlice";
import FireStoreVentas from "@/firebase/FireStoreVentas";
import {
  setListaDeClientes,
  setListaDeProveedores,
} from "@/features/ventasSlice";
import FormCXC from "@/components/finanzas/cuentas-por-cobrar/FormCXC";
import SearchCXC from "@/components/finanzas/cuentas-por-cobrar/SearchCXC";
import TableCXC from "@/components/finanzas/cuentas-por-cobrar/TableCXC";

const { Title } = Typography;

const page = () => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeVenta, openDrawer, idNuevoProveedor } = useSelector(
    (state: any) => state.finanzas
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

  // LISTA DE PROVEEDORES
  React.useEffect(() => {
    if (auth?.empresa || (auth?.empresa && idNuevoProveedor)) {
      FireStoreVentas.listarProveedores({
        idEmpresa: auth?.empresa?.id || "",
      }).then((listaDeProveedores) => {
        dispatch(setListaDeProveedores(listaDeProveedores));
      });
    }
  }, [auth, idNuevoProveedor]);

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
                  Cuentas por Cobrar
                </Title>
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
                dispatch(setOpenDrawer(true));
                dispatch(setDetalleDeVenta(null));
                dispatch(setTotalDeLaCompra({}));
                dispatch(setDetalleDeCompra(null));
              }}
              disabled={false}
            >
              Nueva cuenta por Cobrar
            </Button>
          </Col>
        </Row>
      </Space>
      {/* Drawer es el modal del formulario nuevo Proveedor */}
      <Drawer
        title={
          detalleDeVenta?.id
            ? "Editar cuenta por pagar"
            : "Nueva cuenta por pagar"
        }
        width={868}
        onClose={() => dispatch(setOpenDrawer(false))}
        open={openDrawer}
        styles={{
          body: {
            paddingBottom: 80,
          },
          header: {
            borderColor: detalleDeVenta?.id ? "orange" : "rgba(5, 5, 5, 0.06)",
          },
        }}
      >
        {openDrawer && <FormCXC form={form} />}
      </Drawer>

      <SearchCXC />
      <TableCXC form={form} />
    </div>
  );
};

export default page;
