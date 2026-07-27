export type LiveFeedItem = {
  ago: string;
  icon: "pin" | "star" | "people";
  nodes: Array<{ text: string; bold?: boolean }>;
};

export const LIVE_FEED: LiveFeedItem[] = [
  {
    ago: "just now",
    icon: "pin",
    nodes: [
      { text: "Lisa", bold: true },
      { text: " in " },
      { text: "Entebbe", bold: true },
      { text: " just booked a " },
      { text: "car wash", bold: true },
    ],
  },
  {
    ago: "2 min ago",
    icon: "star",
    nodes: [
      { text: "Sarah", bold: true },
      { text: " from " },
      { text: "Ntinda", bold: true },
      { text: " rated a technician 5 stars" },
    ],
  },
  {
    ago: "5 min ago",
    icon: "people",
    nodes: [
      { text: "3 people", bold: true },
      { text: " near you requested " },
      { text: "car wash", bold: true },
      { text: " in the last 10 minutes" },
    ],
  },
  {
    ago: "2 min ago",
    icon: "star",
    nodes: [
      { text: "Mike", bold: true },
      { text: " from " },
      { text: "Muyenga", bold: true },
      { text: " rated a technician 5 stars" },
    ],
  },
  {
    ago: "just now",
    icon: "pin",
    nodes: [
      { text: "James", bold: true },
      { text: " in " },
      { text: "Bukoto", bold: true },
      { text: " just booked a " },
      { text: "phone repair", bold: true },
    ],
  },
  {
    ago: "5 min ago",
    icon: "people",
    nodes: [
      { text: "3 people", bold: true },
      { text: " near you requested " },
      { text: "AC service", bold: true },
      { text: " in the last 10 minutes" },
    ],
  },
];

export const HIGHLIGHTS = [
  { name: "Quick", tone: "gold", image: "/images/avatars/quick.jpg" },
  { name: "Elite", tone: "teal", image: "/images/avatars/elite.jpg" },
  { name: "Sparkle", tone: "purple", image: "/images/avatars/sparkle.jpg" },
  { name: "Tech", tone: "green", image: "/images/avatars/tech.jpg" },
];

export const PLATFORM_CATEGORIES = [
  {
    title: "Vehicle Services",
    image: "/images/categories/vehicle.jpg",
    tone: "teal",
    desc: "Repairs, washes, tyres, and roadside help",
    tags: ["Mechanic", "Car Wash", "Tyres"],
    to: "/services?category=Vehicle Services",
  },
  {
    title: "Home Services",
    image: "/images/categories/home.jpg",
    tone: "orange",
    desc: "Plumbing, electrical, locksmith, and handyman",
    tags: ["Plumbing", "Electrical", "Locksmith"],
    to: "/services?category=Home Services",
  },
  {
    title: "Tech Support",
    image: "/images/categories/tech.jpg",
    tone: "mint",
    desc: "Phones, laptops, Wi‑Fi, and office IT",
    tags: ["Phone Repair", "Wi‑Fi", "Software"],
    to: "/services?category=Tech Support",
  },
  {
    title: "Drivers",
    image: "/images/categories/vehicle.jpg",
    tone: "teal",
    desc: "Airport runs, day hire, and errands",
    tags: ["Airport", "Day hire", "Van"],
    to: "/services?category=Drivers",
  },
  {
    title: "Solar & Energy",
    image: "/images/categories/solar.jpg",
    tone: "orange",
    desc: "Installs, maintenance, and energy consults",
    tags: ["Installation", "Batteries", "Consultation"],
    to: "/services?category=Solar & Energy",
  },
  {
    title: "Childcare",
    image: "/images/categories/childcare.jpg",
    tone: "mint",
    desc: "Verified babysitters and event care",
    tags: ["Babysitting", "Day Care", "Events"],
    to: "/services?category=Childcare",
  },
  {
    title: "Cleaning & Laundry",
    image: "/images/services/cleaning.jpg",
    tone: "teal",
    desc: "Home cleans, laundry pickup, and carpets",
    tags: ["Deep clean", "Laundry", "Carpet"],
    to: "/services?category=Cleaning & Laundry",
  },
  {
    title: "Moving & Delivery",
    image: "/images/services/moving.jpg",
    tone: "orange",
    desc: "House moves, furniture, and grocery runs",
    tags: ["Moving", "Grocery", "Parcels"],
    to: "/services?category=Moving & Delivery",
  },
];

export const EMERGENCY_SERVICES = [
  {
    title: "Carpet Cleaning",
    image: "/images/services/carpet.jpg",
    tags: ["Pickup", "Home Service"],
    urgent: false,
  },
  {
    title: "Laundry Services",
    image: "/images/services/laundry.jpg",
    tags: ["Pickup", "Delivery", "Home Service"],
    urgent: false,
  },
  {
    title: "Car Wash",
    image: "/images/services/carwash.jpg",
    tags: ["Drive In", "Mobile Service"],
    urgent: false,
  },
  {
    title: "Emergency Plumbing",
    image: "/images/services/plumbing.jpg",
    tags: ["Home Service"],
    urgent: true,
  },
  {
    title: "Locksmith",
    image: "/images/services/locksmith.jpg",
    tags: ["Mobile Service"],
    urgent: true,
  },
  {
    title: "Pest Control",
    image: "/images/services/pest.jpg",
    tags: ["Home Service"],
    urgent: false,
  },
  {
    title: "Moving Services",
    image: "/images/services/moving.jpg",
    tags: ["Pickup", "Delivery"],
    urgent: false,
  },
  {
    title: "AC Repair",
    image: "/images/services/ac.jpg",
    tags: ["Home Service"],
    urgent: true,
  },
  {
    title: "Cleaning Services",
    image: "/images/services/cleaning.jpg",
    tags: ["Home Service"],
    urgent: false,
  },
  {
    title: "Grocery Delivery",
    image: "/images/services/grocery.jpg",
    tags: ["Delivery"],
    urgent: false,
  },
];

export const TIERS = [
  {
    id: "ordinary",
    name: "Ordinary",
    tagline: "Standard verified providers",
    features: ["Verified Identity"],
    popular: false,
    premium: false,
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "Premium verified providers",
    features: ["Background Check", "Priority Support", "Extended Warranty"],
    popular: true,
    premium: false,
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "Elite guaranteed service",
    features: ["Insurance Covered", "Money-Back Guarantee", "Dedicated Manager"],
    popular: false,
    premium: true,
  },
];

export const HOW_STEPS = [
  {
    n: "01",
    title: "Browse Providers",
    body: "Browse verified providers near you. Compare ratings, prices, and availability instantly.",
  },
  {
    n: "02",
    title: "Book Securely",
    body: "Lock the quote in your wallet hold. No offline cash deals — release only when you’re satisfied.",
  },
  {
    n: "03",
    title: "Track in Real-Time",
    body: "Watch arrival on the map, chat, and share photos so the pro shows up prepared.",
  },
  {
    n: "04",
    title: "Rate & Repeat",
    body: "Leave a review to help others. Save favorites for quick rebooking next time.",
  },
];

export const TRUST_STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "12K+", label: "Verified Providers" },
  { value: "99.2%", label: "Satisfaction Rate" },
  { value: "< 5min", label: "Avg. Response Time" },
];

export const TRUST_FEATURES = [
  {
    title: "Multi-Step Verification",
    body: "Every provider undergoes ID checks, skill verification, and background screening.",
  },
  {
    title: "Secure Escrow Payments",
    body: "Your money is held safely until the service is completed to your satisfaction.",
  },
  {
    title: "Real-Time Tracking",
    body: "Monitor provider location and job progress with live GPS tracking.",
  },
  {
    title: "Service Guarantee",
    body: "Platinum tier includes full insurance and money-back guarantee.",
  },
  {
    title: "Fraud Detection",
    body: "AI-powered systems monitor for suspicious activity 24/7.",
  },
  {
    title: "24/7 Support",
    body: "Our team is always available to resolve any issues or disputes.",
  },
];

export const PROVIDER_BENEFITS = [
  {
    title: "Grow Your Business",
    body: "Access thousands of customers looking for trusted help",
    icon: "chart" as const,
  },
  {
    title: "Flexible Schedule",
    body: "Work when you want, accept jobs that fit your day",
    icon: "calendar" as const,
  },
  {
    title: "Fast Payments",
    body: "Get paid to your wallet with transparent pricing",
    icon: "wallet" as const,
  },
  {
    title: "Skill Upgrades",
    body: "Access training to unlock Gold and Platinum tiers",
    icon: "star" as const,
  },
];

/** Pain points inspired by on-demand mechanic landing patterns */
export const PAIN_POINTS = [
  {
    title: "Stranded without a trusted contact",
    body: "Breakdowns and home emergencies shouldn’t mean guessing who to call — or whether they’ll show up.",
  },
  {
    title: "Surprise bills after the job",
    body: "Quotes that change mid-job leave you arguing over cash. TrustiFix shows the price before you confirm.",
  },
  {
    title: "Unsafe or unverified visits",
    body: "Waiting alone for someone you can’t verify is stressful. Verified badges, chat, and safety tools stay with you.",
  },
  {
    title: "Paying to tow when a visit would do",
    body: "Many jobs only need a skilled pro at your pin — not a full tow to a garage overnight.",
  },
];

export const LOCAL_PERKS = [
  {
    title: "Wallet hold & release",
    body: "Funds lock when you book and release only when the job is done to your satisfaction.",
  },
  {
    title: "Mobile money ready",
    body: "Top up and pay with flows built for Kampala — MTN, Airtel, and card-friendly wallet top-ups.",
  },
  {
    title: "Live tracking & chat",
    body: "Watch progress, message your pro, and share photos before they arrive.",
  },
  {
    title: "Transparent pricing",
    body: "Compare ratings and rates nearby. No subscription to browse or book.",
  },
];

export const COMPARE_ROWS = [
  { others: "Unclear pricing & cash-only deals", us: "Price before confirm · wallet escrow" },
  { others: "Garage drop-off & long waits", us: "Pros come to your pin when possible" },
  { others: "Hard to compare providers", us: "Ratings, distance, and tiers in one place" },
  { others: "Subscription-locked apps", us: "Pay only for the jobs you book" },
  { others: "No safety path mid-visit", us: "Panic button, disputes, and Trust desk" },
];

export const TESTIMONIALS = [
  {
    quote:
      "Sending a verified technician to Nakawa instead of towing — that is the future of getting work done in Kampala.",
    name: "Beta tester",
    place: "Nakawa",
  },
  {
    quote:
      "No more guessing prices. Wallet hold meant I knew the money was safe until the AC job was finished.",
    name: "Beta tester",
    place: "Ntinda",
  },
  {
    quote:
      "I booked a locksmith at night, tracked arrival, and paid from my wallet. Felt safer than calling a random number.",
    name: "Beta tester",
    place: "Bugolobi",
  },
];

export const HOME_FAQS = [
  {
    q: "What is TrustiFix?",
    a: "TrustiFix is a Kampala service marketplace that connects you with verified mechanics, home techs, drivers, cleaners, and more — with wallet holds, live tracking, and reviews.",
  },
  {
    q: "Can I choose who works on my job?",
    a: "Yes. Browse Near Me, compare ratings, distance, and tiers, then book the provider you prefer. You are never forced into a random match.",
  },
  {
    q: "How do payments work?",
    a: "When you book, the amount is held in your TrustiFix wallet. It is released to the provider only after the job is completed — or refunded if cancelled under the rules.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Escrow-style wallet holds keep funds locked until you are satisfied. Disputes go to the TrustiFix admin desk if something goes wrong.",
  },
  {
    q: "Do providers come to me?",
    a: "Many vehicle and home jobs are mobile. Pin your area, see who’s nearby, and track arrival. Some services may still be workshop or pickup based.",
  },
  {
    q: "How are providers verified?",
    a: "Admins review applications and can grant Verified and Phone badges after ID and quality checks. Prefer badge holders for first-time home visits.",
  },
];

export const FOOTER = {
  tagline:
    "Your trusted service provider platform. Connecting you with verified professionals for all your needs.",
  email: "hello@trustifix.com",
  phone: "+256 700 000 000",
  location: "Kampala · Available Nationwide",
  columns: [
    {
      title: "Services",
      links: [
        { label: "All Services", to: "/services" },
        { label: "Vehicle Services", to: "/services", category: "Vehicle Services" },
        { label: "Home Services", to: "/services", category: "Home Services" },
        { label: "Tech Support", to: "/services", category: "Tech Support" },
        { label: "Solar & Energy", to: "/services", category: "Solar & Energy" },
        { label: "Childcare", to: "/services", category: "Childcare" },
        { label: "Cleaning & Laundry", to: "/services", category: "Cleaning & Laundry" },
        { label: "Moving & Delivery", to: "/services", category: "Moving & Delivery" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Blog & News", to: "/blog" },
        { label: "Events", to: "/events" },
        { label: "Auction & Swap", to: "/auction" },
        { label: "Wallet", to: "/wallet" },
        { label: "Trust & Safety", to: "/trust-safety" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", to: "/", hash: "trust" },
        { label: "Home", to: "/" },
        { label: "Contact", href: "mailto:hello@trustifix.com" },
        { label: "Help Center", to: "/trust-safety" },
      ],
    },
    {
      title: "Providers",
      links: [
        { label: "Become a Provider", to: "/become-provider" },
        { label: "Provider Dashboard", to: "/provider-dashboard" },
        { label: "Provider Resources", to: "/blog" },
        { label: "Apply & Earn", to: "/become-provider" },
      ],
    },
  ],
};
