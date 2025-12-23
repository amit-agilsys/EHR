import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f4]">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 w-2/5">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold text-gray-600 ml-2">
              EHR Reports
            </h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
