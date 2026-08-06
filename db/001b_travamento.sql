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

-- PARTE B (destrutiva): fecha o acesso anonimo as tabelas.
-- APLICAR SOMENTE JUNTO COM O DEPLOY DO APP NOVO.

-- ----------------------------------------------------------
-- 2. troca as policies abertas por acesso so de admin logado
-- ------------------------------------------------------------
drop policy if exists vistorias_all on public.vistorias;
drop policy if exists itens_all     on public.vistoria_itens;
drop policy if exists fotos_all     on public.vistoria_fotos;

drop policy if exists vistorias_admin on public.vistorias;
create policy vistorias_admin on public.vistorias
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists itens_admin on public.vistoria_itens;
create policy itens_admin on public.vistoria_itens
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists fotos_admin on public.vistoria_fotos;
create policy fotos_admin on public.vistoria_fotos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- sem grant, o anonimo nem chega a avaliar policy
revoke all on public.vistorias      from anon;
revoke all on public.vistoria_itens from anon;
revoke all on public.vistoria_fotos from anon;
revoke all on public.admins         from anon;

-- ------------------------------------------------------------
