import React from 'react';
import { Steps } from 'antd';
import 'antd/dist/reset.css'; // Importa estilos de Ant Design
/* import './App.css'; // Puedes personalizar tus propios estilos aquí */

const { Step } = Steps;

const CustomSteps = () => (
  <div style={{ width: '100%', padding: '20px', backgroundColor: '#f0f2f5' }}>
    <Steps labelPlacement="vertical" current={1} size="small" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Step 
        title="Step 01" 
        description="Idea and Planning" 
        icon={<img src="/icons/lightbulb.svg" alt="Idea" />} // Reemplaza con el icono que desees
        style={{ padding: '0 20px' }} 
      />
      <Step 
        title="Step 02" 
        description="Execution" 
        icon={<img src="/icons/briefcase.svg" alt="Execution" />} 
        style={{ padding: '0 20px' }} 
      />
      <Step 
        title="Step 03" 
        description="Promotion" 
        icon={<img src="/icons/megaphone.svg" alt="Promotion" />} 
        style={{ padding: '0 20px' }} 
      />
      <Step 
        title="Step 04" 
        description="Launch" 
        icon={<img src="/icons/star.svg" alt="Launch" />} 
        style={{ padding: '0 20px' }} 
      />
    </Steps>
  </div>
);

export default CustomSteps;
