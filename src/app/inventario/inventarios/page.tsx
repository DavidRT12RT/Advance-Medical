"use client";
import { Form } from 'antd'
import TableInventarios from '@/components/inventario/inventarios/TableInventarios';
import SearchInventarios from '@/components/inventario/inventarios/SearchInventarios';
import HeaderInventarios from '@/components/inventario/inventarios/HeaderInventarios';


const page = () => {

  const [form] = Form.useForm();

  return (
    <div>
      <HeaderInventarios/>
      <SearchInventarios/>
      <TableInventarios form={form}/>
    </div>
  );
};

export default page;
