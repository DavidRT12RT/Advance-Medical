"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React from 'react'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import { setListaDeArticulos } from '@/features/inventarioSlice';
import { setTotalDeLaCompra } from '@/features/finanzasSlice';
import { setListaDeProveedoresFormArticulos } from '@/features/comprasSlice';

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


const DynamicTableCompras = ({ form }: any) => {

  const dispatch = useDispatch();

  const {
    auth,
    listaDeSucursales = []
  } = useSelector((state: any) => state.configuracion);

  const {
    listaDeArticulos = []
  } = useSelector((state: any) => state.inventario);

  const {
    totalDeLaCompra = {}
  } = useSelector((state: any) => state.finanzas);

  const {
    listaDeProveedores = []
  } = useSelector((state: any) => state.ventas);

  const {
    listaDeProveedoresFormArticulos = []
  } = useSelector((state: any) => state.compras);

  const PROVEEDORES = listaDeProveedoresFormArticulos.map((proveedor: any) => {
    return { ...proveedor, label: proveedor?.nombreProveedor, value: proveedor?.id };
  });
  const BODEGAS = listaDeSucursales.map((sucursal: any) => {
    return { ...sucursal, label: sucursal?.nombre, value: sucursal?.id };
  });


  React.useEffect(() => {
    if (auth?.empresa) {
      FireStoreInventario.listarArticulos({
        idEmpresa: auth?.empresa?.id || ""
      }).then((listaDeArticulos) => {
        dispatch(setListaDeArticulos(listaDeArticulos));
        let idsProveedores = listaDeArticulos.reduce((acc: any[], articulo: any) => [...acc, ...(articulo?.provedoresArticulo || [])], []);
        idsProveedores = Array.from(new Set(idsProveedores));
        dispatch(setListaDeProveedoresFormArticulos(listaDeProveedores.filter((proveedor: any) => idsProveedores.includes(proveedor?.id))));
      })
    }
  }, [auth]);

  const ARTICULOS = listaDeArticulos.map((articulo: any) => {
    return { ...articulo, value: articulo?.id, label: articulo?.descripcion };
  });
  const [UUIDS, setUUIDS] = React.useState<any[]>([]);

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  React.useEffect(() => {
    /* dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      articulos: dataSource//.reduce((a: any, cv: any) => (a + (cv.subtotal ? Number(cv.subtotal) : 0)), 0),
    })); */
  }, [dataSource])

  const calcularSubtotal = (key: any) => {
    const articulo = form.getFieldValue(['articulos', key]);
    console.log('articulo :>> ', articulo);
    if (articulo) {
      const { cantidad = 0, precioUnitario = 0, descuento = 0, impuestos = '' } = articulo;
      const impuestoPorcentaje = getImpuesto(impuestos);
      const subtotalCalculado = calcularSubTotalArticulos(precioUnitario * cantidad, descuento, impuestoPorcentaje);

      form.setFieldsValue({
        articulos: {
          [key]: {
            ...articulo,
            subtotal: subtotalCalculado // Redondeamos a dos decimales
          }
        }
      });
      console.log('totalDeLaCompra :>> ', totalDeLaCompra);

      const articulosMap = [...(totalDeLaCompra?.articulos || [])];
      const findIndexArticulo = articulosMap.findIndex((articulo: any) => articulo.key === key);
      if (findIndexArticulo !== -1) {
        articulosMap[findIndexArticulo] = {
          key,
          ...articulo,
          subtotal: subtotalCalculado // Redondeamos a dos decimales
        };
      } else {
        articulosMap.push({
          key,
          ...articulo,
          subtotal: subtotalCalculado // Redondeamos a dos decimales
        });
      }


      dispatch(setTotalDeLaCompra({
        ...totalDeLaCompra,
        articulos: articulosMap
      }));
    }
  };


  // Funciones para agregar y eliminar una fila
  const handleAdd = () => {
    const uuid = uuidv4();
    setUUIDS((oldData: any) => [...oldData, uuid]);
    const newRow = {
      key: uuid,
      proveedor: '',
      bodega: '',
      articulo: '',
      cantidad: '',
      premioUnitario: '',
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

    dispatch(setTotalDeLaCompra({
      ...totalDeLaCompra,
      articulos: totalDeLaCompra?.articulos?.filter((articulo: any) => articulo.key !== key)
    }));
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: 'Proveedor',
      dataIndex: 'proveedor',
      key: 'proveedor',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'proveedor']}
          rules={[{ required: true, message: '' }]}
        >
          <Select size="small" options={PROVEEDORES} placeholder="Seleccione proveedor" style={{ maxWidth: "120px" }} dropdownStyle={ {width: "200px"}} />
        </Form.Item>
      ),
    },
    {
      title: 'Bodega',
      dataIndex: 'bodega',
      key: 'bodega',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'bodega']}
          rules={[{ required: true, message: '' }]}
        >
          <Select size="small" options={BODEGAS} placeholder="Seleccione bodega" style={{ maxWidth: "120px" }} dropdownStyle={ {width: "150px"}}/>
        </Form.Item>
      ),
    },
    {
      title: 'Artículo',
      dataIndex: 'articulo',
      key: 'articulo',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'articulo']}
          rules={[{ required: true, message: '' }]}
        >
          <Select size="small" options={ARTICULOS} onChange={async (idArticulo) => {
            console.log('idArticulo', idArticulo)
            const findArticulo = (listaDeArticulos || []).find((articulo: any) => {
              return (articulo?.id == idArticulo);
            });
            console.log('findArticulo', findArticulo)
            // actualizamos el estado
            /* const dataSourceMap = dataSource.map((filaTablaArticulos: any) => {

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
                  proveedor: findArticulo?.informacionDelArticulo?.proveedor || "",
                  bodega: findArticulo?.informacionDelArticulo?.bodega || "",
                  subtotal: Number.isInteger(subtotalCalculado) ? subtotalCalculado : subtotalCalculado.toFixed(3)
                }
                : filaTablaArticulos;
            });

            setDataSource(dataSourceMap); */

          }} placeholder="Seleccione artículo" style={{ maxWidth: "120px" }} dropdownStyle={{ width: "300px", overflowY: "auto" }} />
        </Form.Item>
      ),
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
            <Input onChange={() => calcularSubtotal(record.key)} size="small" type='number' placeholder="Ingrese cantidad" min={0} />
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
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'precioUnitario']}
          rules={[{ required: true, message: '' }]}
        >
          <Input onChange={() => calcularSubtotal(record.key)} size="small" type='number' placeholder="Ingrese precio unitario" min={0} />
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
          name={['articulos', record.key, 'descuento']}
          rules={[{ required: false, message: '' }]}
        >
          <Input onChange={() => calcularSubtotal(record.key)} size="small" type='number' placeholder="Ingrese descuento" min={0} max={100} />
        </Form.Item>
      ),
    },
    {
      title: 'Impuestos',
      dataIndex: 'impuestos',
      key: 'impuestos',
      align: 'center',
      width: 150,
      render: (text: any, record: any, index: any) => (
        <Form.Item
          style={styleMB0}
          name={['articulos', record.key, 'impuestos']}
          rules={[{ required: true, message: '' }]}
        >
          <Select onChange={() => calcularSubtotal(record.key)} size="small" options={IMPUESTOS} placeholder="Seleccione impuestos" style={{ maxWidth: "120px" }} />
        </Form.Item>
      ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'center',
      render: (text: any, record: any, index: any) => {
        return (
          <Form.Item
            style={styleMB0}
            name={['articulos', record.key, 'subtotal']}
            rules={[{ required: true, message: '' }]}
          >
            <Input disabled size="small" placeholder="Ingrese subtotal" max={70} />
          </Form.Item>
        )
      },
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

export default DynamicTableCompras;