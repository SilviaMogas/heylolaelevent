-- HeyLola × ElevenLabs challenge demo: own schema inside the shared
-- "Subirachs Ventures" Supabase project (dhvwycxkkbqzvmrkysym).
--
-- Access model: server-only. The Next.js route /api/session writes through
-- PostgREST with the service_role key (Accept-Profile / Content-Profile:
-- heylola_eleven). anon/authenticated get no privileges on this schema.
--
-- Do NOT set pgrst.db_schemas here: the list is shared by every product in the
-- project. Add `heylola_eleven` to it from Settings -> API (or the Management
-- API) instead.

create schema if not exists heylola_eleven;

create table if not exists heylola_eleven.conversations (
  id             uuid primary key default gen_random_uuid(),
  mode           text not null check (mode in ('live', 'demo')),
  lang           text not null check (lang in ('en', 'ar')),
  keep_transcript boolean not null default false,
  handover       boolean not null default false,
  started_at     timestamptz not null default now(),
  ended_at       timestamptz
);

create table if not exists heylola_eleven.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references heylola_eleven.conversations(id) on delete cascade,
  role            text not null check (role in ('agent', 'user')),
  text            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on heylola_eleven.messages (conversation_id, created_at);

-- A "lead" is a handover request: the agent could not verify something and
-- pointed the user to Dubai Municipality / HeyLola support.
create table if not exists heylola_eleven.leads (
  id              bigint generated always as identity primary key,
  conversation_id uuid references heylola_eleven.conversations(id) on delete set null,
  reason          text,
  lang            text not null check (lang in ('en', 'ar')),
  created_at      timestamptz not null default now()
);

alter table heylola_eleven.conversations enable row level security;
alter table heylola_eleven.messages      enable row level security;
alter table heylola_eleven.leads         enable row level security;

grant usage on schema heylola_eleven to service_role;
grant all on all tables in schema heylola_eleven to service_role;
grant usage, select on all sequences in schema heylola_eleven to service_role;
alter default privileges in schema heylola_eleven grant all on tables to service_role;
alter default privileges in schema heylola_eleven grant usage, select on sequences to service_role;
