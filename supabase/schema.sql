-- TrustiFix / TrustyFix Connect — Supabase schema (Phase 1+)
-- Run in Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

-- Roles
create type public.user_role as enum ('customer', 'provider', 'admin');
create type public.booking_status as enum (
  'pending', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled', 'disputed'
);
create type public.wallet_txn_type as enum ('topup', 'hold', 'refund', 'payout');
create type public.notification_kind as enum ('booking', 'message', 'safety', 'wallet', 'system');
create type public.application_status as enum ('pending', 'approved', 'rejected');

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'customer',
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  area text not null,
  lat double precision,
  lng double precision,
  bio text not null default '',
  skills text[] not null default '{}',
  starting_price_cents integer not null default 0,
  response_mins integer not null default 30,
  rating numeric(2,1) not null default 5.0,
  review_count integer not null default 0,
  verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  provider_id uuid references public.providers (id),
  service_category text not null,
  status public.booking_status not null default 'pending',
  scheduled_at timestamptz,
  location_label text not null,
  notes text,
  price_hold_cents integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  type public.wallet_txn_type not null,
  amount_cents integer not null check (amount_cents >= 0),
  label text not null,
  booking_id uuid references public.bookings (id),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  provider_id uuid not null references public.providers (id),
  customer_id uuid not null references public.profiles (id),
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  opened_by uuid not null references public.profiles (id),
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.safety_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  note text not null,
  lat double precision not null,
  lng double precision not null,
  area_label text not null,
  status text not null default 'open' check (status in ('open', 'acknowledged')),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text not null,
  href text,
  booking_id uuid references public.bookings (id),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  customer_id uuid not null references public.profiles (id),
  provider_profile_id uuid not null references public.profiles (id),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender_id uuid references public.profiles (id),
  body text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.provider_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  category text not null,
  area text not null,
  pitch text not null,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.auction_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id),
  title text not null,
  description text not null default '',
  category text not null,
  starting_bid_cents integer not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'ended')),
  created_at timestamptz not null default now()
);

create table public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.auction_listings (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id),
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: current user's role
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.bookings enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.safety_alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.provider_applications enable row level security;
alter table public.event_registrations enable row level security;
alter table public.auction_listings enable row level security;
alter table public.auction_bids enable row level security;

-- Profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (id = auth.uid());

-- Providers: public read
create policy "Providers are public"
  on public.providers for select using (true);
create policy "Providers manage own row"
  on public.providers for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
create policy "Admins manage providers"
  on public.providers for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Bookings
create policy "Booking participants can read"
  on public.bookings for select to authenticated
  using (
    customer_id = auth.uid()
    or provider_id in (select id from public.providers where profile_id = auth.uid())
    or public.current_role() = 'admin'
  );
create policy "Customers create bookings"
  on public.bookings for insert to authenticated
  with check (customer_id = auth.uid());
create policy "Participants update bookings"
  on public.bookings for update to authenticated
  using (
    customer_id = auth.uid()
    or provider_id in (select id from public.providers where profile_id = auth.uid())
    or public.current_role() = 'admin'
  );

-- Wallet
create policy "Own wallet rows"
  on public.wallet_transactions for select to authenticated
  using (user_id = auth.uid() or public.current_role() = 'admin');
create policy "Insert own wallet rows"
  on public.wallet_transactions for insert to authenticated
  with check (user_id = auth.uid() or public.current_role() = 'admin');

-- Reviews public read
create policy "Reviews public"
  on public.reviews for select using (true);
create policy "Customers insert reviews"
  on public.reviews for insert to authenticated
  with check (customer_id = auth.uid());

-- Notifications
create policy "Own notifications"
  on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Update own notifications"
  on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "Insert notifications (app)"
  on public.notifications for insert to authenticated with check (true);

-- Chat
create policy "Thread participants"
  on public.chat_threads for select to authenticated
  using (customer_id = auth.uid() or provider_profile_id = auth.uid() or public.current_role() = 'admin');
create policy "Messages via thread"
  on public.chat_messages for select to authenticated
  using (
    thread_id in (
      select id from public.chat_threads
      where customer_id = auth.uid() or provider_profile_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );
create policy "Send messages"
  on public.chat_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    or is_system = true
  );

-- Applications
create policy "Own applications"
  on public.provider_applications for select to authenticated
  using (user_id = auth.uid() or public.current_role() = 'admin');
create policy "Submit applications"
  on public.provider_applications for insert to authenticated
  with check (user_id = auth.uid());
create policy "Admin review applications"
  on public.provider_applications for update to authenticated
  using (public.current_role() = 'admin');

-- Safety / disputes — admin heavy
create policy "Safety read"
  on public.safety_alerts for select to authenticated
  using (user_id = auth.uid() or public.current_role() = 'admin');
create policy "Safety insert"
  on public.safety_alerts for insert to authenticated
  with check (user_id = auth.uid());
create policy "Safety admin update"
  on public.safety_alerts for update to authenticated
  using (public.current_role() = 'admin');

create policy "Disputes read"
  on public.disputes for select to authenticated
  using (opened_by = auth.uid() or public.current_role() = 'admin');
create policy "Disputes insert"
  on public.disputes for insert to authenticated
  with check (opened_by = auth.uid());

-- Events / auction
create policy "Event regs own"
  on public.event_registrations for all to authenticated
  using (user_id = auth.uid() or public.current_role() = 'admin')
  with check (user_id = auth.uid());

create policy "Auction listings public"
  on public.auction_listings for select using (true);
create policy "Create listings"
  on public.auction_listings for insert to authenticated
  with check (seller_id = auth.uid());
create policy "Bids public"
  on public.auction_bids for select using (true);
create policy "Place bids"
  on public.auction_bids for insert to authenticated
  with check (bidder_id = auth.uid());

-- Realtime (optional): Dashboard → Database → Replication → enable for notifications, chat_messages, bookings
