create table if not exists public.concursos_instagram_publicacoes (
  id uuid primary key default gen_random_uuid(),
  concurso_id text not null unique,
  chave_normalizada text not null unique,
  concurso_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'detectado' check (status in ('detectado','em_fila','arte_gerada','publicado','falha','expirado','ignorado')),
  imagem_url text,
  instagram_media_id text,
  instagram_permalink text,
  tentativas integer not null default 0,
  erro_ultima_tentativa text,
  detectado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  publicado_em timestamptz,
  origem_execucao text
);
create index if not exists concursos_instagram_status_detectado_idx on public.concursos_instagram_publicacoes(status, detectado_em desc);
create index if not exists concursos_instagram_deadline_idx on public.concursos_instagram_publicacoes ((concurso_snapshot->>'inscricoes_fim'));
alter table public.concursos_instagram_publicacoes enable row level security;
revoke all on public.concursos_instagram_publicacoes from anon, authenticated;
grant all on public.concursos_instagram_publicacoes to service_role;