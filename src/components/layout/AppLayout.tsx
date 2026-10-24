import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    if (window.matchMedia('(max-width: 900px)').matches) setMobileOpen((o) => !o);
    else setCollapsed((c) => !c);
  };

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <Topbar onToggleMenu={toggle} />
        <main className="app-content">
          <Suspense fallback={<div className="page-loading"><Spinner size={28} /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
