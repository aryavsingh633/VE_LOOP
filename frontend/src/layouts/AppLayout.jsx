import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-150px',
          left: '5%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '30%',
          right: '-100px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(70px)',
        }}
      />
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer compact={isAuthPage} />
    </div>
  );
}
