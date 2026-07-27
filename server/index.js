import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { loadDb, saveDb, uid } from "./db.js";

const PORT = Number(process.env.PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET || "trustifix-dev-secret-change-me";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sign in required." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = loadDb();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: "Session expired." });
    req.user = user;
    req.db = db;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token." });
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const db = loadDb();
      req.user = db.users.find((u) => u.id === payload.sub) || null;
      req.db = db;
    } catch {
      req.user = null;
    }
  }
  next();
}

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/[\s()-]/g, "")
    .trim();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "trustifix-api", mode: "json-file" });
});

app.post("/api/auth/signup", async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const username = String(req.body.username || "")
    .trim()
    .toLowerCase();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");

  if (!fullName) return res.status(400).json({ error: "Enter your full name." });
  if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters." });
  if (!/^[a-z0-9._]+$/i.test(username)) {
    return res.status(400).json({ error: "Username can only use letters, numbers, dots, and underscores." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email." });
  if (phone.replace(/\D/g, "").length < 9) return res.status(400).json({ error: "Enter a valid phone number." });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (username === "admin") return res.status(400).json({ error: "That username is reserved." });

  const db = loadDb();
  const taken = db.users.some(
    (u) =>
      u.username === username ||
      u.email === email ||
      normalizePhone(u.phone) === phone,
  );
  if (taken) return res.status(409).json({ error: "An account with that username, email, or phone already exists." });

  const user = {
    id: uid("user"),
    fullName,
    username,
    email,
    phone,
    role: "customer",
    passwordHash: await bcrypt.hash(password, 10),
    emailVerified: true,
    phoneVerified: false,
    walletBalanceCents: 0,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb(db);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const login = String(req.body.login || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const phoneKey = normalizePhone(req.body.login);
  if (!login || !password) {
    return res.status(400).json({ error: "Enter your email/username/phone and password." });
  }

  const db = loadDb();
  const user = db.users.find(
    (u) =>
      u.email === login ||
      u.username === login ||
      normalizePhone(u.phone) === phoneKey,
  );
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid login or password." });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.patch("/api/auth/me", auth, (req, res) => {
  const db = req.db;
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (req.body.fullName != null) user.fullName = String(req.body.fullName).trim() || user.fullName;
  if (req.body.username != null) {
    user.username = String(req.body.username).trim().toLowerCase() || user.username;
  }
  if (req.body.phone != null) user.phone = normalizePhone(req.body.phone);
  if (req.body.avatarUrl != null) user.avatarUrl = String(req.body.avatarUrl);

  saveDb(db);
  res.json({ user: publicUser(user) });
});

app.get("/api/providers", optionalAuth, (_req, res) => {
  const db = loadDb();
  res.json({ providers: db.providers });
});

app.get("/api/providers/:id", (req, res) => {
  const db = loadDb();
  const provider = db.providers.find((p) => p.id === req.params.id);
  if (!provider) return res.status(404).json({ error: "Provider not found." });
  res.json({ provider });
});

app.get("/api/bookings", auth, (req, res) => {
  const db = req.db;
  const role = req.user.role;
  let bookings = db.bookings;
  if (role === "customer") {
    bookings = bookings.filter((b) => b.customerId === req.user.id);
  } else if (role === "provider") {
    const myProviders = db.providers.filter((p) => p.profileId === req.user.id).map((p) => p.id);
    bookings = bookings.filter((b) => myProviders.includes(b.providerId));
  }
  res.json({ bookings });
});

app.post("/api/bookings", auth, (req, res) => {
  if (req.user.role !== "customer" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Only customers can create bookings." });
  }

  const db = req.db;
  const providerId = String(req.body.providerId || "");
  const provider = db.providers.find((p) => p.id === providerId);
  if (!provider) return res.status(404).json({ error: "Provider not found." });

  const hold = Number(req.body.priceHoldCents ?? provider.startingPriceCents);
  const customer = db.users.find((u) => u.id === req.user.id);
  if (!customer) return res.status(404).json({ error: "User not found." });
  if ((customer.walletBalanceCents || 0) < hold) {
    return res.status(400).json({ error: "Insufficient wallet balance for hold." });
  }

  customer.walletBalanceCents -= hold;
  const booking = {
    id: uid("book"),
    customerId: customer.id,
    providerId: provider.id,
    serviceCategory: provider.category,
    status: "pending",
    locationLabel: String(req.body.locationLabel || provider.area),
    notes: String(req.body.notes || ""),
    priceHoldCents: hold,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  db.walletTxns.push({
    id: uid("txn"),
    userId: customer.id,
    type: "hold",
    amountCents: hold,
    label: `Hold for ${provider.name}`,
    bookingId: booking.id,
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
  res.status(201).json({ booking });
});

app.patch("/api/bookings/:id/status", auth, (req, res) => {
  const db = req.db;
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  const next = String(req.body.status || "");
  const allowed = ["pending", "accepted", "en_route", "in_progress", "completed", "cancelled", "disputed"];
  if (!allowed.includes(next)) return res.status(400).json({ error: "Invalid status." });

  const provider = db.providers.find((p) => p.id === booking.providerId);
  const isCustomer = booking.customerId === req.user.id;
  const isProvider = provider && provider.profileId === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isCustomer && !isProvider && !isAdmin) {
    return res.status(403).json({ error: "Not allowed." });
  }

  const prev = booking.status;
  booking.status = next;
  booking.updatedAt = new Date().toISOString();

  if (next === "completed" && prev !== "completed") {
    const payout = Math.round(booking.priceHoldCents * 0.9);
    const providerUser = db.users.find((u) => u.id === provider?.profileId);
    if (providerUser) {
      providerUser.walletBalanceCents = (providerUser.walletBalanceCents || 0) + payout;
      db.walletTxns.push({
        id: uid("txn"),
        userId: providerUser.id,
        type: "payout",
        amountCents: payout,
        label: `Payout for booking ${booking.id}`,
        bookingId: booking.id,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (next === "cancelled" && prev !== "cancelled" && booking.priceHoldCents) {
    const customer = db.users.find((u) => u.id === booking.customerId);
    if (customer) {
      customer.walletBalanceCents = (customer.walletBalanceCents || 0) + booking.priceHoldCents;
      db.walletTxns.push({
        id: uid("txn"),
        userId: customer.id,
        type: "refund",
        amountCents: booking.priceHoldCents,
        label: `Refund for cancelled booking`,
        bookingId: booking.id,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDb(db);
  res.json({ booking });
});

app.get("/api/wallet", auth, (req, res) => {
  const db = req.db;
  const txns = db.walletTxns.filter((t) => t.userId === req.user.id).reverse();
  res.json({
    balanceCents: req.user.walletBalanceCents || 0,
    transactions: txns,
  });
});

app.post("/api/wallet/topup", auth, (req, res) => {
  const amount = Number(req.body.amountCents || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Enter a valid top-up amount." });
  }
  const db = req.db;
  const user = db.users.find((u) => u.id === req.user.id);
  user.walletBalanceCents = (user.walletBalanceCents || 0) + amount;
  const txn = {
    id: uid("txn"),
    userId: user.id,
    type: "topup",
    amountCents: amount,
    label: String(req.body.label || "Wallet top-up"),
    createdAt: new Date().toISOString(),
  };
  db.walletTxns.push(txn);
  saveDb(db);
  res.status(201).json({ balanceCents: user.walletBalanceCents, transaction: txn });
});

app.post("/api/safety/panic", auth, (req, res) => {
  const db = req.db;
  const alert = {
    id: uid("alert"),
    userId: req.user.id,
    note: String(req.body.note || "Panic alert"),
    lat: Number(req.body.lat || 0),
    lng: Number(req.body.lng || 0),
    areaLabel: String(req.body.areaLabel || "Unknown"),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.safetyAlerts.push(alert);
  saveDb(db);
  res.status(201).json({ alert });
});

app.get("/api/admin/overview", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only." });
  const db = req.db;
  res.json({
    users: db.users.map(publicUser),
    providers: db.providers,
    bookings: db.bookings,
    safetyAlerts: db.safetyAlerts,
    applications: db.applications,
  });
});

app.post("/api/applications", auth, (req, res) => {
  const db = req.db;
  const application = {
    id: uid("app"),
    userId: req.user.id,
    fullName: String(req.body.fullName || req.user.fullName),
    category: String(req.body.category || ""),
    area: String(req.body.area || ""),
    pitch: String(req.body.pitch || ""),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.applications.push(application);
  saveDb(db);
  res.status(201).json({ application });
});

app.listen(PORT, () => {
  console.log(`TrustiFix API listening on http://localhost:${PORT}`);
});
