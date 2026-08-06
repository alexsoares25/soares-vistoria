-- ============================================================
-- Fecha o acesso publico ao banco.
--
-- Antes: as tres tabelas tinham policy ALL para o role `public`.
-- Como a chave publicavel vai no bundle do site, qualquer pessoa
-- que abrisse a URL conseguia ler, alterar e apagar todos os laudos.
--
-- Depois:
--   - painel  -> exige login e e-mail na lista `admins`
--   - vistoriador -> nao fala com as tabelas, so com as funcoes abaixo,
--                    que exigem o token do link
--   - laudo pronto -> leitura publica por id (o QR precisa abrir),
--                     mas o id e um uuid nao adivinhavel
--
-- APLICAR JUNTO COM O DEPLOY DO APP: enquanto o site publicado for a
-- versao antiga (acesso direto as tabelas com a chave anonima), ele
-- para de funcionar assim que isto rodar.
-- ============================================================

-- PARTE A (aditiva): tabela de admins e funcoes. Nao muda nada do
-- que ja existe, pode ser aplicada antes do deploy.

-- ----------------------------------------------------------
-- 1. lista de quem pode entrar no painel
-- ------------------------------------------------------------
create table if not exists public.admins (
  email      text primary key,
  criado_em  timestamptz not null default now()
);

alter table public.admins enable row level security;

insert into public.admins (email) values ('soaresservicoselocacao@gmail.com')
  on conflict (email) do nothing;

-- security definer para poder ser usada dentro das policies das outras
-- tabelas sem exigir que o usuario consiga ler `admins` diretamente
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists admins_leitura on public.admins;
create policy admins_leitura on public.admins
  for select to authenticated using (public.is_admin());

-- ------------------------------------------------------------
-- ----------------------------------------------------------
-- 3. funcoes que o vistoriador (anonimo) pode chamar
--    o token do link e a credencial: quem nao tem, nao abre nada
-- ------------------------------------------------------------

-- dados da vistoria a partir do token do link
create or replace function public.vistoria_por_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select to_jsonb(t) from (
    select id, tipo, status, placa, chassi, renavam, fabricante, modelo, cor,
           ano_fab, ano_mod, combustivel, km, motor, uf, vistoriador, cliente,
           dados_extra
    from public.vistorias
    where token = p_token
  ) t;
$$;

-- envio do preenchimento; recalcula o parecer no servidor para o
-- cliente nao conseguir forjar um "aprovado"
create or replace function public.enviar_vistoria(
  p_token  text,
  p_dados  jsonb,
  p_extra  jsonb,
  p_itens  jsonb,
  p_fotos  jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id      uuid;
  v_status  text;
  v_tipo    text;
  v_parecer text;
  v_limite  int;
  v_maior   int;
  v_qtd     int;
begin
  select id, status, tipo into v_id, v_status, v_tipo
  from public.vistorias where token = p_token;

  if v_id is null then
    raise exception 'Vistoria nao encontrada';
  end if;
  if v_status = 'concluida' then
    raise exception 'Esta vistoria ja foi concluida';
  end if;

  insert into public.vistoria_itens (vistoria_id, secao, item, resultado, ordem)
  select v_id, x.secao, x.item, x.resultado, x.ordem
  from jsonb_to_recordset(coalesce(p_itens, '[]'::jsonb))
       as x(secao text, item text, resultado text, ordem int);

  insert into public.vistoria_fotos (vistoria_id, legenda, url, ordem, nivel, densidade)
  select v_id, x.legenda, x.url, x.ordem, x.nivel, x.densidade
  from jsonb_to_recordset(coalesce(p_fotos, '[]'::jsonb))
       as x(legenda text, url text, ordem int, nivel smallint, densidade numeric);

  if v_tipo = 'ringelmann' then
    v_limite := coalesce(nullif(p_extra ->> 'limite', '')::int, 2);
    select count(*), coalesce(max(nivel), 0) into v_qtd, v_maior
    from public.vistoria_fotos where vistoria_id = v_id and nivel is not null;
    v_parecer := case when v_qtd > 0 and v_maior > v_limite then 'REPROVADO' else 'APROVADO' end;
  else
    v_parecer := case when exists (
      select 1 from public.vistoria_itens
      where vistoria_id = v_id and resultado in ('NAO CONFORME', 'REMARCADO', 'NAO')
    ) then 'NAO CONFORME' else 'CONFORME' end;
  end if;

  update public.vistorias set
    placa       = upper(coalesce(p_dados ->> 'placa', placa)),
    chassi      = coalesce(p_dados ->> 'chassi', chassi),
    renavam     = coalesce(p_dados ->> 'renavam', renavam),
    fabricante  = coalesce(p_dados ->> 'fabricante', fabricante),
    modelo      = coalesce(p_dados ->> 'modelo', modelo),
    cor         = coalesce(p_dados ->> 'cor', cor),
    ano_fab     = coalesce(p_dados ->> 'ano_fab', ano_fab),
    ano_mod     = coalesce(p_dados ->> 'ano_mod', ano_mod),
    combustivel = coalesce(p_dados ->> 'combustivel', combustivel),
    km          = coalesce(p_dados ->> 'km', km),
    motor       = coalesce(p_dados ->> 'motor', motor),
    uf          = coalesce(p_dados ->> 'uf', uf),
    vistoriador = coalesce(p_dados ->> 'vistoriador', vistoriador),
    observacoes = coalesce(p_dados ->> 'observacoes', observacoes),
    dados_extra = coalesce(p_extra, dados_extra),
    status       = 'concluida',
    parecer      = v_parecer,
    concluido_em = now()
  where id = v_id;

  return v_id;
end;
$$;

-- laudo pronto para leitura publica (o QR de validacao precisa abrir)
create or replace function public.laudo_por_id(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'vistoria', (
      select to_jsonb(t) from (
        select id, tipo, status, parecer, placa, chassi, renavam, fabricante,
               modelo, cor, ano_fab, ano_mod, combustivel, km, motor, uf,
               vistoriador, cliente, observacoes, dados_extra,
               criado_em, concluido_em
        from public.vistorias
        where id = p_id and status = 'concluida'
      ) t
    ),
    'itens', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.ordem)
      from (select id, secao, item, resultado, ordem
            from public.vistoria_itens where vistoria_id = p_id) i
    ), '[]'::jsonb),
    'fotos', coalesce((
      select jsonb_agg(to_jsonb(f) order by f.ordem)
      from (select id, legenda, url, ordem, nivel, densidade
            from public.vistoria_fotos where vistoria_id = p_id) f
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.vistoria_por_token(text)                     to anon, authenticated;
grant execute on function public.enviar_vistoria(text, jsonb, jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.laudo_por_id(uuid)                           to anon, authenticated;
-- funcoes nascem com execute para PUBLIC; revogar so de anon nao basta,
-- porque anon herda de PUBLIC
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant  execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- 4. pendencia apontada pelo advisor do Supabase
-- ------------------------------------------------------------
-- ATENCAO: pgcrypto vive no schema `extensions`. Sem ele aqui, a funcao
-- nao acha gen_random_bytes e a criacao de vistorias quebra.
alter function public.gen_token_urlsafe() set search_path = public, extensions, pg_temp;
