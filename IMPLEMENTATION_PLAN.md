# Plano de Implementação - Sistema de Gestão

## Status Geral

**Última atualização**: 09/12/2024

---

## ✅ Prioridade 1: Infraestrutura de Configuração

### ✅ Configurações básicas (nome, logo) - CONCLUÍDO
- [x] Sistema de configurações implementado em `BusinessContext`
- [x] Upload de logo e foto funcionando
- [x] Persistência em localStorage

### ✅ Sistema de config por variáveis de ambiente - CONCLUÍDO
- [x] Arquivo `.env.example` criado com todas as variáveis
- [x] Módulo `src/config/env.ts` para centralizar variáveis
- [x] Integração com `BusinessContext` para usar valores padrão do `.env`

### ✅ Loader de templates por nicho - CONCLUÍDO
- [x] Sistema de templates em `src/config/templates.ts`
- [x] 6 templates pré-configurados:
  - Consultoria (padrão)
  - Advocacia
  - Clínica/Consultório
  - Agência Digital
  - Imobiliária
  - E-commerce
- [x] Hook `useTerminology()` para acessar terminologia dinâmica
- [x] Documentação completa em `TEMPLATES.md`

### ✅ Terminologia dinâmica em toda a UI - CONCLUÍDO
- [x] Sistema de terminologia implementado
- [x] AppSidebar atualizado com terminologia dinâmica
- [x] Atualizar todas as páginas restantes:
  - [x] Dashboard
  - [x] CRM
  - [x] Agenda
  - [x] Clientes
  - [x] Serviços
  - [x] Projetos de Cliente

---

## ⏳ Prioridade 2: Backend (Supabase)

### 🏗️ Estrutura e Auth - CONCLUÍDO
- [x] Instalar dependências do Supabase
- [x] Configurar client (`src/lib/supabase.ts`)
- [x] Criar migration inicial SQL (`supabase/migrations`)
- [x] Criar páginas de Login/Register
- [x] Proteger rotas com AuthGuard

### ☐ Integração de Dados - EM PROGRESSO
- [ ] Refatorar `BusinessContext` para usar Supabase
- [ ] Implementar CRUD de Clientes
- [ ] Implementar CRUD de Serviços
- [ ] Implementar CRUD de CRM/Agenda
- [ ] remover dependência de localStorage

### ☐ Schema do banco (migrations)
- [ ] Criar migration inicial
- [ ] Tabela de usuários/autenticação
- [ ] Tabela de clientes
- [ ] Tabela de serviços
- [ ] Tabela de reuniões/compromissos
- [ ] Tabela de negócios (CRM)
- [ ] Tabela de projetos
- [ ] Tabela de tarefas
- [ ] Tabela de configurações customizadas
- [ ] Relacionamentos e constraints

### ☐ RLS básico (sem multi-tenant, apenas auth)
- [ ] Habilitar RLS em todas as tabelas
- [ ] Políticas de SELECT
- [ ] Políticas de INSERT
- [ ] Políticas de UPDATE
- [ ] Políticas de DELETE

### ☐ Autenticação do usuário do cliente
- [ ] Implementar Supabase Auth
- [ ] Página de login
- [ ] Página de cadastro
- [ ] Proteção de rotas
- [ ] Persistência de sessão
- [ ] Logout

---

## ⏳ Prioridade 3: Campos Customizáveis

### ☐ Campos extras por entidade (via config)
- [ ] Definir estrutura de campos customizados
- [ ] Interface para configurar campos extras
- [ ] Integração com configurações

### ☐ Renderização dinâmica de formulários
- [ ] Componente de campo dinâmico
- [ ] Validação de campos customizados
- [ ] Tipos de campo suportados (texto, número, data, select, etc)

### ☐ Armazenamento em coluna JSONB
- [ ] Migration para adicionar coluna JSONB nas tabelas
- [ ] Funções para salvar/recuperar campos customizados
- [ ] Validação no backend

---

## ⏳ Prioridade 4: Documentação de Deploy

### ☐ DEPLOY.md com passo-a-passo
- [ ] Requisitos do sistema
- [ ] Configuração de variáveis de ambiente
- [ ] Setup do Supabase
- [ ] Build da aplicação
- [ ] Deploy em diferentes plataformas:
  - [ ] Vercel
  - [ ] Netlify
  - [ ] VPS/Cloud

### ☐ Script de setup automatizado
- [ ] Script para configuração inicial
- [ ] Script para geração de .env
- [ ] Script para execução de migrations

### ☐ Vídeo tutorial (opcional)
- [ ] Roteiro do vídeo
- [ ] Gravação
- [ ] Edição
- [ ] Publicação

---

## 📝 Próximos Passos Imediatos

1. **Concluir terminologia dinâmica**: Atualizar páginas restantes para usar `useTerminology()`
2. **Instalar Supabase**: Adicionar SDK e configurar conexão
3. **Criar migrations**: Definir schema completo do banco de dados
4. **Implementar autenticação**: Sistema de login e proteção de rotas

---

## 📊 Progresso por Prioridade

- **Prioridade 1**: 100% ✅ (4/4 itens concluídos)
- **Prioridade 2**: 50% 🏗️ (1/2 partes concluídas)
- **Prioridade 3**: 0% ⏳ (0/3 itens concluídos)
- **Prioridade 4**: 0% ⏳ (0/3 itens concluídos)

**Progresso Total**: ~40% (5/12 itens principais)

---

## 🎯 Meta Atual

Refatorar `BusinessContext` para substituir o localStorage pelo Supabase, começando pela leitura de dados ao iniciar a sessão.

---

## 📚 Arquivos Criados

### Configuração
- ✅ `.env.example` - Exemplo de variáveis de ambiente
- ✅ `src/config/env.ts` - Centralização de variáveis
- ✅ `src/config/templates.ts` - Sistema de templates por nicho

### Hooks
- ✅ `src/hooks/useTerminology.ts` - Hook para terminologia dinâmica

### Documentação
- ✅ `TEMPLATES.md` - Guia completo do sistema de templates

### Modificados
- ✅ `src/contexts/BusinessContext.tsx` - Integração com env
- ✅ `src/components/layout/AppSidebar.tsx` - Uso de terminologia dinâmica
