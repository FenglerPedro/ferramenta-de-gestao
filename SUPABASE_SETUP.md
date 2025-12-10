# Configuração do Supabase

Siga estes passos para configurar o backend da aplicação:

1.  **Criar Projeto**:
    *   Acesse [database.new](https://database.new) e crie um novo projeto no Supabase.

2.  **Configurar Variáveis de Ambiente**:
    *   Copie o arquivo `.env.example` para `.env`.
    *   No painel do Supabase, vá em **Project Settings > API**.
    *   Copie `Project URL` para `VITE_SUPABASE_URL`.
    *   Copie `anon public` key para `VITE_SUPABASE_ANON_KEY`.

3.  **Configurar Banco de Dados**:
    *   No painel do Supabase, vá em **SQL Editor**.
    *   Clique em "New Query".
    *   Copie o conteúdo do arquivo `supabase/migrations/20241209_initial_schema.sql` (na raiz do projeto).
    *   Cole no editor e clique em **Run**.
    *   Isso criará todas as tabelas e políticas de segurança necessárias.

4.  **Configurar Autenticação (Opcional para Dev)**:
    *   Vá em **Authentication > Providers** e habilite Email/Password.
    *   (Opcional) Vá em **Authentication > URL Configuration** e defina o Site URL para `http://localhost:8080` (ou sua porta).
    *   (Recomendado para teste rápido) Desabilite "Confirm email" em **Authentication > Providers > Email**.

5.  **Testar**:
    *   Reinicie o servidor de desenvolvimento (`npm run dev`).
    *   Acesse `/auth/register` e crie uma conta.
    *   Você deve ser redirecionado para o Dashboard automaticamente.
