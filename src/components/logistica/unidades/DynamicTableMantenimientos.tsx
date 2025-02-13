"use client";
import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Table, TableProps, Tooltip, Upload } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React from 'react'
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const style: React.CSSProperties = { width: '100%', marginBottom: "0px" };
const styleMB0: React.CSSProperties = { marginBottom: "0px" };


const DynamicTableMantenimientos = ({ form }: any) => {

  const dispatch = useDispatch();

  const [UUIDS, setUUIDS] = React.useState<any[]>([]);

  const [dataSource, setDataSource] = React.useState<any[]>([]);

  // Funciones para agregar y eliminar una fila
  const handleAdd = () => {
    const uuid = uuidv4();
    setUUIDS((oldData: any) => [...oldData, uuid]);
    const newRow = {
      key: uuid,
      fechaDelMantenimiento: '',
      costoDelMantenimiento: '',
      descripcionDelMantenimiento: '',
      comprobanteDelMantenimiento: '',
      fechaSiguienteMantenimiento: '',
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
      title: 'Fecha del mantenimiento',
      dataIndex: 'fechaDelMantenimiento',
      key: 'fechaDelMantenimiento',
      align: 'center',
      width: 125,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['mantenimientos', record.key, 'fechaDelMantenimiento']}
          rules={[{ required: true, message: '' }]}
        >
          <DatePicker
            size="small"
            style={style}
            placeholder="Seleccione fecha del mantenimiento"
            allowClear={true}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Costo',
      dataIndex: 'costoDelMantenimiento',
      key: 'costoDelMantenimiento',
      align: 'center',
      width: 100,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['mantenimientos', record.key, 'costoDelMantenimiento']}
          rules={[{ required: true, message: '' }]}
        >
          <InputNumber
            size="small"
            style={style}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            placeholder="0.00"
          />
        </Form.Item>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcionDelMantenimiento',
      key: 'descripcionDelMantenimiento',
      align: 'center',
      width: 250,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['mantenimientos', record.key, 'descripcionDelMantenimiento']}
          rules={[{ required: true, message: '' }]}
        >
          <Input.TextArea
            size="small"
            style={style}
            rows={2}
            placeholder="Ingrese descripción del mantenimiento"
          />
        </Form.Item>
      ),
    },
    {
      title: 'Comprobante',
      dataIndex: 'comprobanteDelMantenimiento',
      key: 'comprobanteDelMantenimiento',
      align: 'center',
      render: (text: any, record: any, index: any) => {

        return (
          <Form.Item
            style={styleMB0}
            name={['mantenimientos', record.key, 'comprobanteDelMantenimiento']}
            rules={[{ required: true, message: 'Seleccione archivo' }]}
          >
            <Upload
              accept="application/pdf,image/*"
              maxCount={1}
              beforeUpload={(file) => {
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  Swal.fire({
                    title: "Error",
                    text: "El archivo debe ser menor a 5MB",
                    icon: "error",
                    confirmButtonText: "Ok",
                  });
                  return false;
                }
                return true;
              }}
              onChange={({ fileList }) => {
                form.setFieldsValue({
                  mantenimientos: {
                    [record.key]: {
                      comprobanteDelMantenimiento: fileList.length ? fileList : undefined,
                    }
                  }
                });
              }}
            >
              <Button size="small" type="dashed" icon={<UploadOutlined />}>Comprobante</Button>
            </Upload>
          </Form.Item>
        )
      },
    },
    {
      title: 'Siguiente mantenimiento',
      dataIndex: 'fechaSiguienteMantenimiento',
      key: 'fechaSiguienteMantenimiento',
      align: 'center',
      width: 125,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['mantenimientos', record.key, 'fechaSiguienteMantenimiento']}
          rules={[{ required: true, message: '' }]}
        >
          <DatePicker
            size="small"
            style={style}
            placeholder="Seleccione fecha del siguiente mantenimiento"
            allowClear={true}
          />
        </Form.Item>
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
          Lista de mantenimientos {dataSource?.length}
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

export default DynamicTableMantenimientos;