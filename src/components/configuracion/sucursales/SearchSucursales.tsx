"use client";
import { Button, Card, Col, Input, Modal, Row } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined
} from '@ant-design/icons';
import { setListaDeUsuarios } from '@/features/recursosHumanosSlice';
import FireStoreRecursosHumanos from '@/firebase/FireStoreRecursosHumanos';
import FireStoreConfiguracion from '@/firebase/FireStoreConfiguracion';
import { setListaDeSucursales, setLoadingTable } from '@/features/configuracionSlice';

const { Search } = Input;

const style: React.CSSProperties = { width: '100%' };

const SearchSucursales = () => {

  const dispatch = useDispatch();
  const [search, setsearch] = React.useState("");

  const {
    refresh,
    auth
  } = useSelector((state: any) => state.configuracion);

  const fetchFB = React.useRef(true);
  React.useEffect(() => {
    if (auth?.empresa && fetchFB.current) {

      dispatch(setLoadingTable(true));

      FireStoreConfiguracion.listarSucursales({
        idEmpresa: auth?.empresa?.id || ""
      }).then(async (listaDeSucursales) => {

        let items: any[] = [...listaDeSucursales];
        if (search) {
          items = listaDeSucursales.filter(({ nombre }: any) => {
            return [
              new RegExp(search, "i").test(nombre)
            ].some((v) => v);
          });
        }
        dispatch(setListaDeSucursales(items));

        // Listamos usuarios para poblar encargado 
        const listaDeUsuarios = await FireStoreRecursosHumanos.listarUsuarios({
          idEmpresa: !auth?.empresa?.isAdmin ? auth?.empresa?.id : ""
        });
        dispatch(setListaDeUsuarios(listaDeUsuarios));

        const itemsMap = items.map((sucursal: any) => {
          return {
            ...sucursal,
            populateEncargado: listaDeUsuarios.find((usuario: any) => {
              return usuario?.id == sucursal?.encargado;
            })
          }
        });

        dispatch(setListaDeSucursales(itemsMap));
        dispatch(setLoadingTable(false));
        fetchFB.current = false;

        setTimeout(() => {
          fetchFB.current = true;
        }, 10);
      });
    }
  }, [auth, search, refresh]);

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
          <Search size='large' placeholder="Buscar por Nombres de sucursal + ENTER" allowClear onSearch={(value) => {
            setsearch(value);
          }} style={style} />
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={6} xl={6}>
          <Button onClick={() => {
            showModal();
          }} size='large' block icon={<FilterOutlined />}>
            Filtrar
          </Button>
        </Col>

        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <Modal
            loading
            title="Filtrar sucursales"
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

export default SearchSucursales;

