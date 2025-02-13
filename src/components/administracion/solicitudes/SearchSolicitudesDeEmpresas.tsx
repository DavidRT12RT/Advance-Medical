"use client";
import { Badge, Button, Card, Checkbox, Col, Form, GetProp, Input, Modal, Row, Space, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';

import FireStoreAdministracion from '@/firebase/FireStoreAdministracion';
import { setListaDeEmpresas, setLoadingTable } from '@/features/administracionSlice';
import '../../../app/administracion.css';

const ESTADOS = [
  { label: 'En revisión', value: 'En revisión' },
  { label: 'Aceptado', value: 'Aceptado' },
  { label: 'Rechazado', value: 'Rechazado' },
];


const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchSolicitudesDeEmpresas = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    refresh,
    listaDeEmpresas = []
  } = useSelector((state: any) => state.administracion);

  // HANDLER CHECKBOX
  const [selectedStates, setSelectedStates] = React.useState<any[]>([]);

  const onChange = (checkedValues: any) => {
    setSelectedStates(checkedValues);
  };


  React.useEffect(() => {
    dispatch(setLoadingTable(true));
    FireStoreAdministracion.listarEmpresas({
      search: /* search ??  */""
    }).then(async (listaDeEmpresas) => {

      let items: any[] = [...listaDeEmpresas];

      if (search && selectedStates.length) {
        items = listaDeEmpresas.filter(({ nombreDeLaEmpresa, fechaRegistro, estatus }: any) => {
          return [
            new RegExp(search, "i").test(nombreDeLaEmpresa),
            new RegExp(search, "i").test(fechaRegistro),
            selectedStates.includes(estatus)
          ].some((v) => v);
        });
      } else if (search) {
        items = listaDeEmpresas.filter(({ nombreDeLaEmpresa, fechaRegistro }: any) => {
          return [
            new RegExp(search, "i").test(nombreDeLaEmpresa),
            new RegExp(search, "i").test(fechaRegistro)
          ].some((v) => v);
        });
      } else if (selectedStates.length) {
        items = listaDeEmpresas.filter(({ estatus }: any) => {
          return selectedStates.includes(estatus);
        });
      }

      dispatch(setListaDeEmpresas(items));
      dispatch(setLoadingTable(false));

    });
  }, [search, selectedStates, refresh]);



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
          <Search size='large' placeholder="Buscar por Nombre ó Fecha + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className='filtrar' style={{ width: "100%" }}>
            <Badge count={selectedStates.length}>
              <Button
                onClick={showModal}
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
            // loading
            title="Filtrar solicitudes"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Aplicar"
            cancelText="Cerrar"
            footer={null}>

            <Form
              layout="vertical">
              <Form.Item label={<Typography.Text strong>Estatus</Typography.Text>} colon={false}>
                <Checkbox.Group
                  options={ESTADOS}
                  value={selectedStates}
                  onChange={onChange}
                  style={{ display: 'flex', flexDirection: 'column' }} // Disposición vertical
                />
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchSolicitudesDeEmpresas;

