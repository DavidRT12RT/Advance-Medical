"use client";
import { Badge, Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeUsuarios, setLoadingTable } from '@/features/recursosHumanosSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import { ESTATUS_ACTUAL, ROLES } from '../colaboradores/FormColaboradores';
import "../../../app/finanzas.css";

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchColaboradoresNominas = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth,
    listaDeSucursales = []
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh,
  } = useSelector((state: any) => state.recursosHumanos);

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);
  const onChangeEstatus = (values: any) => {
    setSelectedStates(values);
  };

  // HANDLER SELECT
  const [selectPuesto, setSelectPuesto] = React.useState<any[]>([]);
  const onChangePuesto = (value: any) => {
    setSelectPuesto(value);
  };

  const [selectSucursal, setSelectSucursal] = React.useState<any[]>([]);
  const onChangeSucursal = (value: any) => {
    setSelectSucursal(value);
  };

  React.useEffect(() => {
    if (auth?.empresa) {
      dispatch(setLoadingTable(true));
      FireStoreRecursosHumanos.listarUsuarios({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeColaboradores) => {

        let items: any[] = [...listaDeColaboradores];
        if (search && selectedStates.length) {
          items = listaDeColaboradores.filter(
            ({ nombres, apellidos, estatusActual }: any) => {
              return [
                new RegExp(search, "i").test(nombres),
                new RegExp(search, "i").test(apellidos),
                selectedStates.includes(estatusActual),
              ].some((v) => v);
            }
          );
        } else if (search) {
          items = listaDeColaboradores.filter(({ nombres, apellidos }: any) => {
            return [
              new RegExp(search, "i").test(nombres),
              new RegExp(search, "i").test(apellidos)
            ].some((v) => v);
          });
        } else if (selectedStates.length) {
          items = listaDeColaboradores.filter(({ estatusActual }: any) => {
            return selectedStates.includes(estatusActual);
          });
        } else if (selectPuesto.length) {
          items = listaDeColaboradores.filter(({ puesto }: any) => {
            return selectPuesto.includes(puesto);
          });
        } else if (selectSucursal.length) {
          items = listaDeColaboradores.filter(({ sucursal }: any) => {
            return selectSucursal.includes(sucursal);
          });
        }

        dispatch(setListaDeUsuarios(items));
        dispatch(setLoadingTable(false));

      });
    }
  }, [auth, search, selectPuesto, selectedStates, selectSucursal, refresh]);

  const SUCURSALES = listaDeSucursales.map((sucursal: any) => ({
    ...sucursal,
    label: sucursal?.nombre,
    value: sucursal?.id,
  }));

  // HANDLER MODAL
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  return (
    <Card style={{ width: "100%", margin: "1rem 0rem" }}>
      <Row gutter={12} style={style}>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={18} xl={18}>
          <Search size='large' placeholder="Buscar por Nombres + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="filtrar" style={{ width: "100%" }}>
            <Badge count={selectedStates.length + (selectPuesto?.length ? 1 : 0) + (selectSucursal.length ? 1 : 0)}>
              <Button
                onClick={() => {
                  showModal();
                }}
                size="large"
                block
                icon={<FilterOutlined />}
              >
                Filtrar
              </Button>
            </Badge>
          </div>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            title="Filtrar colaboradores"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}>
            <Form layout="vertical">
              <Form.Item
                label={<Typography.Text strong>Estatus</Typography.Text>}
                colon={false}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <Checkbox.Group
                    options={ESTATUS_ACTUAL}
                    value={selectedStates}
                    onChange={onChangeEstatus}
                    style={{ display: "flex", flexDirection: "column" }}
                  />
                </div>
              </Form.Item>

              <Form.Item
                label={<Typography.Text strong>Rol</Typography.Text>}
                colon={false}
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={style}
                  placeholder="Seleccione rol"
                  // defaultValue={[]}
                  onChange={onChangePuesto}
                  options={ROLES}
                />
              </Form.Item>

              <Form.Item
                label={<Typography.Text strong>Sucursal</Typography.Text>}
                colon={false}
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={style}
                  placeholder="Seleccione sucursal"
                  // defaultValue={[]}
                  onChange={onChangeSucursal}
                  options={SUCURSALES}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchColaboradoresNominas;

