import type { CSSProperties } from 'react';
import { SOCIAL_LINKS } from '@/config/social';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/** Social media buttons shown at the bottom of the sidebar. */
export function SocialLinks({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('sidebar-social', collapsed && 'is-collapsed')}>
      {!collapsed && <p className="social-title">Follow DeepSecure360</p>}
      <ul className="social-grid">
        {SOCIAL_LINKS.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              style={{ '--brand': s.color } as CSSProperties}
              aria-label={`DeepSecure360 on ${s.name}`}
              title={s.name}
            >
              <Icon name={s.icon} size={17} />
            </a>
          </li>
        ))}
      </ul>
      {!collapsed && <p className="social-copy">© 2026 DeepSecure360</p>}
    </div>
  );
}
