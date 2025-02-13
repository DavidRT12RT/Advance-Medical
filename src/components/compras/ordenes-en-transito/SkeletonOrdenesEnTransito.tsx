"use client";
import { Divider, Skeleton } from 'antd';
import React from 'react';

const SkeletonOrdenesEnTransito = () => {
  
  return (
    <div style={{ width: "100%" }}>
      {[1, 2, 3, 4, 5, 6, 7].map((value) => (
        <>
          <Skeleton.Input key={value} active size='default' block />
          <Divider style={{ margin: "0.75rem" }} />
        </>
      ))}
    </div>
  )
};

export default SkeletonOrdenesEnTransito;