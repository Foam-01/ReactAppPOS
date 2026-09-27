import React, { lazy, Suspense } from 'react';
import Loading from './components/Loading';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import config from './config';
import Package from './pages/Package';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import Login from './pages/Login';
// แยกไฟล์ JS ตามหน้า (code splitting) โหลดเมื่อเข้าหน้านั้นจริง
const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const User = lazy(() => import('./pages/User'));
const Sale = lazy(() => import('./pages/Sale'));
const BillSales = lazy(() => import('./pages/BillSales'));
const SumSalePerDay = lazy(() => import('./pages/SumSalePerDay'));
const Stock = lazy(() => import('./pages/Stock'));
const ReportStock = lazy(() => import('./pages/ReportStock'));

  const router = createBrowserRouter([
    {
        path: "/",
        element: <Package />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
      path: '/home',
      element: <Home />
    },
    {
      path: '/product',
      element: <Product />
    },
    {
      path: '/user',
      element: <User />
    },
    {
      path: '/sale',
      element: <Sale />
    },
    {
      path: '/billSales',
      element: <BillSales />
    },
    {
      path: '/sumSalePerDay',
      element: <SumSalePerDay />
    },
    {
      path: '/stock' ,
      element: <Stock />
    },
    {
      path: '/ReportStock' ,
      element: <ReportStock />
    }
    
  ]);


// token หมดอายุหรือไม่ถูกต้อง: ล้าง token แล้วพาไปหน้าเข้าสู่ระบบ
// คืน promise ที่ไม่ resolve เพื่อไม่ให้แต่ละหน้าแสดง popup error ซ้ำ
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const isSignIn = (err.config?.url || '').includes('/signin');
    if (err.response?.status === 401 && !isSignIn) {
      if (localStorage.getItem(config.token_name)) {
        localStorage.removeItem(config.token_name);
        sessionStorage.setItem('pos_session_expired', '1');
      }
      if (window.location.pathname !== '/login') {
        router.navigate('/login', { replace: true });
      }
      return new Promise(() => {});
    }
    return Promise.reject(err);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  
);


reportWebVitals();
