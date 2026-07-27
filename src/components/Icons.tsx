type IconProps = { className?: string; title?: string };

export function IconBolt({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path d="M13 2 4 14h7l-1 8 10-14h-7l1-6Z" fill="currentColor" />
    </svg>
  );
}

export function IconStar({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden={!title}>
      {title && <title>{title}</title>}
      <path d="m12 3.2 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.6 7.2 18.1l.9-5.4-3.9-3.8 5.4-.8L12 3.2Z" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function IconPeople({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.5-1a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM3.5 19.5c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5V21H3.5v-1.5Zm11.2 0c0-1.5.5-2.8 1.4-3.8.9.5 1.9.8 3 .8 1.7 0 3.2-.6 4.2-1.6.2.7.3 1.4.3 2.1V21h-8.9v-1.5Z" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 16V10M12 16V7M16 16v-4M20 16v-8" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v1.5H8.5a2.5 2.5 0 0 0 0 5H21V17a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 3h3l1.5 4-2 1.5a12 12 0 0 0 5 5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 5 7.2 2 2 0 0 1 7 3Z" />
    </svg>
  );
}

export function IconMapPin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconIdCard({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2.2" />
      <path d="M14 10.5h4M14 13.5h4" strokeLinecap="round" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3 5 6.5v5.2c0 4.2 2.8 7.9 7 8.8 4.2-.9 7-4.6 7-8.8V6.5L12 3Z" />
      <path d="m9.5 12 1.8 1.8 3.5-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSkills({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14.7 6.3a4 4 0 0 1 0 5.7l-1.4 1.4-5.7-5.7 1.4-1.4a4 4 0 0 1 5.7 0Z" />
      <path d="m11.5 11.5-6.8 6.8a1.5 1.5 0 0 0 2.1 2.1l6.8-6.8" strokeLinecap="round" />
    </svg>
  );
}

const BENEFIT_ICONS = {
  chart: IconChart,
  calendar: IconCalendar,
  wallet: IconWallet,
  star: IconStar,
} as const;

export function BenefitIcon({ name, className }: { name: keyof typeof BENEFIT_ICONS; className?: string }) {
  const Comp = BENEFIT_ICONS[name] ?? IconStar;
  return <Comp className={className} />;
}

const LIVE_ICONS = {
  pin: IconPin,
  star: IconStar,
  people: IconPeople,
} as const;

export function LiveFeedIcon({ name, className }: { name: keyof typeof LIVE_ICONS; className?: string }) {
  const Comp = LIVE_ICONS[name] ?? IconPin;
  return <Comp className={className} />;
}
