"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useRef } from 'react'
import { FileExcelOutlined, SecurityScanOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import { setListaDeArticulos, setListaDeCatalogos } from '@/features/inventarioSlice';
import { setTotalDeLaCompra } from '@/features/finanzasSlice';
import { NumberFormatUSD } from '@/helpers/functions';


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


const DynamicTableArticulos = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    auth
  } = useSelector((state: any) => state.configuracion);
  const [selectCatalogos, setSelectCatalogos] = React.useState<any>({});


  const {
    listaDeCatalogos = [],
    listaDeArticulos = []
  } = useSelector((state: any) => state.inventario);

  const {
    totalDeLaCompra = {}
  } = useSelector((state: any) => state.finanzas);


  React.useEffect(() => {
    if (auth) {
      FireStoreInventario.listarCatalogos({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeCatalogos) => {
        dispatch(setListaDeCatalogos(listaDeCatalogos));
      });
      FireStoreInventario.listarArticulos({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeArticulos) => {
        dispatch(setListaDeArticulos(listaDeArticulos));
      });
    }
  }, [auth]);

  const CATALOGOS = listaDeCatalogos.map((catalogo: any) => {
    return { ...catalogo, value: catalogo?.id, label: catalogo?.nombreCatalogo };
  });


  const ARTICULOS = listaDeArticulos.map((articulo: any) => {
    return { ...articulo, value: articulo?.id, label: articulo?.descripcion };
  });
  const [UUIDS, setUUIDS] = React.useState<any[]>([]);

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  React.useEffect(() => {
    dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      articulos: dataSource//.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),
    }));
  }, [dataSource])


  // Funciones para agregar y eliminar una fila
  const handleAdd = () => {
    const uuid = uuidv4();
    setUUIDS((oldData: any) => [...oldData, uuid]);
    const newRow = {
      key: uuid,
      articulo: '',
      cantidad: '',
      precioUnitario: '',
      descuento: '',
      subtotal: '',
      impuestos: ''
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
      title: 'Catálogo',
      dataIndex: 'catalogo',
      key: 'catalogo',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'catalogo']}
          rules={[{ required: true, message: '' }]}
        >
          <Select size="small" options={CATALOGOS} onChange={async (idCatalogo) => {
            const findCatalogo = CATALOGOS.find((catalogo: any) => (catalogo?.id == idCatalogo));
            if (findCatalogo) {
              const articulosMap = (findCatalogo?.articulos || []).map((articulo: any) => {
                return { ...articulo, value: articulo?.id, label: articulo?.descripcion };
              });
              setSelectCatalogos((oldData: any) => ({ ...oldData, [record.key]: articulosMap }));

              // actualizamos el estado
              const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {
                return filaTablaArticulos.key == record.key
                  ? {
                    ...filaTablaArticulos,
                    catalogo: idCatalogo,
                  }
                  : filaTablaArticulos;
              });

              setDataSource(dataSourceMap);
            }
          }} placeholder="Seleccione catálogo" style={{ maxWidth: "130px" }} />
        </Form.Item>
      ),
    },
    {
      title: 'Artículo',
      dataIndex: 'articulo',
      key: 'articulo',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => {
        return (
          <Form.Item
            style={styleMB0}
            name={['articulos', record.key, 'articulo']}
            rules={[{ required: true, message: '' }]}
          >
            <Select size="small" options={(selectCatalogos?.[record.key] || [])} onChange={async (idArticulo) => {
              const findArticulo = (selectCatalogos?.[record.key] || []).find((articulo: any) => {
                return (articulo?.id == idArticulo);
              });

              // actualizamos el estado
              const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

                const { impuestos = '', precioUnitario = 0, cantidad = 0, descuento = 0 } = filaTablaArticulos;
                const impuestoPorcentaje = getImpuesto(impuestos);
                const subtotalCalculado = calcularSubTotalArticulos(Number(precioUnitario) * Number(cantidad), descuento, impuestoPorcentaje);

                return filaTablaArticulos.key == record.key
                  ? {
                    ...filaTablaArticulos,
                    articulo: idArticulo,
                    descripcion: findArticulo?.descripcion,
                    precioUnitario: findArticulo?.informacionDelArticulo?.precio,
                    impuestos: findArticulo?.informacionDelArticulo?.impuestos,
                    proveedor: findArticulo?.informacionDelArticulo.proveedor || "",
                    bodega: findArticulo?.informacionDelArticulo.bodega || "",
                    subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                  }
                  : filaTablaArticulos;
              });

              setDataSource(dataSourceMap);

            }} placeholder="Seleccione artículo" style={{ maxWidth: "130px" }} />
          </Form.Item>
        )
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      render: (text: any, record: any, index: any) => {

        return (
          <Form.Item
            style={styleMB0}
            name={['articulos', record.key, 'cantidad']}
            rules={[{ required: true, message: '' }]}
          >
            <Input onChange={(event) => {
              // actualizamos el estado
              const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

                const { impuestos = '', precioUnitario = 0, cantidad = 0, descuento = 0 } = filaTablaArticulos;
                const impuestoPorcentaje = getImpuesto(impuestos);
                const subtotalCalculado = calcularSubTotalArticulos(Number(precioUnitario) * Number(event.target.value), descuento, impuestoPorcentaje);

                return filaTablaArticulos.key == record.key
                  ? {
                    ...filaTablaArticulos,
                    cantidad: event.target.value,
                    subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                  }
                  : filaTablaArticulos;
              });

              setDataSource(dataSourceMap);
            }} size="small" type='number' min={0} placeholder="Ingrese cantidad" />
          </Form.Item>
        )
      },
    },
    {
      title: 'Precio.U',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      align: 'center',
      render: (text: any, record: any, index: any) => (
        <Typography.Text strong>{NumberFormatUSD(Number(text))}</Typography.Text>
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
          name={['articulos', record.key, 'descuento']}
          rules={[{ required: false, message: '' }]}
        >
          <Input onChange={(event) => {
            // actualizamos el estado
            const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

              const { impuestos = '', precioUnitario = 0, cantidad = 0, descuento = 0 } = filaTablaArticulos;
              const impuestoPorcentaje = getImpuesto(impuestos);
              const subtotalCalculado = calcularSubTotalArticulos(Number(precioUnitario) * Number(cantidad), Number(event.target.value), impuestoPorcentaje);

              return filaTablaArticulos.key == record.key
                ? {
                  ...filaTablaArticulos,
                  descuento: event.target.value,
                  subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap);
            /* calcularSubtotal(record.key) */
          }} size="small" type='number' min={0} placeholder="Ingrese descuento" max={70} />
        </Form.Item>
      ),
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
      render: (text: any, record: any, index: any) => (
        <Typography.Text strong>{NumberFormatUSD(Number(text))}</Typography.Text>
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
          Lista de artículos comprados {dataSource?.length}
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

export default DynamicTableArticulos;