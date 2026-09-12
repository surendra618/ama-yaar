import { Outlet } from 'react-router-dom';
import AdminLogo from '../components/AdminLogo';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <AdminLogo size="xl" />
        </div>
        <div className="rounded-md bg-white p-8 shadow-sm border border-slate-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
