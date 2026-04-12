import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import Package from './pages/Package';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

import Login from './pages/Login';
import Home from './pages/Home';
import Product from './pages/Product';
import User from './pages/User';
import Sale from './pages/Sale';
import BillSales from './pages/BillSales';
import SumSalePerDay from './pages/SumSalePerDay';
import Stock from './pages/Stock';
import ReportStock from './pages/ReportStock';

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


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <RouterProvider router={router} />
  
);


reportWebVitals();
