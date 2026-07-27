export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  minutes: number;
  publishedAt: string;
  author: string;
  image: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-wallet-holds-protect-you",
    title: "How TrustiFix wallet holds protect every booking",
    excerpt:
      "Money is locked when you book and only released when the job is done — here’s the full flow.",
    category: "Payments",
    minutes: 4,
    publishedAt: "2026-07-10",
    author: "TrustiFix Team",
    image: "/images/categories/tech.jpg",
    body: [
      "When you book a provider on TrustiFix, the quoted amount is held in your wallet immediately. That hold proves you’re serious and keeps funds ready for payout.",
      "If the provider cancels or you cancel before work starts, the hold is refunded to your balance. Nothing leaves your control until the job reaches Completed.",
      "On completion, the provider receives a payout minus a small platform fee. You can then leave a review or open a dispute if something went wrong.",
      "Tip: top up before peak hours so Near Me bookings don’t fail for insufficient balance.",
    ],
  },
  {
    slug: "verified-providers-kampala",
    title: "What “Verified provider” means in Kampala",
    excerpt:
      "Badges aren’t decoration — they’re admin-reviewed signals for ID, phone, and service quality.",
    category: "Trust",
    minutes: 3,
    publishedAt: "2026-07-14",
    author: "Safety Desk",
    image: "/images/avatars/elite.jpg",
    body: [
      "Verified means an admin has reviewed the provider’s application or toggled verification after checks. Phone verified means we can reach them for safety alerts and job updates.",
      "Always prefer providers with both badges for first-time bookings, especially for home visits or late-evening vehicle work.",
      "If something feels off, use in-app chat to clarify, or hit the panic button to notify TrustiFix admin with your location.",
    ],
  },
  {
    slug: "ac-service-checklist",
    title: "AC service checklist before your mechanic arrives",
    excerpt: "A five-minute prep list that helps mobile AC specialists diagnose faster.",
    category: "Vehicle",
    minutes: 5,
    publishedAt: "2026-07-18",
    author: "Alex Okello",
    image: "/images/services/ac.jpg",
    body: [
      "Park in a shaded spot if you can, and note when the AC last worked normally — idle, highway, or both.",
      "Write down any smells (sweet coolant vs moldy), unusual noises, or dashboard warnings.",
      "Clear the glove box of valuables and leave the cabin accessible. Share photos in the booking chat before the visit.",
      "After the job, confirm cooling at idle for a few minutes before marking the booking complete.",
    ],
  },
  {
    slug: "using-the-panic-button",
    title: "Using the panic button without panic",
    excerpt: "When to tap it, who gets notified, and what happens next.",
    category: "Safety",
    minutes: 3,
    publishedAt: "2026-07-20",
    author: "Safety Desk",
    image: "/images/categories/home.jpg",
    body: [
      "The red safety button appears when you’re signed in. It shares your approximate location and an optional note with TrustiFix admin.",
      "If you have an active booking, the other party on that job is also notified so they know something needs attention.",
      "Use it for real safety concerns — threats, accidents, or feeling unsafe during a visit. For billing issues, open a dispute from your dashboard instead.",
    ],
  },
  {
    slug: "kampala-rush-hour-bookings",
    title: "Booking around Kampala rush hour without the wait",
    excerpt: "When to schedule, which areas stay reachable, and how live demand helps you pick a slot.",
    category: "Tips",
    minutes: 4,
    publishedAt: "2026-07-22",
    author: "TrustiFix Team",
    image: "/images/categories/vehicle.jpg",
    body: [
      "Morning and evening peaks make same-day vehicle and handyman visits slower across Nakawa, Ntinda, and the CBD. Book earlier windows when you can.",
      "Use Near Me with your area set correctly — providers within 2–3 km often arrive before cross-town trips clear traffic.",
      "If live demand is high, lock a wallet hold early so your preferred pro isn’t taken by a later request.",
    ],
  },
  {
    slug: "home-cleaning-prep",
    title: "Prep your home so cleaners finish faster",
    excerpt: "Small steps before a TrustiFix cleaning visit that save time and cut rework.",
    category: "Home",
    minutes: 3,
    publishedAt: "2026-07-08",
    author: "Sparkle Desk",
    image: "/images/services/cleaning.jpg",
    body: [
      "Clear floors of laundry piles and toys so cleaners can reach edges without moving your life around.",
      "Note special surfaces — matte wood, delicate fabrics — in the booking chat before arrival.",
      "Confirm water and power access. After the job, walk through together before releasing the wallet hold.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPost(slug);
  const rest = BLOG_POSTS.filter((p) => p.slug !== slug).sort((a, b) => {
    if (current && a.category === current.category && b.category !== current.category) return -1;
    if (current && b.category === current.category && a.category !== current.category) return 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
  return rest.slice(0, limit);
}
