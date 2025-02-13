import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

const onChange = (key: string) => {
  console.log(key);
};

const TabsProveedores = () => {

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Información general',
      // children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Facturas',
      // children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Movimientos',
      // children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: 'Catálogos',
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


export default TabsProveedores;