import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

const onChange = (key: string) => {
  console.log(key);
};


//TODO [IdCliente] page.tsx 

const TabsArticulos = () => {

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Información general',
      // children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Pedidos',
      // children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Movimientos',
      // children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: 'Compras',
      // children: 'Content of Tab Pane 4',
    },
  ];

  return (
    < Tabs
      defaultActiveKey="1" 
      size='large'
      tabBarGutter={100}
      centered={true}
      items={items}
      onChange={onChange} 
      style={{ paddingRight: '2rem' }}/>
  )

};


export default TabsArticulos;