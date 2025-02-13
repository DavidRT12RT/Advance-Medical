"use client";
import { Button, Col, Divider, Form, Input, Row, Select, Table, TableProps, Tooltip } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import React, { useRef, useState } from 'react'
import { FileExcelOutlined, SecurityScanOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import FireStoreInventario from '@/firebase/FireStoreInventario';
import { setListaDeArticulos } from '@/features/inventarioSlice';
import { setTotalDeLaVenta } from '@/features/finanzasSlice';
import { message } from 'antd';

const IMPUESTOS = [
  { label: 'IVA (16%)', value: 'IVA (16%)' },
  { label: 'IVA Exento', value: 'IVA Exento' },
  { label: 'Retención de ISR (10%)', value: 'Retención de ISR (10%)' },
  { label: 'IVA (8%)', value: 'IVA (8%)' },
  { label: 'IEPS (8%)', value: 'IEPS (8%)' }
];

interface FirestoreListaPrecio {
  id: string;
  nombreDeLaListaDePrecios: string;
  codigoDeLaListaDePrecios: string;
  eliminado: boolean;
  estatus: boolean;
  clientes: string[];
  articulos: {
    id: string;
    descripcion: string;
    codigoArticulo: string;
    informacionDelArticulo: {
      precioDeVenta: number;
      descuento?: string;
      descuentoMaximo?: string;
      impuestos?: string;
    };
  }[];
}

interface Articulo {
  id: string;
  descripcion: string;
  precio: number;
  descuento?: number;
  descuentoMaximo?: number;
  impuestos?: string[];
}

interface ArticuloDropdown extends Articulo {
  value: string;
  label: string;
}

interface ListaPrecio {
  id: string;
  nombre: string;
  codigo: string;
  eliminado: boolean;
  clientes: string[];
  articulos: Articulo[];
}

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

const DynamicTableVentas = ({ form, clienteId }: { form: any; clienteId?: string | null }) => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);
  const { listaDeArticulos = [] } = useSelector((state: any) => state.inventario);
  const { totalDeLaVenta = {} } = useSelector((state: any) => state.finanzas);
  const [selectedListaPrecio, setSelectedListaPrecio] = useState<string | null>(null);
  const [articulosFiltrados, setArticulosFiltrados] = useState<ArticuloDropdown[]>([]);
  const [UUIDS, setUUIDS] = React.useState<string[]>([]);
  const [dataSource, setDataSource] = React.useState<any[]>([]);
  const [listasDePreciosCliente, setListasDePreciosCliente] = useState<ListaPrecio[]>([]);

  // Cargar las listas de precios cuando cambia el cliente
  React.useEffect(() => {
    const cargarListasDePrecios = async () => {
      console.log('Estado actual:', {
        auth: auth?.empresa?.id,
        clienteId,
        tieneValores: Boolean(auth?.empresa?.id && clienteId)
      });

      if (auth?.empresa?.id && clienteId) {
        try {
          console.log('Intentando cargar listas de precios para:', {
            empresaId: auth.empresa.id,
            clienteId
          });

          // Primero, cargar todas las listas de precios
          const response = await FireStoreInventario.listarListasDePrecios({ 
            idEmpresa: auth.empresa.id 
          });

          console.log('Todas las listas de precios:', response);

          // Asegurarnos que los datos cumplan con la interfaz ListaPrecio
          const listasDePrecios = (response as FirestoreListaPrecio[])
            .filter(lista => {
              console.log('Verificando lista:', {
                listaId: lista.id,
                nombre: lista.nombreDeLaListaDePrecios,
                clientes: lista.clientes,
                clienteId,
                incluyeCliente: lista.clientes?.includes(clienteId)
              });
              return lista.clientes?.includes(clienteId);
            })
            .map(lista => ({
              id: lista.id,
              nombre: lista.nombreDeLaListaDePrecios,
              codigo: lista.codigoDeLaListaDePrecios,
              eliminado: lista.eliminado,
              clientes: lista.clientes || [],
              articulos: lista.articulos?.map(art => ({
                id: art.id,
                descripcion: art.descripcion,
                precio: art.informacionDelArticulo?.precioDeVenta || 0,
                descuento: art.informacionDelArticulo?.descuento ? parseFloat(art.informacionDelArticulo.descuento) : undefined,
                descuentoMaximo: art.informacionDelArticulo?.descuentoMaximo ? parseFloat(art.informacionDelArticulo.descuentoMaximo) : undefined,
                impuestos: art.informacionDelArticulo?.impuestos ? [art.informacionDelArticulo.impuestos] : []
              })) || []
            }));

          console.log('Listas filtradas para el cliente:', listasDePrecios);
          setListasDePreciosCliente(listasDePrecios);

        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error('Error al cargar listas de precios:', error);
          message.error('Error al cargar las listas de precios: ' + errorMessage);
        }
      } else {
        console.log('Limpiando listas porque no hay cliente o empresa');
        setListasDePreciosCliente([]);
        setSelectedListaPrecio(null);
      }
    };

    cargarListasDePrecios();
  }, [auth, clienteId]);

  // Actualizar artículos cuando cambia la lista de precios
  const handleListaPreciosChange = (listaPrecioId: string, key: string) => {
    const listaPrecio = listasDePreciosCliente.find(l => l.id === listaPrecioId);
    if (listaPrecio) {
      const articulosFormateados = listaPrecio.articulos.map((art) => ({
        ...art,
        value: art.id,
        label: art.descripcion
      }));
      setArticulosFiltrados(articulosFormateados);
      
      // Actualizar el dataSource con la nueva lista de precios
      setDataSource(prev => prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            listaPrecioId,
            articuloId: undefined,
            precio: 0,
            cantidad: 1,
            descuento: 0,
            subtotal: 0
          };
        }
        return item;
      }));
    }
  };

  // Efecto para limpiar la tabla cuando cambia el cliente
  React.useEffect(() => {
    console.log('Efecto de limpieza - clienteId:', clienteId);
    
    if (!clienteId) {
      console.log('Limpiando tabla porque no hay cliente');
      setSelectedListaPrecio(null);
      setArticulosFiltrados([]);
      setDataSource([]);
      form.setFieldsValue({ 
        listaPrecio: undefined,
        articulos: undefined 
      });
    }
  }, [clienteId, form]);

  // Calcular subtotal
  const calcularSubtotal = (record: any) => {
    const { cantidad = 0, precio = 0, descuento = 0 } = record;
    return precio * cantidad * (1 - descuento / 100);
  };

  const columns: any = [
    {
      title: 'Lista de Precios',
      dataIndex: 'listaPrecioId',
      key: 'listaPrecioId',
      width: 200,
      render: (_: any, record: any) => (
        <Select
          style={{ width: '100%' }}
          value={record.listaPrecioId}
          onChange={(value) => handleListaPreciosChange(value, record.key)}
          options={listasDePreciosCliente.map(lista => ({
            value: lista.id,
            label: lista.nombre
          }))}
          placeholder="Seleccione una lista"
        />
      )
    },
    {
      title: 'Artículo',
      dataIndex: 'articuloId',
      key: 'articuloId',
      width: 200,
      render: (_: any, record: any) => (
        <Select
          style={{ width: '100%' }}
          value={record.articuloId}
          onChange={(value) => handleArticuloChange(value, record.key)}
          options={articulosFiltrados}
          placeholder="Seleccione un artículo"
          disabled={!record.listaPrecioId}
        />
      )
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 120,
      render: (_: any, record: any) => (
        <Input
          style={style}
          value={record.precio?.toFixed(2)}
          prefix="$"
        />
      )
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 120,
      render: (_: any, record: any) => (
        <Input
          style={style}
          type="number"
          min={1}
          value={record.cantidad}
          onChange={(e) => {
            const newData = [...dataSource];
            const index = newData.findIndex(item => record.key === item.key);
            if (index > -1) {
              const item = newData[index];
              newData[index] = {
                ...item,
                cantidad: parseInt(e.target.value) || 0
              };
              setDataSource(newData);
              actualizarTotales(record.key);
            }
          }}
        />
      )
    },
    {
      title: 'Descuento (%)',
      dataIndex: 'descuento',
      key: 'descuento',
      width: 120,
      render: (_: any, record: any) => (
        <Tooltip title={`Descuento máximo permitido: ${record.descuentoMaximo}%`}>
          <Input
            style={style}
            type="number"
            min={0}
            max={record.descuentoMaximo}
            value={record.descuento}
            onChange={(e) => validarDescuento(record.key, e.target.value)}
          />
        </Tooltip>
      )
    },
    {
      title: 'Impuestos',
      dataIndex: 'impuestos',
      key: 'impuestos',
      width: 200,
      render: (_: any, record: any) => (
        <Select
          style={style}
          mode="multiple"
          placeholder="Seleccione impuestos"
          value={record.impuestos}
          options={IMPUESTOS}
          onChange={(values) => {
            const newData = [...dataSource];
            const index = newData.findIndex(item => record.key === item.key);
            if (index > -1) {
              const item = newData[index];
              newData[index] = {
                ...item,
                impuestos: values
              };
              setDataSource(newData);
              actualizarTotales(record.key);
            }
          }}
        />
      )
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (_: any, record: any) => (
        <Input
          style={style}
          disabled
          value={`$${parseFloat(record.subtotal || 0).toFixed(2)}`}
        />
      )
    },
    {
      title: 'Acciones',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type="link"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => handleDelete(record.key)}
        />
      )
    }
  ];

  // Función para manejar el cambio de artículo
  const handleArticuloChange = (articuloId: string, key: string) => {
    const listaPrecioSeleccionada = listasDePreciosCliente.find(lista => lista.id === dataSource.find(item => item.key === key).listaPrecioId);
    const articulo = listaPrecioSeleccionada?.articulos.find(art => art.id === articuloId);
    
    if (articulo) {
      const newData = [...dataSource];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        newData[index] = {
          ...newData[index],
          articuloId,
          precio: articulo.precio,
          descuento: articulo.descuento || 0,
          descuentoMaximo: articulo.descuentoMaximo || 0,
          impuestos: articulo.impuestos || [],
          cantidad: 1
        };
        setDataSource(newData);
        actualizarTotales(key);
      }
    }
  };

  // Actualizar los totales cuando cambia un artículo
  const actualizarTotales = (key: string) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => key === item.key);
    
    if (index > -1) {
      const item = newData[index];
      const impuestosTotal = (item.impuestos || []).reduce((acc: number, imp: string) => acc + getImpuesto(imp), 0);
      
      const subtotal = calcularSubTotalArticulos(
        item.precio * item.cantidad,
        item.descuento || 0,
        impuestosTotal
      );

      newData[index] = {
        ...item,
        subtotal: subtotal.toFixed(2)
      };
      
      setDataSource(newData);
      
      // Actualizar el total general
      const total = newData.reduce((acc, curr) => acc + parseFloat(curr.subtotal || 0), 0);
      dispatch(setTotalDeLaVenta({ total }));
    }
  };

  // Validar que el descuento no exceda el máximo permitido
  const validarDescuento = (key: string, value: string) => {
    const numericValue = parseFloat(value);
    const record = dataSource.find(item => item.key === key);
    
    if (!record) return;

    const descuentoMaximo = record.descuentoMaximo || 0;
    
    if (isNaN(numericValue) || numericValue < 0) {
      message.error('El descuento debe ser un número positivo');
      return;
    }

    if (numericValue > descuentoMaximo) {
      message.error(`El descuento no puede ser mayor a ${descuentoMaximo}%`);
      return;
    }

    // Actualizar el dataSource con el nuevo descuento
    const newData = [...dataSource];
    const index = newData.findIndex(item => key === item.key);
    if (index > -1) {
      const item = newData[index];
      const subtotal = calcularSubTotalArticulos(
        item.precio * item.cantidad,
        numericValue,
        item.impuestos?.reduce((acc: number, imp: string) => acc + parseFloat(imp.match(/\d+/)?.[0] || '0'), 0) || 0
      );
      
      newData[index] = {
        ...item,
        descuento: numericValue,
        subtotal
      };
      setDataSource(newData);
      
      // Actualizar el total de la venta
      const total = newData.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
      dispatch(setTotalDeLaVenta({ total }));
    }
  };

  // Funciones para agregar y eliminar filas
  const handleAdd = () => {
    const newKey = uuidv4();
    const newRow = {
      key: newKey,
      listaPrecioId: undefined,
      articuloId: undefined,
      precio: 0,
      cantidad: 1,
      descuento: 0,
      subtotal: 0
    };
    setDataSource([...dataSource, newRow]);
    setUUIDS([...UUIDS, newKey]);
  };

  const handleDelete = (key: string) => {
    setUUIDS(prev => prev.filter(uuid => uuid !== key));
    setDataSource(prev => prev.filter(item => item.key !== key));

    dispatch(setTotalDeLaVenta({
      ...totalDeLaVenta,
      articulos: {
        ...totalDeLaVenta.articulos,
        [key]: undefined
      }
    }));
  };

  return (
    <>
      <Table
        size="small"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5px' }}>
        <Button
          type="dashed"
          onClick={handleAdd}
          icon={<PlusOutlined />}
          style={{ color: '#0080ff' }}
          disabled={!clienteId}
        >
          Agregar Artículo
        </Button>
      </div>
    </>
  );
};

export default DynamicTableVentas;