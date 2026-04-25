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

create index if not exists analytics_events_daily_name_date_idx
  on public.analytics_events_daily (name, date desc);

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
declare
  v_name text := left(trim(p_name), 255);
  v_value text := left(trim(p_value), 255);
begin
  if char_length(v_name) = 0 or char_length(v_value) = 0 then
    raise exception 'p_name and p_value must be non-empty';
  end if;
  if char_length(p_name) > 255 or char_length(p_value) > 255 then
    raise exception 'p_name and p_value must be <= 255 characters';
  end if;

  insert into public.analytics_events_daily (date, name, value, count, updated_at)
  values (p_date, v_name, v_value, 1, now())
  on conflict (date, name, value)
  do update set
    count = public.analytics_events_daily.count + 1,
    updated_at = now();
end;
$$;

revoke all on function public.increment_analytics_event(date, text, text) from public;
revoke all on function public.increment_analytics_event(date, text, text) from anon;
revoke all on function public.increment_analytics_event(date, text, text) from authenticated;
grant execute on function public.increment_analytics_event(date, text, text) to service_role;
