import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BOOKING_STATUS_LABELS,
  canTransition,
  transitionBooking,
  type Booking,
  type BookingStatus,
} from "../lib/booking";
import { uid } from "../lib/format";
import { getProvider, PROVIDERS, type Provider } from "../data/providers";
import { loadJson, saveJson, STORAGE_KEY } from "../lib/storage";

export type WalletTxnType = "topup" | "hold" | "refund" | "payout";

export type WalletTransaction = {
  id: string;
  userId: string;
  type: WalletTxnType;
  amountCents: number;
  label: string;
  bookingId?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Dispute = {
  id: string;
  bookingId: string;
  openedBy: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type SafetyAlert = {
  id: string;
  userId: string;
  note: string;
  lat: number;
  lng: number;
  areaLabel: string;
  status: "open" | "acknowledged";
  createdAt: string;
};

export type NotificationKind = "booking" | "message" | "safety" | "wallet" | "system";

export type AppNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  bookingId?: string;
  threadId?: string;
  read: boolean;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  system?: boolean;
  createdAt: string;
  readBy: string[];
};

export type ChatThread = {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  updatedAt: string;
};

export type ProviderApplication = {
  id: string;
  userId: string;
  fullName: string;
  category: string;
  area: string;
  pitch: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type VerificationOverride = {
  verified?: boolean;
  phoneVerified?: boolean;
};

export type EventRegistration = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};

export type AuctionBid = {
  id: string;
  bidderId: string;
  amountCents: number;
  createdAt: string;
};

export type AuctionListing = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  startingBidCents: number;
  endsAt: string;
  status: "open" | "ended";
  bids: AuctionBid[];
  imageUrl?: string;
  images?: string[];
};

type CreateBookingInput = {
  customerId: string;
  providerId: string;
  serviceCategory: string;
  locationLabel: string;
  notes?: string;
  scheduledAt?: string;
  priceHoldCents: number;
};

type PlatformContextValue = {
  bookings: Booking[];
  transactions: WalletTransaction[];
  reviews: Review[];
  disputes: Dispute[];
  safetyAlerts: SafetyAlert[];
  notifications: AppNotification[];
  threads: ChatThread[];
  messages: ChatMessage[];
  getBalanceCents: (userId: string) => number;
  createBooking: (input: CreateBookingInput) => Booking;
  openProviderChat: (customerId: string, providerId: string) => string;
  updateBookingStatus: (bookingId: string, next: BookingStatus) => void;
  topUp: (userId: string, amountCents: number) => void;
  addReview: (input: Omit<Review, "id" | "createdAt">) => void;
  openDispute: (bookingId: string, openedBy: string, reason: string) => void;
  triggerPanic: (input: {
    userId: string;
    note: string;
    lat: number;
    lng: number;
    areaLabel: string;
  }) => void;
  acknowledgeSafetyAlert: (id: string) => void;
  bookingsForCustomer: (customerId: string) => Booking[];
  bookingsForProvider: (providerId: string) => Booking[];
  unreadNotificationCount: (userId: string) => number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  threadsForUser: (userId: string) => ChatThread[];
  messagesForThread: (threadId: string) => ChatMessage[];
  unreadMessageCount: (userId: string) => number;
  sendMessage: (threadId: string, senderId: string, body: string) => void;
  markThreadRead: (threadId: string, userId: string) => void;
  threadForBooking: (bookingId: string) => ChatThread | undefined;
  applications: ProviderApplication[];
  verificationOverrides: Record<string, VerificationOverride>;
  submitApplication: (input: {
    userId: string;
    fullName: string;
    category: string;
    area: string;
    pitch: string;
  }) => ProviderApplication;
  reviewApplication: (id: string, status: "approved" | "rejected") => void;
  setProviderVerification: (
    providerId: string,
    patch: VerificationOverride,
  ) => void;
  getEffectiveProvider: (id: string) => Provider | undefined;
  getEffectiveProviders: () => Provider[];
  setProviderAvatar: (providerId: string, avatarUrl: string | undefined) => void;
  applicationForUser: (userId: string) => ProviderApplication | undefined;
  clearPersistedData: () => void;
  eventRegistrations: EventRegistration[];
  registerForEvent: (eventId: string, userId: string) => void;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  isRegisteredForEvent: (eventId: string, userId: string) => boolean;
  registrationCount: (eventId: string) => number;
  auctionListings: AuctionListing[];
  createAuctionListing: (input: {
    sellerId: string;
    title: string;
    description: string;
    category: string;
    startingBidCents: number;
    endsAt: string;
    imageUrl?: string;
    images?: string[];
  }) => AuctionListing;
  placeBid: (listingId: string, bidderId: string, amountCents: number) => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);
const PLATFORM_FEE_RATE = 0.1;
const ADMIN_ID = "admin-1";

type PersistedPlatform = {
  bookings: Booking[];
  transactions: WalletTransaction[];
  reviews: Review[];
  disputes: Dispute[];
  safetyAlerts: SafetyAlert[];
  notifications: AppNotification[];
  threads: ChatThread[];
  messages: ChatMessage[];
  applications: ProviderApplication[];
  verificationOverrides: Record<string, VerificationOverride>;
  providerAvatars: Record<string, string>;
  eventRegistrations: EventRegistration[];
  auctionListings: AuctionListing[];
};

const SEED_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "txn-seed-customer",
    userId: "cust-1",
    type: "topup",
    amountCents: 50000000,
    label: "Welcome wallet top-up",
    createdAt: new Date().toISOString(),
  },
];

function seedAuctions(): AuctionListing[] {
  const ends = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "auc-gauge",
      sellerId: "prov-nakawa-ac",
      title: "AC manifold gauge set",
      description: "Lightly used dual gauge set for R134a work. Comes with hoses.",
      category: "Tools",
      startingBidCents: 18000000,
      endsAt: ends(2),
      status: "open",
      bids: [],
      imageUrl: "/images/services/ac.jpg",
      images: ["/images/services/ac.jpg", "/images/services/ac.jpg", "/images/categories/vehicle.jpg"],
    },
    {
      id: "auc-battery",
      sellerId: "prov-ntinda-mech",
      title: "Car battery charger",
      description: "12V smart charger — workshop and roadside ready.",
      category: "Tools",
      startingBidCents: 9500000,
      endsAt: ends(3),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/vehicle.jpg",
      images: ["/images/categories/vehicle.jpg", "/images/categories/vehicle.jpg"],
    },
    {
      id: "auc-drill",
      sellerId: "prov-cbd-handy",
      title: "Cordless drill kit",
      description: "18V drill with 2 batteries and charger. Good for furniture & fixtures.",
      category: "Tools",
      startingBidCents: 22000000,
      endsAt: ends(4),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/handyman.jpg",
      images: ["/images/categories/handyman.jpg", "/images/categories/handyman.jpg", "/images/categories/home.jpg"],
    },
    {
      id: "auc-tyres",
      sellerId: "prov-bukoto-tyre",
      title: "Used tyre set (4)",
      description: "Matching set, decent tread left. Fits common saloon sizes.",
      category: "Parts",
      startingBidCents: 32000000,
      endsAt: ends(1),
      status: "open",
      bids: [],
      imageUrl: "/images/services/carwash.jpg",
      images: ["/images/services/carwash.jpg", "/images/services/carwash.jpg", "/images/categories/vehicle.jpg"],
    },
    {
      id: "auc-toolbox",
      sellerId: "prov-kololo-home",
      title: "Steel toolbox + sockets",
      description: "Compact steel box with mixed metric sockets. Great starter kit.",
      category: "Tools",
      startingBidCents: 12500000,
      endsAt: ends(5),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/home.jpg",
      images: ["/images/categories/home.jpg", "/images/categories/handyman.jpg"],
    },
    {
      id: "auc-phone",
      sellerId: "prov-bugolobi-tech",
      title: "Refurbished Android phone",
      description: "Tested screen & battery. Cleaned and reset. 30-day seller check.",
      category: "Electronics",
      startingBidCents: 28000000,
      endsAt: ends(2),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/tech.jpg",
      images: ["/images/categories/tech.jpg", "/images/categories/tech.jpg", "/images/avatars/sparkle.jpg"],
    },
    {
      id: "auc-solar",
      sellerId: "prov-ntinda-solar",
      title: "100W solar panel (used)",
      description: "Still outputting well. Ideal for a small home top-up kit.",
      category: "Electronics",
      startingBidCents: 45000000,
      endsAt: ends(6),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/solar.jpg",
      images: ["/images/categories/solar.jpg", "/images/categories/solar.jpg", "/images/categories/home.jpg"],
    },
    {
      id: "auc-kit",
      sellerId: "prov-muyenga-lock",
      title: "Mobile first-aid kit",
      description: "Workshop / roadside kit — gloves, bandages, antiseptic.",
      category: "Other",
      startingBidCents: 4500000,
      endsAt: ends(3),
      status: "open",
      bids: [],
      imageUrl: "/images/services/locksmith.jpg",
      images: ["/images/services/locksmith.jpg", "/images/services/locksmith.jpg"],
    },
    {
      id: "auc-washer-parts",
      sellerId: "prov-ntinda-appliance",
      title: "Washing machine belt + pump",
      description: "Compatible with common front-loaders. Unused spare parts.",
      category: "Parts",
      startingBidCents: 7000000,
      endsAt: ends(4),
      status: "open",
      bids: [],
      imageUrl: "/images/services/laundry.jpg",
      images: ["/images/services/laundry.jpg", "/images/categories/home.jpg", "/images/categories/home.jpg"],
    },
    {
      id: "auc-plumb",
      sellerId: "prov-kololo-home",
      title: "Plumbing fittings bundle",
      description: "Elbows, valves, and tape — leftover stock from jobs.",
      category: "Parts",
      startingBidCents: 5500000,
      endsAt: ends(2),
      status: "open",
      bids: [],
      imageUrl: "/images/services/plumbing.jpg",
      images: ["/images/services/plumbing.jpg", "/images/categories/home.jpg", "/images/services/locksmith.jpg"],
    },
    {
      id: "auc-cctv",
      sellerId: "prov-makerere-tech",
      title: "Used CCTV camera (2-pack)",
      description: "Indoor/outdoor cameras, tested. Cables included.",
      category: "Electronics",
      startingBidCents: 16000000,
      endsAt: ends(5),
      status: "open",
      bids: [],
      imageUrl: "/images/categories/tech.jpg",
      images: ["/images/categories/tech.jpg", "/images/categories/tech.jpg", "/images/avatars/tech.jpg"],
    },
    {
      id: "auc-clean",
      sellerId: "prov-bukoto-clean",
      title: "Commercial vacuum cleaner",
      description: "Strong suction, used in home & office jobs. Hose intact.",
      category: "Tools",
      startingBidCents: 19000000,
      endsAt: ends(3),
      status: "open",
      bids: [],
      imageUrl: "/images/services/cleaning.jpg",
      images: ["/images/services/cleaning.jpg", "/images/services/carpet.jpg", "/images/categories/home.jpg"],
    },
  ];
}

function isAuctionIcon(url: string | undefined): boolean {
  return !url || url.includes("/images/auction/") || url.endsWith(".svg");
}

function mergeAuctionCatalog(saved: AuctionListing[] | undefined): AuctionListing[] {
  const seeds = seedAuctions();
  if (!saved?.length) return seeds;
  const byId = new Map(withAuctionImages(saved).map((l) => [l.id, l]));
  for (const seed of seeds) {
    const existing = byId.get(seed.id);
    if (!existing) {
      byId.set(seed.id, seed);
      continue;
    }
    // Force photo refresh for catalog seeds that still carry SVG/icon art
    byId.set(seed.id, {
      ...existing,
      imageUrl: seed.imageUrl,
      images: seed.images,
    });
  }
  return Array.from(byId.values());
}

/** Ensure older saved listings still get real photo visuals */
function withAuctionImages(listings: AuctionListing[]): AuctionListing[] {
  const seeds = Object.fromEntries(seedAuctions().map((l) => [l.id, l]));
  const categoryFallback: Record<string, string> = {
    Tools: "/images/categories/home.jpg",
    Parts: "/images/categories/vehicle.jpg",
    Electronics: "/images/categories/tech.jpg",
    Other: "/images/services/locksmith.jpg",
  };
  return listings.map((l) => {
    const seed = seeds[l.id];
    const fallback = seed?.imageUrl ?? categoryFallback[l.category] ?? "/images/categories/home.jpg";
    const imageUrl = isAuctionIcon(l.imageUrl) ? fallback : (l.imageUrl as string);
    const images = (l.images?.length ? l.images : seed?.images ?? [imageUrl]).map((src) =>
      isAuctionIcon(src) ? fallback : src,
    );
    return { ...l, imageUrl, images };
  });
}

function seedReviews(): Review[] {
  const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  return [
    {
      id: "rev-alex-1",
      bookingId: "seed-1",
      providerId: "prov-nakawa-ac",
      customerId: "cust-1",
      rating: 5,
      comment: "Came same day, recharged my AC, and explained the leak clearly. Fair price.",
      createdAt: ago(3),
    },
    {
      id: "rev-emma-1",
      bookingId: "seed-2",
      providerId: "prov-ntinda-mech",
      customerId: "cust-1",
      rating: 5,
      comment: "Honest diagnosis on brakes. Showed me the worn pads before replacing.",
      createdAt: ago(5),
    },
    {
      id: "rev-brian-1",
      bookingId: "seed-3",
      providerId: "prov-kololo-home",
      customerId: "cust-1",
      rating: 4,
      comment: "Fixed the leaking tap and replaced a socket. Neat work.",
      createdAt: ago(8),
    },
    {
      id: "rev-sara-1",
      bookingId: "seed-4",
      providerId: "prov-bugolobi-tech",
      customerId: "cust-1",
      rating: 5,
      comment: "Phone screen done in under an hour. Data was safe.",
      createdAt: ago(2),
    },
    {
      id: "rev-grace-1",
      bookingId: "seed-5",
      providerId: "prov-bukoto-clean",
      customerId: "cust-1",
      rating: 5,
      comment: "Deep clean was thorough — kitchen and bathrooms looked new.",
      createdAt: ago(6),
    },
    {
      id: "rev-daniel-1",
      bookingId: "seed-6",
      providerId: "prov-ntinda-solar",
      customerId: "cust-1",
      rating: 5,
      comment: "Clear quote for the solar kit and clean install. Recommended.",
      createdAt: ago(12),
    },
  ];
}

function defaultPersisted(): PersistedPlatform {
  return {
    bookings: [],
    transactions: SEED_TRANSACTIONS,
    reviews: seedReviews(),
    disputes: [],
    safetyAlerts: [],
    notifications: [],
    threads: [],
    messages: [],
    applications: [],
    verificationOverrides: {},
    providerAvatars: {},
    eventRegistrations: [],
    auctionListings: seedAuctions(),
  };
}

function txnDelta(type: WalletTxnType, amountCents: number): number {
  if (type === "topup" || type === "refund" || type === "payout") return amountCents;
  return -amountCents;
}

export function displayName(userId: string): string {
  if (userId === "cust-1") return "Demo Customer";
  if (userId === ADMIN_ID) return "Admin";
  return getProvider(userId)?.name ?? userId;
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [hydrated] = useState(() => loadJson<PersistedPlatform>(STORAGE_KEY, defaultPersisted()));
  const [bookings, setBookings] = useState<Booking[]>(hydrated.bookings);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(
    hydrated.transactions.length ? hydrated.transactions : SEED_TRANSACTIONS,
  );
  const [reviews, setReviews] = useState<Review[]>(hydrated.reviews);
  const [disputes, setDisputes] = useState<Dispute[]>(hydrated.disputes);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>(hydrated.safetyAlerts);
  const [notifications, setNotifications] = useState<AppNotification[]>(hydrated.notifications);
  const [threads, setThreads] = useState<ChatThread[]>(hydrated.threads);
  const [messages, setMessages] = useState<ChatMessage[]>(hydrated.messages);
  const [applications, setApplications] = useState<ProviderApplication[]>(hydrated.applications);
  const [verificationOverrides, setVerificationOverrides] = useState<
    Record<string, VerificationOverride>
  >(hydrated.verificationOverrides ?? {});
  const [providerAvatars, setProviderAvatars] = useState<Record<string, string>>(
    hydrated.providerAvatars ?? {},
  );
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(
    hydrated.eventRegistrations ?? [],
  );
  const [auctionListings, setAuctionListings] = useState<AuctionListing[]>(
    () => mergeAuctionCatalog(hydrated.auctionListings),
  );
  const threadsRef = useRef(threads);
  threadsRef.current = threads;

  useEffect(() => {
    saveJson(STORAGE_KEY, {
      bookings,
      transactions,
      reviews,
      disputes,
      safetyAlerts,
      notifications,
      threads,
      messages,
      applications,
      verificationOverrides,
      providerAvatars,
      eventRegistrations,
      auctionListings,
    } satisfies PersistedPlatform);
  }, [
    bookings,
    transactions,
    reviews,
    disputes,
    safetyAlerts,
    notifications,
    threads,
    messages,
    applications,
    verificationOverrides,
    providerAvatars,
    eventRegistrations,
    auctionListings,
  ]);

  const getBalanceCents = useCallback(
    (userId: string) =>
      transactions
        .filter((t) => t.userId === userId)
        .reduce((sum, t) => sum + txnDelta(t.type, t.amountCents), 0),
    [transactions],
  );

  const pushTxn = useCallback((txn: Omit<WalletTransaction, "id" | "createdAt">) => {
    setTransactions((prev) => [
      { ...txn, id: uid("txn"), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const pushNotification = useCallback(
    (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      setNotifications((prev) => [
        {
          ...n,
          id: uid("ntf"),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const pushSystemMessage = useCallback((threadId: string, body: string) => {
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: uid("msg"),
        threadId,
        senderId: "system",
        body,
        system: true,
        createdAt: now,
        readBy: [],
      },
    ]);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, updatedAt: now } : t)),
    );
  }, []);

  const createBooking = useCallback(
    (input: CreateBookingInput) => {
      if (input.priceHoldCents > 0 && getBalanceCents(input.customerId) < input.priceHoldCents) {
        throw new Error("Insufficient wallet balance. Top up before booking.");
      }

      const now = new Date().toISOString();
      const booking: Booking = {
        id: uid("bk"),
        customerId: input.customerId,
        providerId: input.providerId,
        serviceCategory: input.serviceCategory,
        status: "pending",
        scheduledAt: input.scheduledAt,
        locationLabel: input.locationLabel,
        notes: input.notes,
        priceHoldCents: input.priceHoldCents,
        createdAt: now,
        updatedAt: now,
      };

      const threadId = uid("th");
      const thread: ChatThread = {
        id: threadId,
        bookingId: booking.id,
        customerId: input.customerId,
        providerId: input.providerId,
        updatedAt: now,
      };

      setBookings((prev) => [booking, ...prev]);
      setThreads((prev) => [thread, ...prev]);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          threadId,
          senderId: "system",
          body: `Booking created for ${input.serviceCategory} at ${input.locationLabel}.`,
          system: true,
          createdAt: now,
          readBy: [input.customerId],
        },
      ]);

      if (input.priceHoldCents > 0) {
        pushTxn({
          userId: input.customerId,
          type: "hold",
          amountCents: input.priceHoldCents,
          label: `Payment hold · ${input.serviceCategory}`,
          bookingId: booking.id,
        });
      }

      pushNotification({
        userId: input.providerId,
        kind: "booking",
        title: "New booking request",
        body: `${displayName(input.customerId)} booked you · ${input.serviceCategory}`,
        href: "/provider-dashboard",
        bookingId: booking.id,
      });
      pushNotification({
        userId: input.customerId,
        kind: "booking",
        title: "Booking submitted",
        body: `Waiting for ${providerLabel(input.providerId)} to accept.`,
        href: "/dashboard",
        bookingId: booking.id,
      });
      if (input.priceHoldCents > 0) {
        pushNotification({
          userId: input.customerId,
          kind: "wallet",
          title: "Payment hold placed",
          body: `Funds held for ${input.serviceCategory}.`,
          href: "/wallet",
          bookingId: booking.id,
        });
      }

      return booking;
    },
    [getBalanceCents, pushTxn, pushNotification],
  );

  const openProviderChat = useCallback(
    (customerId: string, providerId: string) => {
      const existing = threads.find(
        (t) => t.customerId === customerId && t.providerId === providerId,
      );
      if (existing) return existing.id;

      const now = new Date().toISOString();
      const booking: Booking = {
        id: uid("inq"),
        customerId,
        providerId,
        serviceCategory: "Chat inquiry",
        status: "pending",
        locationLabel: "Pre-booking chat",
        notes: "Customer started a chat from the provider profile",
        priceHoldCents: 0,
        createdAt: now,
        updatedAt: now,
      };
      const threadId = uid("th");
      setBookings((prev) => [booking, ...prev]);
      setThreads((prev) => [
        {
          id: threadId,
          bookingId: booking.id,
          customerId,
          providerId,
          updatedAt: now,
        },
        ...prev,
      ]);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          threadId,
          senderId: "system",
          body: `Chat started with ${providerLabel(providerId)}. Ask about availability, pricing, or the job.`,
          system: true,
          createdAt: now,
          readBy: [customerId],
        },
      ]);
      pushNotification({
        userId: providerId,
        kind: "message",
        title: "New customer chat",
        body: `${displayName(customerId)} wants to chat before booking.`,
        href: `/messages?thread=${threadId}`,
        bookingId: booking.id,
        threadId,
      });
      return threadId;
    },
    [threads, pushNotification],
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, next: BookingStatus) => {
      setBookings((prev) => {
        const current = prev.find((b) => b.id === bookingId);
        if (!current) throw new Error("Booking not found");
        if (!canTransition(current.status, next)) {
          throw new Error(`Invalid transition ${current.status} → ${next}`);
        }

        const updated = transitionBooking(current, next);
        const hold = current.priceHoldCents ?? 0;
        const label = BOOKING_STATUS_LABELS[next];

        if (next === "cancelled" && hold > 0 && current.status !== "completed") {
          pushTxn({
            userId: current.customerId,
            type: "refund",
            amountCents: hold,
            label: "Refund · booking cancelled",
            bookingId: current.id,
          });
          pushNotification({
            userId: current.customerId,
            kind: "wallet",
            title: "Refund issued",
            body: "Held funds returned to your wallet.",
            href: "/wallet",
            bookingId: current.id,
          });
        }

        if (next === "completed" && hold > 0 && current.providerId) {
          const payout = Math.round(hold * (1 - PLATFORM_FEE_RATE));
          pushTxn({
            userId: current.providerId,
            type: "payout",
            amountCents: payout,
            label: `Payout · ${current.serviceCategory}`,
            bookingId: current.id,
          });
          pushNotification({
            userId: current.providerId,
            kind: "wallet",
            title: "Payout received",
            body: `Earnings credited for ${current.serviceCategory}.`,
            href: "/wallet",
            bookingId: current.id,
          });
        }

        const recipients = [current.customerId, current.providerId].filter(Boolean) as string[];
        for (const userId of recipients) {
          pushNotification({
            userId,
            kind: "booking",
            title: `Booking · ${label}`,
            body: current.serviceCategory,
            href: userId === current.providerId ? "/provider-dashboard" : "/dashboard",
            bookingId: current.id,
          });
        }

        const thread = threadsRef.current.find((t) => t.bookingId === bookingId);
        if (thread) pushSystemMessage(thread.id, `Status updated: ${label}`);

        return prev.map((b) => (b.id === bookingId ? updated : b));
      });
    },
    [pushTxn, pushNotification, pushSystemMessage],
  );

  const topUp = useCallback(
    (userId: string, amountCents: number) => {
      pushTxn({ userId, type: "topup", amountCents, label: "Wallet top-up" });
      pushNotification({
        userId,
        kind: "wallet",
        title: "Wallet topped up",
        body: "Your balance was updated.",
        href: "/wallet",
      });
    },
    [pushTxn, pushNotification],
  );

  const addReview = useCallback(
    (input: Omit<Review, "id" | "createdAt">) => {
      setReviews((prev) => [
        { ...input, id: uid("rev"), createdAt: new Date().toISOString() },
        ...prev,
      ]);
      pushNotification({
        userId: input.providerId,
        kind: "system",
        title: "New review",
        body: `${displayName(input.customerId)} rated you ${input.rating}★`,
        href: `/provider/${input.providerId}`,
        bookingId: input.bookingId,
      });
    },
    [pushNotification],
  );

  const openDispute = useCallback(
    (bookingId: string, openedBy: string, reason: string) => {
      let bookingSnapshot: Booking | undefined;

      setDisputes((prev) => [
        {
          id: uid("dsp"),
          bookingId,
          openedBy,
          reason,
          status: "open",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setBookings((prev) => {
        const current = prev.find((b) => b.id === bookingId);
        bookingSnapshot = current;
        if (!current || !canTransition(current.status, "disputed")) return prev;
        return prev.map((b) => (b.id === bookingId ? transitionBooking(b, "disputed") : b));
      });

      pushNotification({
        userId: ADMIN_ID,
        kind: "safety",
        title: "Dispute opened",
        body: reason,
        href: "/admin",
        bookingId,
      });

      if (bookingSnapshot) {
        const other =
          openedBy === bookingSnapshot.customerId
            ? bookingSnapshot.providerId
            : bookingSnapshot.customerId;
        if (other) {
          pushNotification({
            userId: other,
            kind: "safety",
            title: "Dispute on your booking",
            body: reason,
            href:
              other === bookingSnapshot.providerId ? "/provider-dashboard" : "/dashboard",
            bookingId,
          });
        }
      }

      const thread = threadsRef.current.find((t) => t.bookingId === bookingId);
      if (thread) pushSystemMessage(thread.id, `Dispute opened: ${reason}`);
    },
    [pushNotification, pushSystemMessage],
  );

  const triggerPanic = useCallback(
    (input: {
      userId: string;
      note: string;
      lat: number;
      lng: number;
      areaLabel: string;
    }) => {
      const alert: SafetyAlert = {
        id: uid("saf"),
        userId: input.userId,
        note: input.note,
        lat: input.lat,
        lng: input.lng,
        areaLabel: input.areaLabel,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      setSafetyAlerts((prev) => [alert, ...prev]);

      pushNotification({
        userId: ADMIN_ID,
        kind: "safety",
        title: "PANIC ALERT",
        body: `${displayName(input.userId)} · ${input.areaLabel} · ${input.note}`,
        href: "/admin",
      });
      pushNotification({
        userId: input.userId,
        kind: "safety",
        title: "Safety alert sent",
        body: "Admin has been notified with your location.",
        href: "/notifications",
      });

      // Notify counterparties on active bookings
      const active = bookings.filter(
        (b) =>
          (b.customerId === input.userId || b.providerId === input.userId) &&
          !["completed", "cancelled"].includes(b.status),
      );
      for (const b of active) {
        const other = b.customerId === input.userId ? b.providerId : b.customerId;
        if (!other) continue;
        pushNotification({
          userId: other,
          kind: "safety",
          title: "Safety alert on shared job",
          body: `${displayName(input.userId)} triggered a panic alert.`,
          href: "/messages",
          bookingId: b.id,
        });
      }
    },
    [bookings, pushNotification],
  );

  const acknowledgeSafetyAlert = useCallback((id: string) => {
    setSafetyAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)),
    );
  }, []);

  const submitApplication = useCallback(
    (input: {
      userId: string;
      fullName: string;
      category: string;
      area: string;
      pitch: string;
    }) => {
      const existing = applications.find(
        (a) => a.userId === input.userId && a.status === "pending",
      );
      if (existing) return existing;

      const app: ProviderApplication = {
        id: uid("app"),
        userId: input.userId,
        fullName: input.fullName,
        category: input.category,
        area: input.area,
        pitch: input.pitch,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setApplications((prev) => [app, ...prev]);
      pushNotification({
        userId: ADMIN_ID,
        kind: "system",
        title: "New provider application",
        body: `${input.fullName} · ${input.category} · ${input.area}`,
        href: "/admin",
      });
      pushNotification({
        userId: input.userId,
        kind: "system",
        title: "Application submitted",
        body: "Admin will review your provider verification request.",
        href: "/become-provider",
      });
      return app;
    },
    [applications, pushNotification],
  );

  const reviewApplication = useCallback(
    (id: string, status: "approved" | "rejected") => {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      const app = applications.find((a) => a.id === id);
      if (!app) return;
      pushNotification({
        userId: app.userId,
        kind: "system",
        title: status === "approved" ? "Provider application approved" : "Application rejected",
        body:
          status === "approved"
            ? "You’re cleared for onboarding. Keep your phone verified."
            : "Please update your pitch and re-apply.",
        href: "/become-provider",
      });
    },
    [applications, pushNotification],
  );

  const setProviderVerification = useCallback(
    (providerId: string, patch: VerificationOverride) => {
      setVerificationOverrides((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], ...patch },
      }));
    },
    [],
  );

  const getEffectiveProvider = useCallback(
    (id: string) => {
      const base = getProvider(id);
      if (!base) return undefined;
      const over = verificationOverrides[id];
      const avatarUrl = providerAvatars[id] ?? base.avatarUrl;
      return { ...base, ...over, avatarUrl };
    },
    [verificationOverrides, providerAvatars],
  );

  const getEffectiveProviders = useCallback(
    () =>
      PROVIDERS.map((p) => {
        const over = verificationOverrides[p.id];
        const avatarUrl = providerAvatars[p.id] ?? p.avatarUrl;
        return { ...p, ...over, avatarUrl };
      }),
    [verificationOverrides, providerAvatars],
  );

  const setProviderAvatar = useCallback((providerId: string, avatarUrl: string | undefined) => {
    setProviderAvatars((prev) => {
      if (!avatarUrl) {
        const next = { ...prev };
        delete next[providerId];
        return next;
      }
      return { ...prev, [providerId]: avatarUrl };
    });
  }, []);

  const clearPersistedData = useCallback(() => {
    const fresh = defaultPersisted();
    setBookings(fresh.bookings);
    setTransactions(fresh.transactions);
    setReviews(fresh.reviews);
    setDisputes(fresh.disputes);
    setSafetyAlerts(fresh.safetyAlerts);
    setNotifications(fresh.notifications);
    setThreads(fresh.threads);
    setMessages(fresh.messages);
    setApplications(fresh.applications);
    setVerificationOverrides(fresh.verificationOverrides);
    setProviderAvatars(fresh.providerAvatars);
    setEventRegistrations(fresh.eventRegistrations);
    setAuctionListings(fresh.auctionListings);
  }, []);

  const registerForEvent = useCallback(
    (eventId: string, userId: string) => {
      setEventRegistrations((prev) => {
        if (prev.some((r) => r.eventId === eventId && r.userId === userId)) return prev;
        return [
          {
            id: uid("rsvp"),
            eventId,
            userId,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
      pushNotification({
        userId,
        kind: "system",
        title: "RSVP confirmed",
        body: "You’re registered for a TrustiFix community event.",
        href: "/events",
      });
    },
    [pushNotification],
  );

  const unregisterFromEvent = useCallback((eventId: string, userId: string) => {
    setEventRegistrations((prev) =>
      prev.filter((r) => !(r.eventId === eventId && r.userId === userId)),
    );
  }, []);

  const createAuctionListing = useCallback(
    (input: {
      sellerId: string;
      title: string;
      description: string;
      category: string;
      startingBidCents: number;
      endsAt: string;
      imageUrl?: string;
      images?: string[];
    }) => {
      const fallback =
        input.category === "Electronics"
          ? "/images/categories/tech.jpg"
          : input.category === "Parts"
            ? "/images/categories/vehicle.jpg"
            : input.category === "Other"
              ? "/images/services/locksmith.jpg"
              : "/images/categories/home.jpg";
      const imageUrl = input.imageUrl || fallback;
      const listing: AuctionListing = {
        id: uid("auc"),
        sellerId: input.sellerId,
        title: input.title,
        description: input.description,
        category: input.category,
        startingBidCents: input.startingBidCents,
        endsAt: input.endsAt,
        status: "open",
        bids: [],
        imageUrl,
        images: input.images?.length ? input.images : [imageUrl],
      };
      setAuctionListings((prev) => [listing, ...prev]);
      pushNotification({
        userId: input.sellerId,
        kind: "system",
        title: "Listing published",
        body: input.title,
        href: "/auction",
      });
      return listing;
    },
    [pushNotification],
  );

  const placeBid = useCallback(
    (listingId: string, bidderId: string, amountCents: number) => {
      const listing = auctionListings.find((l) => l.id === listingId);
      if (!listing || listing.status !== "open") throw new Error("Listing not available");
      if (listing.sellerId === bidderId) throw new Error("You can’t bid on your own listing");
      if (!Number.isFinite(amountCents) || amountCents <= 0) throw new Error("Enter a valid bid");

      const top = listing.bids[0]?.amountCents ?? listing.startingBidCents;
      const minNext = listing.bids.length ? top + 500000 : listing.startingBidCents;
      if (amountCents < minNext) {
        throw new Error(`Bid must be at least ${Math.round(minNext / 100).toLocaleString()} UGX`);
      }

      const previousTop = listing.bids[0];
      const bid: AuctionBid = {
        id: uid("bid"),
        bidderId,
        amountCents,
        createdAt: new Date().toISOString(),
      };

      setAuctionListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, bids: [bid, ...l.bids].sort((a, b) => b.amountCents - a.amountCents) }
            : l,
        ),
      );

      pushNotification({
        userId: listing.sellerId,
        kind: "system",
        title: "New bid on your listing",
        body: `${displayName(bidderId)} bid on ${listing.title}`,
        href: "/auction",
      });
      if (previousTop && previousTop.bidderId !== bidderId) {
        pushNotification({
          userId: previousTop.bidderId,
          kind: "system",
          title: "You’ve been outbid",
          body: listing.title,
          href: "/auction",
        });
      }
    },
    [auctionListings, pushNotification],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    );
  }, []);

  const sendMessage = useCallback(
    (threadId: string, senderId: string, body: string) => {
      const text = body.trim();
      if (!text) return;
      const now = new Date().toISOString();
      const thread = threads.find((t) => t.id === threadId);
      if (!thread) return;

      setMessages((prev) => [
        ...prev,
        {
          id: uid("msg"),
          threadId,
          senderId,
          body: text,
          createdAt: now,
          readBy: [senderId],
        },
      ]);
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, updatedAt: now } : t)),
      );

      const recipientId =
        senderId === thread.customerId ? thread.providerId : thread.customerId;
      pushNotification({
        userId: recipientId,
        kind: "message",
        title: `Message from ${displayName(senderId)}`,
        body: text.slice(0, 120),
        href: `/messages?thread=${threadId}`,
        threadId,
        bookingId: thread.bookingId,
      });
    },
    [threads, pushNotification],
  );

  const markThreadRead = useCallback((threadId: string, userId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.threadId === threadId && !m.readBy.includes(userId)
          ? { ...m, readBy: [...m.readBy, userId] }
          : m,
      ),
    );
  }, []);

  const value = useMemo<PlatformContextValue>(
    () => ({
      bookings,
      transactions,
      reviews,
      disputes,
      safetyAlerts,
      notifications,
      threads,
      messages,
      getBalanceCents,
      createBooking,
      openProviderChat,
      updateBookingStatus,
      topUp,
      addReview,
      openDispute,
      triggerPanic,
      acknowledgeSafetyAlert,
      bookingsForCustomer: (customerId) => bookings.filter((b) => b.customerId === customerId),
      bookingsForProvider: (providerId) => bookings.filter((b) => b.providerId === providerId),
      unreadNotificationCount: (userId) =>
        notifications.filter((n) => n.userId === userId && !n.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      threadsForUser: (userId) =>
        threads
          .filter((t) => t.customerId === userId || t.providerId === userId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      messagesForThread: (threadId) =>
        messages
          .filter((m) => m.threadId === threadId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      unreadMessageCount: (userId) => {
        const myThreads = threads.filter(
          (t) => t.customerId === userId || t.providerId === userId,
        );
        return messages.filter(
          (m) =>
            myThreads.some((t) => t.id === m.threadId) &&
            !m.system &&
            m.senderId !== userId &&
            !m.readBy.includes(userId),
        ).length;
      },
      sendMessage,
      markThreadRead,
      threadForBooking: (bookingId) => threads.find((t) => t.bookingId === bookingId),
      applications,
      verificationOverrides,
      submitApplication,
      reviewApplication,
      setProviderVerification,
      getEffectiveProvider,
      getEffectiveProviders,
      setProviderAvatar,
      applicationForUser: (userId) =>
        applications.find((a) => a.userId === userId && a.status !== "rejected") ??
        applications.find((a) => a.userId === userId),
      clearPersistedData,
      eventRegistrations,
      registerForEvent,
      unregisterFromEvent,
      isRegisteredForEvent: (eventId, userId) =>
        eventRegistrations.some((r) => r.eventId === eventId && r.userId === userId),
      registrationCount: (eventId) =>
        eventRegistrations.filter((r) => r.eventId === eventId).length,
      auctionListings,
      createAuctionListing,
      placeBid,
    }),
    [
      bookings,
      transactions,
      reviews,
      disputes,
      safetyAlerts,
      notifications,
      threads,
      messages,
      applications,
      verificationOverrides,
      eventRegistrations,
      auctionListings,
      getBalanceCents,
      createBooking,
      openProviderChat,
      updateBookingStatus,
      topUp,
      addReview,
      openDispute,
      triggerPanic,
      acknowledgeSafetyAlert,
      markNotificationRead,
      markAllNotificationsRead,
      sendMessage,
      markThreadRead,
      submitApplication,
      reviewApplication,
      setProviderVerification,
      getEffectiveProvider,
      getEffectiveProviders,
      setProviderAvatar,
      clearPersistedData,
      registerForEvent,
      unregisterFromEvent,
      createAuctionListing,
      placeBid,
    ],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

export function providerLabel(providerId?: string): string {
  if (!providerId) return "Unassigned";
  return getProvider(providerId)?.name ?? providerId;
}
