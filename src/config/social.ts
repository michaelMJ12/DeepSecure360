import type { IconName } from '@/components/ui/Icon';

export interface SocialLink {
  name: string;
  href: string;
  icon: IconName;
  /** Hover colour for the button. */
  color: string;
}

/** Replace each href with DeepSecure360's real profile URL. */
export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin', color: '#0a66c2' },
  { name: 'X', href: 'https://x.com/', icon: 'twitter', color: '#475569' },
  { name: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook', color: '#1877f2' },
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram', color: '#e1306c' },
  { name: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube', color: '#ff0033' },
  { name: 'GitHub', href: 'https://github.com/', icon: 'github', color: '#8957e5' },
  { name: 'Telegram', href: 'https://t.me/', icon: 'telegram', color: '#229ed9' },
  { name: 'WhatsApp', href: 'https://wa.me/', icon: 'whatsapp', color: '#25d366' },
];
