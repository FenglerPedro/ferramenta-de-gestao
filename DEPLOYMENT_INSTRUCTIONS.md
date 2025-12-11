# 🚀 Instruções de Deployment - Correção de Sincronização

## ⚠️ IMPORTANTE: EXECUTE ESTA MIGRATION PRIMEIRO

Antes de usar o app com as correções, você **DEVE** executar a nova migration no seu banco de dados Supabase.

---

## Passo 1: Acessar o Supabase Dashboard

1. Abra: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor** (no menu esquerdo)

---

## Passo 2: Executar a Migration

### Opção A: Copiar e colar (Recomendado)

1. Abra o arquivo: `supabase/migrations/20241211_missing_tables.sql`
2. Copie TODO o conteúdo
3. No Supabase, clique em **New Query**
4. Cole o conteúdo
5. Clique em **Run** (botão azul)

Você verá: `Query returned successfully`

### Opção B: Via SQL Editor (se a opção A falhar)

Se receber erros, execute linha por linha:

```sql
-- Teste se a tabela já existe
SELECT * FROM information_schema.tables WHERE table_name = 'transactions';
```

Se retornar vazio, execute as tabelas uma por uma começando por:
```sql
-- Transactions
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  ...
)
```

---

## Passo 3: Verificar se foi bem-sucedido

1. No Supabase, vá para **Table Editor**
2. Verifique se as tabelas apareceram:
   - ✅ `transactions`
   - ✅ `client_activities`
   - ✅ `purchased_services`
   - ✅ `installments`

Se todas aparecerem, está perfeito! ✅

---

## Passo 4: Testar no App

### Teste Local (Desenvolvimento)

```bash
# Se estiver usando bun
bun install
bun run dev

# Se estiver usando npm
npm install
npm run dev
```

### Teste em Produção

Se estiver deployado no Vercel:
1. Faça push das mudanças para GitHub
2. Vercel deployará automaticamente
3. Aguarde o build terminar

---

## 📊 Checklist de Testes

### ✅ Teste 1: Sincronização entre navegadores

```
[ ] Abra o app em um navegador e faça login
[ ] Crie um cliente (deve aparecer no Dashboard)
[ ] Abra a URL em OUTRO navegador e faça login com a MESMA conta
[ ] Verifique se o cliente criado aparece lá também
[ ] Crie um novo cliente no 2º navegador
[ ] Volte ao 1º navegador - recarregue a página
[ ] O novo cliente deve aparecer (sincronizado!)
```

### ✅ Teste 2: Isolamento entre usuários

```
[ ] Navegador 1: Faça login com User A
[ ] Crie cliente "CLIENTE_A"
[ ] Navegador 2: Faça login com User B (novo usuário)
[ ] User B não deve ver "CLIENTE_A" em lugar nenhum
[ ] Crie cliente "CLIENTE_B" como User B
[ ] Navegador 1: Recarregue como User A
[ ] User A deve ver APENAS "CLIENTE_A", NÃO "CLIENTE_B"
```

### ✅ Teste 3: Operações CRUD

```
[ ] Criar cliente - deve ir para o Supabase
[ ] Editar cliente - mudanças devem sincronizar
[ ] Deletar cliente - deve remover apenas aquele cliente
[ ] Criar deal - deve aparecer na aba CRM
[ ] Mover deal para "Ganho" - deve criar cliente automaticamente
```

### ✅ Teste 4: Dados de Transações (Nova Tabela)

```
[ ] Acesse a aba de Transações (se disponível)
[ ] Crie uma transação
[ ] Verifique se aparece no Dashboard
[ ] Edite a transação
[ ] Delete a transação
```

---

## 🐛 Troubleshooting

### Erro: "Relation 'public.transactions' does not exist"

**Solução:** A migration não foi executada ainda. Siga os passos 1-3 acima.

### Erro: "Policy ... does not exist"

**Solução:** Execute a migration novamente. Pode ser que tenha sido interrompida.

### Erro: "Permission denied for schema public"

**Solução:** Seu usuário Supabase não tem permissão. Tente:
1. Fazer logout do Supabase
2. Fazer login novamente
3. Confirmar que está no projeto correto

### Dados não sincronizam entre navegadores

**Solução:**
1. Verifique se o usuário está logado (botão de perfil deve aparecer)
2. Abra o console do navegador (F12)
3. Procure por erros com "Supabase" ou "user_id"
4. Se houver erro RLS, pode ser que a query não tenha o filtro user_id

### "ERRO: duplicate key value violates unique constraint"

**Solução:** A tabela `settings` tem `unique(user_id)`. Se receber este erro:
1. Vá para Supabase → Table Editor → settings
2. Delete a linha existente do usuário
3. Tente novamente no app

---

## 📝 Logs e Monitoramento

### Ver logs do Supabase

1. No dashboard: **Logs** → **Edge Functions** ou **API**
2. Procure por queries com erros
3. Verifique se há "RLS violation" (dados de outro usuário)

### Ver logs do navegador

```javascript
// Console do navegador (F12)
// Procure por erros como:
"Error fetching data from Supabase:"
"Error adding client:"
"Error updating deal:"
```

---

## 🔍 Verificação Final

Antes de considerar concluído, verifique:

✅ **Banco de Dados:**
- [ ] Tabelas criadas: transactions, client_activities, purchased_services, installments
- [ ] RLS habilitado em todas as tabelas
- [ ] user_id presente em todas as tabelas (exceto profiles)

✅ **Código:**
- [ ] BusinessContext.tsx atualizado com filtros user_id
- [ ] Todos os SELECT incluem .eq('user_id', user.id)
- [ ] Todos os UPDATE/DELETE incluem .eq('user_id', user.id)

✅ **Testes:**
- [ ] Sincronização funciona entre navegadores
- [ ] Usuários não veem dados uns dos outros
- [ ] CRUD operations funcionam normalmente

---

## 📞 Se algo der errado

1. **Verifique o console** (F12 no navegador)
2. **Leia a mensagem de erro** completa
3. **Procure por "RLS violation"** ou **"permission denied"**
4. **Confirme que a migration foi executada**
5. **Teste logout e login novamente**

---

## ✨ Após Tudo Funcionar

Seu app agora tem:

✅ **Sincronização completa** entre dispositivos/navegadores  
✅ **Isolamento garantido** entre usuários  
✅ **Segurança em camadas** (RLS + client-side filters)  
✅ **Dados consistentes** em tempo real  
✅ **Suporte para múltiplos usuários** sem mistura de dados  

**Parabéns! 🎉 Seu app está pronto para produção!**

---

**Versão:** 1.0  
**Data:** 11 de Dezembro de 2025  
**Autor:** Correção de Sincronização Supabase
