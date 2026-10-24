import { NavLink } from 'react-router-dom';
import { NAVIGATION } from '@/config/navigation';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { SocialLinks } from './SocialLinks';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onNavigate }: SidebarProps) {
  return (
    <aside className={cn('sidebar', collapsed && 'is-collapsed', mobileOpen && 'is-open')} aria-label="Main navigation">
      <div className="sidebar-brand">
        <span className="brand-mark"><Icon name="shield" size={20} /></span>
        {!collapsed && <span className="brand-name">DeepSecure<b>360</b></span>}
      </div>
      <nav className="sidebar-nav">
        {NAVIGATION.map((group) => (
          <div key={group.title} className="nav-group">
            {!collapsed && <p className="nav-group-title">{group.title}</p>}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => cn('nav-link', isActive && 'is-active')}
              >
                <Icon name={item.icon} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <SocialLinks collapsed={collapsed} />
    </aside>
  );
}
