import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer compact={isAuthPage} />
    </>
  );
}
