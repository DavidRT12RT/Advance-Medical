"use client";
import React from 'react';
import { store } from './store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import LayoutMain from '@/components/LayoutMain';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { setAuth, setCurrentStep } from '@/features/configuracionSlice';
import { initializeApp } from 'firebase/app';
import { Spin } from 'antd';
import FireStoreAdministracion from '@/firebase/FireStoreAdministracion';

const firebaseConfig = {
  apiKey: "AIzaSyDHsDjymTINN2bcnRtMVop5-qu9wf9CNVU",
  authDomain: "smartroute-ca317.firebaseapp.com",
  projectId: "smartroute-ca317",
  storageBucket: "smartroute-ca317.appspot.com",
  messagingSenderId: "14900432578",
  appId: "1:14900432578:web:32d90f67eecab7bd20f55b",
  measurementId: "G-9Q1LEQSQ2S"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const Auth = ({ children }: any) => {

  const { cerrarSesion } = useSelector((state: any) => state.configuracion);

  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setloading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (userImpl) => {
      try {
        console.log('userImpl', userImpl);
        if (userImpl) {
          const empresa: any = await FireStoreAdministracion.buscarEmpresa(userImpl?.uid);
          console.log('empresa', empresa)
          dispatch(setAuth({ ...JSON.parse(JSON.stringify(userImpl)), empresa }));

          if (!userImpl?.emailVerified && empresa) {
            router.push("/empresas/registrar");
            dispatch(setCurrentStep(2));
          } else if (userImpl?.emailVerified) {
            if (!["Aceptado"].includes(empresa?.estatus)) {
              router.push("/empresas/registrar");
              dispatch(setCurrentStep(3));
            }
          } else if (!empresa) {// Es un usuario de alguna empresa
            const findUsuario: any = await FireStoreAdministracion.buscarUsuarioAuth({ firebaseUID: userImpl?.uid });
            console.log('findUsuario', findUsuario)
            const empresa: any = await FireStoreAdministracion.buscarEmpresa(findUsuario?.idEmpresa);
            console.log('empresa', empresa)
            dispatch(setAuth({ ...JSON.parse(JSON.stringify(userImpl)), empresa: { ...empresa, isAdmin: false }, isEmpresa: false }));
          }
        } else {
          dispatch(setAuth(null));
          // Rutas publicas temporales
          if (!new RegExp("^\/empresas\/registrar").test(pathname) && !new RegExp("^\/contrataciones\/[a-zA-Z0-9]{4,}").test(pathname)) {
            router.replace("/empresas/login");
          }
        }
        setloading(false);
      } catch (error) {
        console.log('error', error)
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: "white" }}>
        <Spin tip="CARGANDO..." size="large" />
      </div>
    );
  }

  return <Spin spinning={cerrarSesion} tip="CERRANDO SESIÓN..." size="large">{children}</Spin>;
};

const ProviderReduxToolkit = ({ children }: any) => {

  const pathname = usePathname();
  const isLogin = (pathname == "/");
  const isPublicRoute = [
    isLogin,
    new RegExp("^\/contrataciones").test(pathname),
    new RegExp("^\/empresas\/registrar").test(pathname),
    new RegExp("^\/empresas\/login").test(pathname),
  ];


  return (
    <Provider store={store}>
      {
        isPublicRoute.some(v => v)
          ? /* new RegExp("^\/empresas\/registrar").test(pathname) ? children : */ <Auth>{children}</Auth>// Auth
          : <Auth><LayoutMain>{children}</LayoutMain></Auth>// Auth
      }
    </Provider>
  );
};

export default ProviderReduxToolkit;