import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import { createBrowserRouter, RouterProvider } from "react-router-dom";

// แยกไฟล์ JS ตามหน้า (code splitting) โหลดเมื่อเข้าหน้านั้นจริง
const Home = lazy(() => import('./pages/Home'));
const ReportMember = lazy(() => import('./pages/ReportMember'));
const ReportChangePackage = lazy(() => import('./pages/ReportChangePackage'));
const ReportSumSalePerDay = lazy(() => import('./pages/ReportSumSalePerDay'));
const ReportSumsalePerMonth = lazy(() => import('./pages/ReportSumSalePerMonth'));
const ReportSumsalePerYear = lazy(() => import('./pages/ReportSumSalePerYear'));
const Admin = lazy(() => import('./pages/Admin'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/reportMember",
    element: <ReportMember />,
  },
  {
    path: "/reportChangePackage",
    element: <ReportChangePackage />,
  },
  {
    path: "/reportSumSalePerDay",
    element: <ReportSumSalePerDay />,
  },
  {
    path: "/reportSumSalePerMonth",
    element: <ReportSumsalePerMonth />,
  },
  {
    path: "reportSumSalePerYear",
    element: <ReportSumsalePerYear />,
  },
  {
    path: '/admin',
    element: <Admin />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Suspense fallback={null}>
    <RouterProvider router={router} />
  </Suspense>
);

reportWebVitals();
