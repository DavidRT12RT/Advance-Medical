"use client";
import React from 'react';

import { Button, Col, Drawer, Form, Row, Space, Typography } from 'antd'
import {
  AimOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux'
import { setDetalleDeCompra, setOpenDrawer } from '@/features/finanzasSlice';
import FormCompras from '@/components/compras/compras/FormCompras';
import SearchCompras from '@/components/compras/compras/SearchCompras';
import TableCompras from '@/components/compras/compras/TableCompras';
import FireStoreVentas from '@/firebase/FireStoreVentas';
import { setListaDeProveedores } from '@/features/ventasSlice';
import SearchOrdenesEnTransito from '@/components/compras/ordenes-en-transito/SearchOrdenesEnTransito';
import TableOrdenesEnTransito from '@/components/compras/ordenes-en-transito/TableOrdenesEnTransito';
import HeaderOrdenesEnTransito from '@/components/compras/ordenes-en-transito/HeaderOrdenesEnTransito';


const { Title } = Typography;

const page = () => {

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { detalleDeCompra, openDrawer } = useSelector((state: any) => state.finanzas);

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreVentas.listarProveedores({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeProveedores) => {
        dispatch(setListaDeProveedores(listaDeProveedores));
      });
    }
  }, [auth]);


  return (
    <div>
      <HeaderOrdenesEnTransito/>
      <SearchOrdenesEnTransito />
      <TableOrdenesEnTransito form={form} />
    </div>
  )
}

export default page