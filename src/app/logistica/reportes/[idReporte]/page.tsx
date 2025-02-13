"use client";
import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
    const { idReporte }: any = useParams();
    console.log('idReporte', idReporte);

    React.useEffect(() => {
        console.log('useEffect');
    }, []);
  return (
    <div>page</div>
  )
}

export default page