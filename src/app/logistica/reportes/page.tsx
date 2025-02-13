"use client";
import Detalle from '@/components/logistica/reportes/Detalle';
import SearchReportes from '@/components/logistica/reportes/SearchReportes'
import React from 'react'

const page = () => {
  return (
    <div>
        <SearchReportes/>
        <Detalle/>
        </div>
  )
}

export default page