import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GiveawayHomePage } from './pages/GiveawayHomePage';
import { GiveawayDetailPage } from './pages/GiveawayDetailPage';
import { AuthPage } from './pages/AuthPage';
import { WinnersPage } from './pages/WinnersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AppLayout } from './layouts/AppLayout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/giveaways" replace />} />
          <Route path="/giveaways" element={<GiveawayHomePage />} />
          <Route path="/giveaway/:slug" element={<GiveawayDetailPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/giveaways" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
