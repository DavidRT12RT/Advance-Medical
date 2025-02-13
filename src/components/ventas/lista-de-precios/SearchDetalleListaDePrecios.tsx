"use client";
import { Button, Card, Col, Input, Modal, Row } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setArticulosDetalleListaDePrecios, setDetalleDeListaDePrecios, setLoadingTable } from '@/features/ventasSlice';
import FireStoreInventario from '@/firebase/FireStoreInventario';

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchDetalleListaDePrecios = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    refresh,
    detalleDeListaDePrecios
  } = useSelector((state: any) => state.ventas);


  React.useEffect(() => {

    if (auth?.empresa && detalleDeListaDePrecios) {

      let items: any[] = [...(detalleDeListaDePrecios?.articulos || [])];
      if (search) {
        items = (detalleDeListaDePrecios?.articulos || []).filter(({ codigoArticulo, descripcion }: any) => {
          return [
            new RegExp(search, "i").test(codigoArticulo),
            new RegExp(search, "i").test(descripcion),
          ].some((v) => v);
        });
      }

      dispatch(setArticulosDetalleListaDePrecios(items));


    }
  }, [auth, search, refresh, detalleDeListaDePrecios]);



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
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Search size='large' placeholder="Buscar por Código ó Nombre + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        {/* <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <Button onClick={() => {
            showModal();
          }} size='large' block icon={<FilterOutlined />}>
            Filtrar
          </Button>
        </Col> */}

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            // loading
            title="Filtrar articulos"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Modal>
        </Col>
      </Row>
    </Card>
  )
}

export default SearchDetalleListaDePrecios;
