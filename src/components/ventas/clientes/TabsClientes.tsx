import React, { useState } from 'react';
import { Tabs, Card, Typography } from 'antd';
import type { TabsProps } from 'antd';

const { Title } = Typography;

interface TabsClientesProps {
  onTabChange?: (key: string) => void;
}

const InformacionGeneral = () => {
  return (
    <Card>
      <Title level={4}></Title>
    </Card>
  );
};

const Pedidos = () => {
  return (
    <Card>
      <Title level={4}></Title>
    </Card>
  );
};

const Movimientos = () => {
  return (
    <Card>
      <Title level={4}></Title>
    </Card>
  );
};

const Compras = () => {
  return (
    <Card>
      <Title level={4}></Title>
    </Card>
  );
};

const TabsClientes: React.FC<TabsClientesProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('1');

  const onChange = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Información general',
      children: <InformacionGeneral />,
    },
    {
      key: '2',
      label: 'Pedidos',
      children: <Pedidos />,
    },
    {
      key: '3',
      label: 'Movimientos',
      children: <Movimientos />,
    },
    {
      key: '4',
      label: 'Compras',
      children: <Compras />,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="1" 
      size='large'
      tabBarGutter={100}
      centered={true}
      items={items}
      onChange={onChange} 
      style={{ paddingRight: '2rem' }}
    />
  );
};

export default TabsClientes;