"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useRef } from 'react'
import { MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setTotalDeLaCompra } from '@/features/finanzasSlice';
import { NumberFormatUSD } from '@/helpers/functions';



const style: React.CSSProperties = { width: '100%', marginBottom: "0px" };
const styleMB0: React.CSSProperties = { marginBottom: "0px" };
/* var UUIDS: any[] = [
  // uuidv4()
]; */

const StaticTableGastos = ({ dataSource, showActions = true }: any) => {

  const dispatch = useDispatch();

  const {
    auth
  } = useSelector((state: any) => state.configuracion);



  const handleDelete = (key: any) => {

    /* const filterUUIDS = UUIDS.filter((uuid: string) => (uuid !== key));
    setUUIDS(filterUUIDS);
    setDataSource((prevDataSource: any) => prevDataSource.filter((item: any) => item.key !== key));

    dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      gastosAdicionales: {
        ...totalDeLaCompra?.gastosAdicionales,
        [key]: { ...totalDeLaCompra?.gastosAdicionales?.[key], subtotal: 0 }
      },
    })); */
  };

  const columns: TableProps<any>['columns'] = [

    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      align: 'center',
      width: 300,
      /*       render: (text: any, record: any, index: any) => (
              <Form.Item
                style={{ ...styleMB0 }}
                name={['gastosAdicionales', record.key, 'descripcion']}
                rules={[{ required: true, message: '' }]}
              >
                <Input.TextArea maxLength={400} size="small" placeholder="Ingrese descripción" style={{ maxWidth: "300px" }} />
              </Form.Item>
            ), */
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
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
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'center',
      render: (text, record, index) => <Typography.Text strong>{NumberFormatUSD(Number(text))}</Typography.Text>
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

export default StaticTableGastos;