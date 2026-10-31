create table if not exists public.concursos_instagram_coletas (
  request_id bigint primary key,
  processado_em timestamptz not null default now(),
  quantidade integer not null default 0
);
alter table public.concursos_instagram_coletas enable row level security;
revoke all on public.concursos_instagram_coletas from anon, authenticated;
grant all on public.concursos_instagram_coletas to service_role;

create or replace function public.processar_respostas_concursos_instagram()
returns integer
language plpgsql
security invoker
set search_path = public, net, pg_temp
as $$
declare
  r record;
  payload jsonb;
  c jsonb;
  contest_key text;
  inserted_count integer := 0;
  row_count integer := 0;
begin
  for r in
    select h.id, h.content
    from net._http_response h
    left join public.concursos_instagram_coletas p on p.request_id = h.id
    where p.request_id is null and h.status_code between 200 and 299 and h.content is not null
    order by h.created asc limit 20
  loop
    begin
      payload := r.content::jsonb;
      if coalesce((payload->>'ok')::boolean,false) is not true or jsonb_typeof(payload->'concursos') <> 'array' then
        insert into public.concursos_instagram_coletas(request_id,quantidade) values (r.id,0) on conflict do nothing;
        continue;
      end if;
      row_count := 0;
      for c in select value from jsonb_array_elements(payload->'concursos')
      loop
        contest_key := coalesce(nullif(trim(c->>'id'),''), lower(concat_ws('|',c->>'orgao',c->>'cargo',c->>'uf',c->>'inscricoes_fim')));
        if contest_key is null or contest_key = '' or coalesce(c->>'inscricoes_fim','') = '' then continue; end if;
        insert into public.concursos_instagram_publicacoes(concurso_id,chave_normalizada,concurso_snapshot,origem_execucao)
        values (contest_key,lower(contest_key),c,'cron_supabase_09h')
        on conflict (chave_normalizada) do nothing;
        if found then row_count := row_count + 1; end if;
      end loop;
      insert into public.concursos_instagram_coletas(request_id,quantidade) values (r.id,row_count) on conflict do nothing;
      inserted_count := inserted_count + row_count;
    exception when others then
      raise warning 'Falha ao processar resposta concursos request_id=%: %',r.id,sqlerrm;
      insert into public.concursos_instagram_coletas(request_id,quantidade) values (r.id,0) on conflict do nothing;
    end;
  end loop;
  return inserted_count;
end;
$$;
revoke all on function public.processar_respostas_concursos_instagram() from public, anon, authenticated;
grant execute on function public.processar_respostas_concursos_instagram() to postgres, service_role;

do $$
declare j record;
begin
  for j in select jobid from cron.job where jobname in ('aprovaja-concursos-api-09h','aprovaja-processar-respostas-concursos')
  loop perform cron.unschedule(j.jobid); end loop;
end $$;
select cron.schedule('aprovaja-concursos-api-09h','0 12 * * *',
  $$select net.http_get(url := 'https://nukddukqilhsdklocout.supabase.co/functions/v1/listar-concursos-publicos');$$);
select cron.schedule('aprovaja-processar-respostas-concursos','* * * * *',
  $$select public.processar_respostas_concursos_instagram();$$);
