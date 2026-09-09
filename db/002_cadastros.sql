-- ============================================================
-- Cadastros de Empresa e Veiculo
--
-- Antes: cada laudo redigitava proprietario e veiculo por inteiro.
-- Depois: empresa e veiculo viram cadastro proprio e o laudo apenas
-- aponta para eles, entao a segunda vistoria do mesmo onibus nao
-- exige redigitar nada.
--
-- Seguro rodar com o site no ar: e tudo aditivo. As vistorias
-- existentes continuam com os dados que ja tem nas suas colunas.
-- ============================================================

create table if not exists public.empresas (
  id             uuid primary key default gen_random_uuid(),
  razao_social   text not null,
  nome_fantasia  text,
  cpf_cnpj       text,
  endereco       text,
  bairro         text,
  cidade         text,
  estado         text,
  cep            text,
  responsavel    text,
  telefone       text,
  celular        text,
  email          text,
  observacoes    text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create unique index if not exists empresas_cnpj_idx
  on public.empresas (cpf_cnpj) where cpf_cnpj is not null and cpf_cnpj <> '';

create table if not exists public.veiculos (
  id                     uuid primary key default gen_random_uuid(),
  empresa_id             uuid references public.empresas(id) on delete set null,
  placa                  text not null,
  renavam                text,
  chassi                 text,
  marca                  text,
  modelo                 text,
  numero_motor           text,
  cor                    text,
  carroceria             text,
  ano_fabricacao         text,
  ano_modelo             text,
  tipo                   text,
  combustivel            text,
  potencia               text,
  cilindrada             text,
  categoria              text,
  capacidade_passageiros integer,
  especie                text,
  nacionalidade          text,
  municipio              text,
  situacao               text,
  restricoes             text,
  km                     text,
  tacografo              text,
  data_aquisicao         date,
  data_aquisicao_0km     date,
  data_transferencia     date,
  observacoes            text,
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);

create unique index if not exists veiculos_placa_idx on public.veiculos (upper(placa));
create index if not exists veiculos_empresa_idx on public.veiculos (empresa_id);

-- o laudo passa a apontar para os cadastros; as colunas antigas
-- continuam existindo para nao invalidar os laudos ja emitidos
alter table public.vistorias
  add column if not exists empresa_id uuid references public.empresas(id) on delete set null,
  add column if not exists veiculo_id uuid references public.veiculos(id) on delete set null;

create index if not exists vistorias_empresa_idx on public.vistorias (empresa_id);
create index if not exists vistorias_veiculo_idx on public.vistorias (veiculo_id);

-- ------------------------------------------------------------
-- acesso: cadastros sao area do painel, entao so admin logado
-- ------------------------------------------------------------
alter table public.empresas enable row level security;
alter table public.veiculos enable row level security;

drop policy if exists empresas_admin on public.empresas;
create policy empresas_admin on public.empresas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists veiculos_admin on public.veiculos;
create policy veiculos_admin on public.veiculos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.empresas from anon;
revoke all on public.veiculos from anon;

-- ------------------------------------------------------------
-- o vistoriador (anonimo) nao le as tabelas, mas precisa dos dados
-- do veiculo no formulario: a funcao do token passa a devolve-los
-- ------------------------------------------------------------
create or replace function public.vistoria_por_token(p_token text)
returns jsonb language sql stable security definer
set search_path = public, pg_temp as $$
  select to_jsonb(t) || jsonb_build_object(
           'empresa', (select to_jsonb(e) from public.empresas e where e.id = t.empresa_id),
           'veiculo', (select to_jsonb(ve) from public.veiculos ve where ve.id = t.veiculo_id)
         )
  from (
    select id, tipo, status, placa, chassi, renavam, fabricante, modelo, cor,
           ano_fab, ano_mod, combustivel, km, motor, uf, vistoriador, cliente,
           dados_extra, empresa_id, veiculo_id
    from public.vistorias where token = p_token
  ) t;
$$;

grant execute on function public.vistoria_por_token(text) to anon, authenticated;
