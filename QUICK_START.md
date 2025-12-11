# ⚡ GUIA RÁPIDO - Comece Aqui

## 3 Passos para Funcionar

### 1️⃣ Executar Migration (OBRIGATÓRIO)
**Tempo: 30 segundos**

- Abra: https://app.supabase.com
- Vá para: **SQL Editor**
- **New Query** → Copie tudo de `supabase/migrations/20241211_missing_tables.sql`
- **Run** (botão azul)
- Pronto! ✅

### 2️⃣ Deploy Código (Automático no Vercel)
**Tempo: 2-5 minutos**

```bash
git add .
git commit -m "Fix: Sincronização completa Supabase"
git push origin main
# Vercel detecta e deploy automaticamente
```

Ou se local:
```bash
bun run dev
# App rodando com as correções!
```

### 3️⃣ Testar Sincronização
**Tempo: 5 minutos**

1. Abra o app em **2 abas de navegador** (mesma conta)
2. Crie um cliente em uma aba
3. Recarregue a outra aba
4. Deve aparecer lá também! ✅

---

## 📖 Se Precisar de Detalhes

| Documento | Quando Ler | Tempo |
|-----------|-----------|-------|
| **CORRECTION_SUMMARY.md** | Agora (visual) | 3 min |
| **SYNC_FIX_SUMMARY.md** | Entender mudanças | 5 min |
| **DEPLOYMENT_INSTRUCTIONS.md** | Fazer o deploy | 10 min |
| **TECHNICAL_REPORT.md** | Análise técnica | 15 min |

---

## 🎯 Checklist Final

```
☐ Executar migration
☐ Deploy código (git push ou bun run dev)
☐ Teste sincronização (2 abas)
☐ Teste isolamento (2 usuários diferentes)
☐ Teste CRUD (criar/editar/deletar)
```

**Se todos passarem:** App pronto! 🎉

---

## ❌ Se Der Erro

### Erro: "Relation 'public.transactions' does not exist"
→ Migration não foi executada. Volte ao passo 1.

### Erro: "Permission denied" ou "RLS violation"
→ Verifique RLS no Supabase (Table Editor → RLS icon)

### Dados não sincronizam entre abas
→ Recarregue a página (Ctrl+R ou Cmd+R)

### Usuários vendo dados uns dos outros
→ Isso NÃO pode acontecer com as correções aplicadas. Tente logout/login.

---

## 📞 Suporte Rápido

1. **Abra Console:** F12 no navegador
2. **Procure por erros:** Algo com "Supabase" ou "Error"
3. **Leia a mensagem completa**
4. **Se tiver código:** Procure em TECHNICAL_REPORT.md

---

## ✨ O Que Mudou Para O Usuário

**Antes:**
- Dados se misturavam entre contas
- Precisa de localStorage para funcionar
- Sem sincronização entre dispositivos

**Depois:**
- Dados isolados por usuário (seguro!)
- Tudo via Supabase (cloud-native)
- Sincronização automática entre dispositivos
- Acesso de qualquer lugar

---

**Pronto? Comece pelo passo 1️⃣!**

Dúvidas? Leia `DEPLOYMENT_INSTRUCTIONS.md`
