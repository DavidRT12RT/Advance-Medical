"use client";
import React from "react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from './firebaseConfig';

export default function Home() {

  const router = useRouter();
  const auth = getAuth(app);
  const [loading, setloading] = React.useState<Boolean>(true);

  React.useEffect(() => {
    if (auth.currentUser) {
      router.push("/recursos-humanos/colaboradores");
    }
    setloading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "white" }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }
}
