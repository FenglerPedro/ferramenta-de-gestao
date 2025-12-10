# Sistema de Templates e Terminologia Dinâmica

## Visão Geral

Este sistema permite adaptar a terminologia da aplicação para diferentes nichos de negócio (consultoria, advocacia, clínica, etc.) através de configurações simples.

## Como Usar

### 1. Configurar o Template

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base):

```env
# Template/Nicho (opcoes: consultoria, advocacia, clinica, agencia, imobiliaria, ecommerce, outros)
VITE_BUSINESS_TEMPLATE=consultoria

# Você pode sobrescrever termos específicos:
VITE_TERM_CLIENT=Cliente
VITE_TERM_CLIENTS=Clientes
VITE_TERM_SERVICE=Serviço
VITE_TERM_SERVICES=Serviços
# ... etc
```

### 2. Templates Disponíveis

#### Consultoria (padrão)
- Cliente → Cliente
- Serviço → Serviço  
- Negócio → Negócio
- Reunião → Reunião

#### Advocacia
- Cliente → Cliente
- Serviço → Serviço Jurídico
- Negócio → Caso
- Reunião → Audiência
- Projeto → Processo

#### Clínica/Consultório
- Cliente → Paciente
- Serviço → Tratamento
- Negócio → Oportunidade
- Reunião → Consulta

#### Agência Digital
- Cliente → Cliente
- Serviço → Serviço
- Negócio → Proposta
- Reunião → Reunião

#### Imobiliária
- Cliente → Cliente
- Serviço → Imóvel
- Negócio → Negociação
- Reunião → Visita
- Projeto → Transação

#### E-commerce
- Cliente → Cliente
- Serviço → Produto
- Negócio → Venda
- Reunião → Atendimento
- Projeto → Pedido

### 3. Usar no Código

```tsx
import { useTerminology } from '@/hooks/useTerminology';

function MeuComponente() {
  const terms = useTerminology();
  
  return (
    <div>
      <h1>Lista de {terms.clients}</h1>
      <p>Gerencie seus {terms.services}</p>
      <button>Adicionar {terms.client}</button>
    </div>
  );
}
```

### 4. Termos Disponíveis

```typescript
interface TemplateTerminology {
  // Singular
  client: string;        // Cliente, Paciente, etc
  service: string;       // Serviço, Tratamento, Produto, etc
  deal: string;          // Negócio, Caso, Venda, etc
  meeting: string;       // Reunião, Consulta, Audiência, etc
  project: string;       // Projeto, Processo, Transação, etc
  task: string;          // Tarefa
  dashboard: string;     // Dashboard, Painel
  crm: string;          // CRM, Gestão de Clientes
  
  // Plural
  clients: string;
  services: string;
  deals: string;
  meetings: string;
  projects: string;
  tasks: string;
}
```

## Criar um Novo Template

1. Edite `src/config/templates.ts`
2. Adicione uma nova entrada no enum `BusinessTemplate`
3. Adicione a configuração em `businessTemplates`

```typescript
'meu_nicho': {
  id: 'meu_nicho',
  name: 'Meu Nicho',
  terminology: {
    client: 'Termo Customizado',
    clients: 'Termos Customizados',
    // ... outros termos
  },
  primaryColor: 'hsl(210 40% 50%)',
}
```

## Ordem de Prioridade

1. **Variáveis de ambiente** (`.env`)
2. **Template selecionado** (`VITE_BUSINESS_TEMPLATE`)
3. **Template padrão** (consultoria)

Isso significa que você pode usar um template como base e sobrescrever apenas os termos que desejar através do `.env`.

## Exemplos Práticos

### Exemplo 1: Consultoria padrão
```env
VITE_BUSINESS_TEMPLATE=consultoria
```
Resultado: Cliente, Serviço, Negócio, Reunião

### Exemplo 2: Clínica
```env
VITE_BUSINESS_TEMPLATE=clinica
```
Resultado: Paciente, Tratamento, Oportunidade, Consulta

### Exemplo 3: Clínica com customização
```env
VITE_BUSINESS_TEMPLATE=clinica
VITE_TERM_MEETING=Sessão
VITE_TERM_MEETINGS=Sessões
```
Resultado: Paciente, Tratamento, Oportunidade, **Sessão** (customizado)

## Benefícios

✅ **Flexibilidade**: Adapte a aplicação para qualquer nicho  
✅ **Sem código duplicado**: Uma aplicação serve múltiplos nichos  
✅ **Fácil manutenção**: Todas as terminologias centralizadas  
✅ **Experiência personalizada**: Cliente vê terminologia familiar  
✅ **Rápido deploy**: Mude o nicho apenas configurando `.env`
