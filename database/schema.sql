create table if not exists services (
                                        id            serial primary key,
                                        name          text not null,
                                        icon          text default '🏛',
                                        wait_time_min int  default 10,
                                        queue_count   int  default 0,
                                        is_open       boolean default true,
                                        accent_color  text default '#6c63ff'
);

create table if not exists queue_entries (
                                             id         uuid primary key default gen_random_uuid(),
    user_id    uuid references auth.users(id) on delete cascade,
    service_id int  references services(id),
    position   int  not null,
    status     text default 'waiting',
    joined_at  timestamptz default now()
    );

alter table queue_entries enable row level security;
alter table services       enable row level security;

create policy "Users manage own entries"
  on queue_entries for all using (auth.uid() = user_id);

create policy "Public can view services"
  on services for select using (true);

insert into services (name, icon, wait_time_min, queue_count, accent_color) values
                                                                                ('Registrar Office', '📋', 15, 8,  '#6c63ff'),
                                                                                ('Financial Aid',    '💰', 25, 12, '#f5a623'),
                                                                                ('Cashier',          '🧾', 10, 5,  '#2dd4a0'),
                                                                                ('Library Services', '📚', 5,  3,  '#38bdf8'),
                                                                                ('IT Help Desk',     '💻', 20, 9,  '#ff6b6b'),
                                                                                ('Student Affairs',  '🎓', 30, 15, '#c084fc')
    on conflict do nothing;