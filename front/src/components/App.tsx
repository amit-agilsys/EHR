import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "components/loader/Loader";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { privateRoutes, publicRoutes } from "@/routes";
import AuthLayout from "components/AuthLayout";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import PageNotFound from "pages/PageNotFound";

export default function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* public routes */}
          <Route path="/" element={<AuthLayout />}>
            {publicRoutes.map((route) => (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.path}
              />
            ))}
          </Route>
          <Route path="*" element={<PageNotFound />} />
          {/* Private routes */}
          <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
            <Route index element={<Navigate replace to="users" />} />
            {privateRoutes.map((route) => (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.path}
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer transition={Flip} autoClose={2000} />
    </>
  );
}
