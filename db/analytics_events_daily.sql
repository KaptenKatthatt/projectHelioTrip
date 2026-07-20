-- Analytics aggregate table for HelioTrip.
-- Run this once against your Postgres database (e.g. in the Neon SQL editor).
-- Plain Postgres: no provider-specific roles or extensions required.
--
-- The application increments rows with an atomic INSERT ... ON CONFLICT upsert,
-- so no stored function is needed.

create table if not exists analytics_events_daily (
  date date not null,
  name text not null,
  value text not null default 'nbr_times_activated',
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (date, name, value)
);

create index if not exists analytics_events_daily_date_idx
  on analytics_events_daily (date desc);

create index if not exists analytics_events_daily_name_idx
  on analytics_events_daily (name);

create index if not exists analytics_events_daily_name_date_idx
  on analytics_events_daily (name, date desc);
