"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useRef } from 'react'
import { MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setTotalDeLaCompra } from '@/features/finanzasSlice';



const style: React.CSSProperties = { width: '100%', marginBottom: "0px" };
const styleMB0: React.CSSProperties = { marginBottom: "0px" };
/* var UUIDS: any[] = [
  // uuidv4()
]; */

const DynamicTableGastos = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    auth
  } = useSelector((state: any) => state.configuracion);

  const {
    totalDeLaCompra = {}
  } = useSelector((state: any) => state.finanzas);

  const [UUIDS, setUUIDS] = React.useState<any[]>([]);

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  React.useEffect(() => {
    dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      gastosAdicionales: dataSource//.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),
    }));
  }, [dataSource])

console.log('dataSource', dataSource)

  /*  const calcularSubtotal = (key: any) => {
     const gastoAdicional = form.getFieldValue(['gastosAdicionales', key]);
     if (gastoAdicional) {
       const { monto = 0, descuento = 0 } = gastoAdicional;
       const subtotalCalculado = (monto - (monto * descuento / 100));
 
       form.setFieldsValue({
         gastosAdicionales: {
           [key]: {
             ...gastoAdicional,
             subtotal: subtotalCalculado // Redondeamos a dos decimales
           }
         }
       });
 
       dispatch(setTotalDeLaCompra({
         ...totalDeLaCompra,
         gastosAdicionales: {
           ...totalDeLaCompra.gastosAdicionales, [key]: {
             ...gastoAdicional,
             subtotal: subtotalCalculado // Redondeamos a dos decimales
           }
         }
       }));
     }
   } */


  // Funciones para agregar y eliminar una fila
  const handleAdd = () => {
    const uuid = uuidv4();
    setUUIDS((oldData: any) => [...oldData, uuid]);
    // UUIDS.push(uuid);
    const newRow = {
      key: uuid,
      descripcion: '',
      monto: '',
      descuento: '',
      subtotal: '',
    };
    setDataSource((prevDataSource: any) => [...prevDataSource, newRow]);
  };

  const handleDelete = (key: any) => {

    const filterUUIDS = UUIDS.filter((uuid: string) => (uuid !== key));
    setUUIDS(filterUUIDS);
    setDataSource((prevDataSource: any) => prevDataSource.filter((item: any) => item.key !== key));

  };

  const columns: TableProps<any>['columns'] = [

    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      align: 'center',
      width: 300,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={{ ...styleMB0 }}
          name={['gastosAdicionales', record.key, 'descripcion']}
          rules={[{ required: true, message: '' }]}
        >
          <Input.TextArea onChange={(event) => {
            // actualizamos el estado
            const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {
              return filaTablaArticulos.key == record.key
                ? {
                  ...filaTablaArticulos,
                  descripcion: event.target.value
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap);
          }} maxLength={400} size="small" placeholder="Ingrese descripción" style={{ maxWidth: "300px" }} />
        </Form.Item>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      align: 'center',
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['gastosAdicionales', record.key, 'monto']}
          rules={[{ required: true, message: '' }]}
        >
          <Input onChange={(event) => {
            // actualizamos el estado
            const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

              const { monto = 0, descuento = 0 } = filaTablaArticulos;

              const subtotalCalculado = (Number(event.target.value) - (Number(event.target.value) * descuento / 100));
              return filaTablaArticulos.key == record.key
                ? {
                  ...filaTablaArticulos,
                  monto: event.target.value,
                  subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap);
          }} size="small" type='number' min={0} placeholder="Ingrese monto" />
        </Form.Item>
      ),
    },
    {
      title: 'Descuento',
      dataIndex: 'descuento',
      key: 'descuento',
      align: 'center',
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['gastosAdicionales', record.key, 'descuento']}
          rules={[{ required: false, message: '' }]}
        >
          <Input onChange={(event) => {
            // actualizamos el estado
            const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

              const { monto = 0, descuento = 0 } = filaTablaArticulos;

              const subtotalCalculado = (Number(monto) - (Number(monto) * Number(event.target.value) / 100));
              return filaTablaArticulos.key == record.key
                ? {
                  ...filaTablaArticulos,
                  descuento: event.target.value,
                  subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap);
          }} size="small" type='number' min={0} placeholder="Ingrese descuento" max={70} />
        </Form.Item>
      ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'center',
      render: (text: any, record: any, index: any) => (
        <Typography.Text strong>{Number(text).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</Typography.Text>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_, record, index) => (
        <Tooltip title="Eliminar">
          <Button size='small' type="dashed" danger shape="circle" icon={<MinusCircleOutlined />} onClick={() => handleDelete(record.key)} />
        </Tooltip>
      ),
    },
  ];


  return (
    <>
      <Row gutter={4} style={style}>
        <Divider>
          Lista de gastos Adicionales {dataSource?.length}
        </Divider>
        <Col className="gutter-row" xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{ width: "100%", maxHeight: "50vh", overflowY: "auto", display: Boolean(UUIDS.length) ? "block" : "none" }}>
            <Table bordered pagination={false} columns={columns} dataSource={dataSource} scroll={{
              x: 425,
            }} size='small' /* footer={() => <Title level={5} style={{ textAlign: "center" }}><Button type='primary' icon={<PlusCircleOutlined />}>Agregar fila</Button></Title>} */ />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <div style={{ ...style, textAlign: "center", marginTop: "1rem" }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => {
              handleAdd();
            }}>
              Agregar Fila
            </Button>
          </div>
        </Col>
        <Divider />
      </Row>
    </>
  )
}

export default DynamicTableGastos;