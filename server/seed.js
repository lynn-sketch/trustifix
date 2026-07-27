import bcrypt from "bcryptjs";
import { loadDb, saveDb, uid } from "./db.js";

const providers = [
  {
    id: "prov-nakawa-ac",
    name: "Alex Okello",
    title: "Mobile Auto AC Specialist",
    category: "Vehicle Services",
    area: "Nakawa",
    lat: 0.337,
    lng: 32.62,
    rating: 4.9,
    reviewCount: 128,
    verified: true,
    phoneVerified: true,
    bio: "On-site AC diagnosis and gas refill for all makes.",
    skills: ["AC recharge", "Compressor check", "Leak test"],
    startingPriceCents: 8500000,
    responseMins: 12,
  },
  {
    id: "prov-ntinda-mech",
    name: "Emma Nalubega",
    title: "Certified Mechanic",
    category: "Vehicle Services",
    area: "Ntinda",
    lat: 0.353,
    lng: 32.615,
    rating: 4.8,
    reviewCount: 96,
    verified: true,
    phoneVerified: true,
    bio: "Brakes, suspension, and general servicing.",
    skills: ["Brakes", "Oil service", "Diagnostics"],
    startingPriceCents: 12000000,
    responseMins: 18,
  },
  {
    id: "prov-bugolobi-plumb",
    name: "Paul Ssali",
    title: "Emergency Plumber",
    category: "Home Services",
    area: "Bugolobi",
    lat: 0.315,
    lng: 32.62,
    rating: 4.7,
    reviewCount: 84,
    verified: true,
    phoneVerified: true,
    bio: "Burst pipes, blocked drains, same-day callouts.",
    skills: ["Pipes", "Drains", "Water heaters"],
    startingPriceCents: 7000000,
    responseMins: 20,
  },
];

const db = loadDb();
const hash = await bcrypt.hash("demo123", 10);
const adminHash = await bcrypt.hash("admin35", 10);

db.users = [
  {
    id: "admin-1",
    fullName: "Demo Admin",
    username: "admin",
    email: "admin@trustifix.test",
    phone: "+256700000000",
    role: "admin",
    passwordHash: adminHash,
    emailVerified: true,
    phoneVerified: true,
    walletBalanceCents: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cust-1",
    fullName: "Demo Customer",
    username: "demo_customer",
    email: "customer@trustifix.test",
    phone: "+256700000001",
    role: "customer",
    passwordHash: hash,
    emailVerified: true,
    phoneVerified: false,
    walletBalanceCents: 25000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prov-user-1",
    fullName: "Alex Okello",
    username: "alex_okello",
    email: "alex@trustifix.test",
    phone: "+256700000002",
    role: "provider",
    passwordHash: hash,
    emailVerified: true,
    phoneVerified: true,
    walletBalanceCents: 15000000,
    providerId: "prov-nakawa-ac",
    createdAt: new Date().toISOString(),
  },
];

db.providers = providers.map((p) => ({
  ...p,
  profileId: p.id === "prov-nakawa-ac" ? "prov-user-1" : uid("profile"),
}));
db.bookings = [];
db.walletTxns = [
  {
    id: uid("txn"),
    userId: "cust-1",
    type: "topup",
    amountCents: 25000000,
    label: "Welcome top-up",
    createdAt: new Date().toISOString(),
  },
];
db.safetyAlerts = [];
db.applications = [];

saveDb(db);
console.log("Seeded TrustiFix API database at server/data/db.json");
console.log("Demo logins: admin/admin35 · customer@trustifix.test/demo123 · alex@trustifix.test/demo123");
