create table if not exists public.analytics_events_daily (
  date date not null,
  name text not null,
  value text not null default 'nbr_times_activated',
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (date, name, value)
);

create index if not exists analytics_events_daily_date_idx
  on public.analytics_events_daily (date desc);

create index if not exists analytics_events_daily_name_idx
  on public.analytics_events_daily (name);

create or replace function public.increment_analytics_event(
  p_date date,
  p_name text,
  p_value text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.analytics_events_daily (date, name, value, count, updated_at)
  values (p_date, p_name, p_value, 1, now())
  on conflict (date, name, value)
  do update set
    count = public.analytics_events_daily.count + 1,
    updated_at = now();
end;
$$;
