"use client";
import { setDetalleDeCompra } from '@/features/finanzasSlice';
import FireStoreFinanzas from '@/firebase/FireStoreFinanzas';
import { Button, Result } from 'antd';
import { useParams } from 'next/navigation';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const page = () => {

  const dispatch = useDispatch();
  const { auth } = useSelector((state: any) => state.configuracion);

  const {
    detalleDeCompra,
  } = useSelector((state: any) => state.finanzas);
  console.log('detalleDeCompra', detalleDeCompra)

  const { idCompra }: any = useParams();
  React.useEffect(() => {
    if (idCompra) {
      (async () => {
        const compra: any = await FireStoreFinanzas.buscarCompra(auth?.empresa?.id, idCompra);
        const proveedores = (compra?.articulos || []).map((articulo: any) => {
          return articulo?.proveedor;
        });

        const proveedoresUnicos = new Set(proveedores);
        const proveedoresUnicosArray: any[] = Array.from(proveedoresUnicos);

        let proveedoresResponse = await FireStoreFinanzas.listarProveedoresDeLaCompra(auth?.empresa?.id, proveedoresUnicosArray);
        proveedoresResponse = proveedoresResponse.map((proveedor: any) => {
          return { ...proveedor, articulos: compra?.articulos?.filter((articulo: any) => articulo?.proveedor == proveedor?.id) };
        });

        dispatch(setDetalleDeCompra({ ...compra, proveedorPopulate: proveedoresResponse }));
      })();
    }
  }, [idCompra]);

  return (
    <Result
      status="info"
      title="Confirmar Orden de Compra"
      subTitle="¿Desea aprobar o rechazar esta orden de compra?"
      extra={[
        <Button type="primary" key="approve">
          Aprobar Orden
        </Button>,
        <Button danger key="reject">
          Rechazar Orden
        </Button>,
      ]}
    >
      <div>
        <h3>Detalles de la Orden</h3>
        <p><strong>Número de Orden:</strong> {detalleDeCompra?.codigoCompra || ""}</p>
        {/* <p><strong>Solicitante:</strong> {detalleDeCompra?.sdfsdf || ""}</p> */}
        <p><strong>Fecha:</strong> {detalleDeCompra?.fechaRegistroDoc || ""}</p>
        <p><strong>Monto Total:</strong> {Number(detalleDeCompra?.totalDeLaCompra).toLocaleString('en-US')}</p>
      </div>
    </Result>
  )
}

export default page