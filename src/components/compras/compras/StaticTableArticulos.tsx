"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useRef } from 'react'
import { FileExcelOutlined, SecurityScanOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import { setListaDeArticulos } from '@/features/inventarioSlice';
import { setTotalDeLaCompra } from '@/features/finanzasSlice';
import { NumberFormatUSD } from '@/helpers/functions';

const IMPUESTOS = [
  { label: 'IVA (16%)', value: 'IVA (16%)' },
  { label: 'IVA Exento', value: 'IVA Exento' },
  { label: 'Retención de ISR (10%)', value: 'Retención de ISR (10%)' },
  { label: 'IVA (8%)', value: 'IVA (8%)' },
  { label: 'IEPS (8%)', value: 'IEPS (8%)' }
];

export function calcularSubTotalArticulos(monto: number, descuentoPorcentaje: number, impuestoPorcentaje: number) {
  // Aplica el descuento
  const montoConDescuento = monto - (monto * descuentoPorcentaje / 100);

  // Calcula el impuesto sobre el monto con descuento
  const impuesto = montoConDescuento * impuestoPorcentaje / 100;

  // Precio final sumando el impuesto
  const precioFinal = montoConDescuento + impuesto;

  return precioFinal;
};


export const getImpuesto = (inpuesto: string) => {
  let valor = 0;
  switch (inpuesto) {
    case 'IVA (16%)':
      valor = 16;
      break;
    case 'Retención de ISR (10%)':
      valor = 10;
      break;
    case 'IVA (8%)':
    case 'IEPS (8%)':
      valor = 8;
      break;
    default:
      valor = 0;
      break;
  }

  return valor;
};


const style: React.CSSProperties = { width: '100%', marginBottom: "0px" };
const styleMB0: React.CSSProperties = { marginBottom: "0px" };
/* var UUIDS: any[] = [
  // uuidv4()
]; */


const StaticTableArticulos = ({ dataSource, showActions = true }: any) => {

  const dispatch = useDispatch();

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    listaDeArticulos = []
  } = useSelector((state: any) => state.inventario);

  const handleDelete = (key: any) => {

    /* const filterUUIDS = UUIDS.filter((uuid: string) => (uuid !== key));
    setUUIDS(filterUUIDS);
    setDataSource((prevDataSource: any) => prevDataSource.filter((item: any) => item.key !== key));

    dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      articulos: {
        ...totalDeLaCompra?.articulos,
        [key]: { ...totalDeLaCompra?.articulos?.[key], subtotal: 0 }
      },
    })); */
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: 'Artículo',
      dataIndex: 'articulo',
      key: 'articulo',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => {
        const findArticulo = listaDeArticulos.find((articulo: any) => {
          return articulo?.id == text;
        })
        return findArticulo ? findArticulo?.descripcion : record?.descripcion || "Desconocido"
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
    },
    {
      title: 'Cantidad Pendiente',
      dataIndex: 'cantidadPendiente',
      key: 'cantidadPendiente',
      align: 'center',
      render: (text: any, record: any) => {
        const cantidadOrdenada = record.cantidad || 0;
        const cantidadRecibida = record.cantidadRecibida || 0;
        return cantidadOrdenada - cantidadRecibida;
      },
    },
    {
      title: 'Precio.U',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      align: 'center',
      render: (text, record, index) => <Typography.Text strong>{NumberFormatUSD(Number(text))}</Typography.Text>
    },
    {
      title: 'Descuento',
      dataIndex: 'descuento',
      key: 'descuento',
      align: 'center',
    },
    {
      title: 'Impuestos',
      dataIndex: 'impuestos',
      key: 'impuestos',
      align: 'center',
      width: 150,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'center',
      render: (text, record, index) => <Typography.Text strong>{NumberFormatUSD(Number(text))}</Typography.Text>
    },
    {
      title: 'Estatus',
      dataIndex: 'estatus',
      key: 'estatus',
      align: 'center',
      render: (text: any, record: any) => {
        if (record.cantidadPendiente > 0) {
          return 'Pendiente';
        } else if (record.enTransito) {
          return 'En tránsito';
        } else if (record.recibido) {
          return 'Recibido';
        } else {
          return 'Incompleto';
        }
      },
    },
    {
      title: '',
      key: 'action',
      render: (_, record, index) => (
        <div style={{ display: !showActions ? "none" : "" }}>
          <Tooltip title="Eliminar">
            <Button size='small' type="dashed" danger shape="circle" icon={<MinusCircleOutlined />} onClick={() => handleDelete(record.key)} />
          </Tooltip>
        </div>
      ),
    },
  ];


  return (
    <div style={{ width: "100%", maxHeight: "50vh", overflowY: "auto", display: Boolean(dataSource.length) ? "block" : "none" }}>
      <Table bordered pagination={false} columns={columns} dataSource={dataSource} scroll={{
        x: 425,
      }} size='small' /* footer={() => <Title level={5} style={{ textAlign: "center" }}><Button type='primary' icon={<PlusCircleOutlined />}>Agregar fila</Button></Title>} */ />
    </div>
  )
}

export default StaticTableArticulos;