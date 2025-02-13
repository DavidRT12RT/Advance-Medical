"use client";
import React from 'react';
import { Drawer, Space, Button, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenDrawerUnidad } from '@/features/finanzasSlice';
import FormUnidades from './FormUnidades';

const DrawerUnidades = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { openDrawerUnidad, detalleDeUnidad } = useSelector((state: any) => state.finanzas);

  return (
    <Drawer
      title={detalleDeUnidad ? "Editar Unidad" : "Nueva Unidad"}
      width={720}
      onClose={() => {
        dispatch(setOpenDrawerUnidad(false));
        form.resetFields();
      }}
      open={openDrawerUnidad}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
    >
      <FormUnidades form={form} />
    </Drawer>
  );
};

export default DrawerUnidades;
