create table if not exists public.analytics_events_daily (
  date date not null,
  name text not null,
  value text not null default 'none',
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (date, name, value)
);

create index if not exists analytics_events_daily_date_idx
  on public.analytics_events_daily (date desc);

create index if not exists analytics_events_daily_name_idx
  on public.analytics_events_daily (name);
