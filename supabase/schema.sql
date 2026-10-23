-- =============================================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE (PostgreSQL + Row Level Security)
-- App List: PWA de Listas Dinâmicas por Categorias
-- =============================================================================

-- 1. Habilitar extensão para geração de UUIDs
create extension if not exists "pgcrypto";

-- 2. Criar tabela de Categorias (categories)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  color text not null default 'indigo',
  icon text not null default 'folder',
  created_at timestamptz not null default now()
);

-- 3. Criar tabela de Itens (items)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Índices de performance para buscas por usuário e categoria
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_items_category_id on public.items(category_id);
create index if not exists idx_items_user_id on public.items(user_id);

-- 5. Ativar Row Level Security (RLS) nas duas tabelas
alter table public.categories enable row level security;
alter table public.items enable row level security;

-- 6. Políticas RLS Estritas para a tabela `categories`
create policy "Usuários podem visualizar apenas suas próprias categorias"
  on public.categories
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar apenas suas próprias categorias"
  on public.categories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar apenas suas próprias categorias"
  on public.categories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar apenas suas próprias categorias"
  on public.categories
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 7. Políticas RLS Estritas para a tabela `items`
create policy "Usuários podem visualizar apenas seus próprios itens"
  on public.items
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem inserir itens apenas em suas próprias categorias"
  on public.items
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = auth.uid()
    )
  );

create policy "Usuários podem atualizar apenas seus próprios itens"
  on public.items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar apenas seus próprios itens"
  on public.items
  for delete
  to authenticated
  using (auth.uid() = user_id);
