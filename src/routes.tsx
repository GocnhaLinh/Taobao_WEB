import React, { Suspense, lazy } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';
import { PageLoader } from './components/common/PageLoader';

// Lazy loading pages for optimal performance and smooth transition
const OverviewPage = lazy(() => import('./pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const BrandsPage = lazy(() => import('./pages/BrandsPage').then(m => ({ default: m.BrandsPage })));
const WarehousesPage = lazy(() => import('./pages/WarehousesPage').then(m => ({ default: m.WarehousesPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const CouponsPage = lazy(() => import('./pages/CouponsPage').then(m => ({ default: m.CouponsPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

export const routeConfig: RouteObject[] = [
  { path: '/', element: <OverviewPage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/categories', element: <CategoriesPage /> },
  { path: '/brands', element: <BrandsPage /> },
  { path: '/warehouses', element: <WarehousesPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/users', element: <UsersPage /> },
  { path: '/coupons', element: <CouponsPage /> },
  { path: '/reviews', element: <ReviewsPage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export const AppRoutes: React.FC = () => {
  const element = useRoutes(routeConfig);
  return (
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  );
};
