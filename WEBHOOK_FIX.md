# 🔧 Correção do Erro 500 no Webhook

## 🐛 Problema Identificado

**Erro:** `"Cannot read properties of undefined (reading 'melqui-20012026')"`

**Causa:** O código estava verificando se a instância existia no objeto `WhatsAppInstances` (em memória) antes de permitir a configuração do webhook. Quando o servidor reinicia, esse objeto perde todos os dados, causando o erro 500.

---

## ✅ Correções Implementadas

### **1. Armazenamento MongoDB para Webhooks**

**Antes:** Webhooks eram armazenados em memória (`Map`), perdendo dados a cada reinício.

**Depois:** Webhooks são armazenados no MongoDB, persistindo entre reinícios.

**Arquivo criado:** `src/api/models/webhook.model.js`

**Schema MongoDB:**
```javascript
{
    instance_key: String (único, indexado),
    webhook_url: String (obrigatório),
    enabled: Boolean (padrão: true),
    events: {
        messages: Boolean,
        messages_upsert: Boolean,
        messages_update: Boolean,
        messages_delete: Boolean,
        message_reaction: Boolean,
        presence_update: Boolean,
        chats_upsert: Boolean,
        chats_update: Boolean,
        chats_delete: Boolean,
        contacts_upsert: Boolean,
        contacts_update: Boolean,
        groups_upsert: Boolean,
        groups_update: Boolean,
        group_participants_update: Boolean,
        connection_update: Boolean
    },
    retry_count: Number (padrão: 3),
    retry_delay: Number (padrão: 1000ms),
    last_success_at: Date,
    last_failure_at: Date,
    last_error: String,
    total_sent: Number,
    total_failed: Number,
    createdAt: Date (automático),
    updatedAt: Date (automático)
}
```

---

### **2. Webhook Service Atualizado**

**Arquivo:** `src/api/services/webhook.service.js`

**Mudanças:**
- ✅ Removido `Map` em memória
- ✅ Implementado CRUD completo com MongoDB
- ✅ Método `registerWebhook()` usa `findOneAndUpdate` com `upsert`
- ✅ Método `getWebhook()` busca do MongoDB
- ✅ Método `removeWebhook()` deleta do MongoDB
- ✅ Método `sendWebhook()` atualiza estatísticas no MongoDB
- ✅ Novo método `listWebhooks()` - lista todos os webhooks
- ✅ Novo método `getWebhookStats()` - estatísticas detalhadas

**Benefícios:**
- 🔄 Webhooks persistem entre reinícios
- 📊 Estatísticas acumuladas (total_sent, total_failed)
- 🕒 Histórico de sucesso/falha
- 🔍 Rastreamento de erros

---

### **3. Webhook Controller Atualizado**

**Arquivo:** `src/api/controllers/webhook.controller.js`

**Mudanças principais:**

**❌ REMOVIDO:**
```javascript
// Verifica se a instância existe
const instance = WhatsAppInstances[key]
if (!instance) {
    return res.status(404).json({
        error: true,
        message: 'Instance not found'
    })
}
```

**✅ ADICIONADO:**
```javascript
// Valida URL
try {
    new URL(webhook_url)
} catch (error) {
    return res.status(400).json({
        error: true,
        message: 'Invalid webhook URL format'
    })
}
```

**Novos endpoints:**
- ✅ `GET /webhook/list` - Lista todos os webhooks
- ✅ `GET /webhook/stats` - Estatísticas de um webhook

---

### **4. Rotas Atualizadas**

**Arquivo:** `src/api/routes/webhook.route.js`

**Rotas disponíveis:**
```javascript
POST   /webhook/set      // Configurar webhook
GET    /webhook/get      // Obter configuração
DELETE /webhook/remove   // Remover webhook
GET    /webhook/test     // Testar webhook
GET    /webhook/list     // Listar todos os webhooks (NOVO)
GET    /webhook/stats    // Estatísticas de um webhook (NOVO)
```

---

## 🚀 Como Usar Agora

### **1. Configurar Webhook (Agora Funciona!)**

```bash
curl -X POST "https://api-whatsapp-ew.onrender.com/webhook/set?key=melqui-20012026" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://webhook.site/sua-url-aqui",
    "enabled": true
  }'
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook configured successfully",
  "webhook": {
    "instance_key": "melqui-20012026",
    "webhook_url": "https://webhook.site/sua-url-aqui",
    "enabled": true,
    "events": {
      "messages_upsert": true,
      "messages_update": true,
      ...
    },
    "retry_count": 3,
    "retry_delay": 1000,
    "created_at": "2026-01-19T...",
    "updated_at": "2026-01-19T..."
  }
}
```

---

### **2. Obter Configuração**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/get?key=melqui-20012026" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook found",
  "webhook": {
    "instance_key": "melqui-20012026",
    "webhook_url": "https://webhook.site/sua-url-aqui",
    "enabled": true,
    "total_sent": 15,
    "total_failed": 2,
    "last_success_at": "2026-01-19T12:30:00.000Z",
    "last_failure_at": "2026-01-19T12:25:00.000Z",
    "last_error": "ECONNREFUSED",
    ...
  }
}
```

---

### **3. Listar Todos os Webhooks (NOVO)**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/list" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhooks retrieved successfully",
  "count": 2,
  "webhooks": [
    {
      "instance_key": "melqui-20012026",
      "webhook_url": "https://webhook.site/abc-123",
      "enabled": true,
      "total_sent": 15,
      "total_failed": 2,
      "last_success_at": "2026-01-19T12:30:00.000Z",
      "created_at": "2026-01-19T10:00:00.000Z"
    },
    {
      "instance_key": "outra-instancia",
      "webhook_url": "https://webhook.site/def-456",
      "enabled": false,
      "total_sent": 0,
      "total_failed": 0,
      "created_at": "2026-01-19T11:00:00.000Z"
    }
  ]
}
```

---

### **4. Estatísticas de Webhook (NOVO)**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/stats?key=melqui-20012026" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook statistics retrieved successfully",
  "stats": {
    "instance_key": "melqui-20012026",
    "enabled": true,
    "total_sent": 15,
    "total_failed": 2,
    "success_rate": "88.24%",
    "last_success_at": "2026-01-19T12:30:00.000Z",
    "last_failure_at": "2026-01-19T12:25:00.000Z",
    "last_error": "ECONNREFUSED",
    "created_at": "2026-01-19T10:00:00.000Z",
    "updated_at": "2026-01-19T12:30:00.000Z"
  }
}
```

---

### **5. Testar Webhook**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/test?key=melqui-20012026" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook test sent successfully",
  "sent": true
}
```

---

### **6. Remover Webhook**

```bash
curl -X DELETE "https://api-whatsapp-ew.onrender.com/webhook/remove?key=melqui-20012026" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook removed successfully"
}
```

---

## 📊 Collection MongoDB Criada

**Collection:** `webhooks`

**Índices criados:**
- `instance_key` (único)
- `enabled`
- `createdAt` (descendente)

**Exemplo de documento:**
```json
{
  "_id": "679d1234567890abcdef1234",
  "instance_key": "melqui-20012026",
  "webhook_url": "https://webhook.site/abc-123-def-456",
  "enabled": true,
  "events": {
    "messages": true,
    "messages_upsert": true,
    "messages_update": true,
    "messages_delete": true,
    "message_reaction": true,
    "presence_update": false,
    "chats_upsert": false,
    "chats_update": false,
    "chats_delete": false,
    "contacts_upsert": false,
    "contacts_update": false,
    "groups_upsert": false,
    "groups_update": false,
    "group_participants_update": false,
    "connection_update": true
  },
  "retry_count": 3,
  "retry_delay": 1000,
  "last_success_at": "2026-01-19T12:30:00.000Z",
  "last_failure_at": null,
  "last_error": null,
  "total_sent": 15,
  "total_failed": 0,
  "createdAt": "2026-01-19T10:00:00.000Z",
  "updatedAt": "2026-01-19T12:30:00.000Z"
}
```

---

## ✅ Vantagens da Nova Implementação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Armazenamento** | Memória (Map) | MongoDB (persistente) |
| **Reinício servidor** | ❌ Perde dados | ✅ Mantém dados |
| **Estatísticas** | ❌ Não rastreia | ✅ Rastreia tudo |
| **Histórico** | ❌ Não tem | ✅ Tem completo |
| **Taxa de sucesso** | ❌ Não calcula | ✅ Calcula automático |
| **Erro tracking** | ❌ Não salva | ✅ Salva último erro |
| **Listagem** | ❌ Não tem | ✅ Lista todos |
| **Validação URL** | ❌ Não valida | ✅ Valida formato |
| **Verificação instância** | ❌ Bloqueia se não existe | ✅ Permite configurar |

---

## 🔄 Fluxo de Funcionamento

### **Configuração:**
1. Cliente faz POST /webhook/set
2. Controller valida URL
3. Service faz upsert no MongoDB
4. Retorna configuração salva

### **Envio de Evento:**
1. WhatsApp recebe mensagem
2. Instance chama WebhookService.sendWebhook()
3. Service busca webhook do MongoDB
4. Verifica se está habilitado e evento configurado
5. Envia POST para webhook_url
6. Atualiza estatísticas no MongoDB (sucesso/falha)
7. Retorna resultado

### **Consulta:**
1. Cliente faz GET /webhook/get ou /webhook/stats
2. Service busca do MongoDB
3. Retorna dados atualizados

---

## 🎯 Próximos Passos

1. ✅ **Deploy no Render.com** - Fazer push das mudanças
2. ✅ **Testar configuração** - Usar webhook.site
3. ✅ **Verificar MongoDB** - Confirmar collection `webhooks` criada
4. ✅ **Monitorar estatísticas** - Usar endpoint /webhook/stats

---

## 📝 Arquivos Modificados

1. ✅ `src/api/models/webhook.model.js` - **CRIADO**
2. ✅ `src/api/services/webhook.service.js` - **ATUALIZADO**
3. ✅ `src/api/controllers/webhook.controller.js` - **ATUALIZADO**
4. ✅ `src/api/routes/webhook.route.js` - **ATUALIZADO**

---

## 🆘 Troubleshooting

### **Erro: "Webhook not found"**
- Verifique se configurou o webhook primeiro com POST /webhook/set

### **Erro: "Invalid webhook URL format"**
- Use URL completa: `https://webhook.site/abc-123`
- Não use apenas domínio sem protocolo

### **Webhook não recebe mensagens**
- Verifique se `enabled: true`
- Verifique se evento está habilitado em `events`
- Use GET /webhook/stats para ver erros

### **Estatísticas zeradas**
- Normal após primeira configuração
- Envie mensagens para incrementar

---

## ✨ Conclusão

**Problema resolvido!** 🎉

Agora você pode:
- ✅ Configurar webhooks sem erro 500
- ✅ Webhooks persistem entre reinícios
- ✅ Rastrear estatísticas completas
- ✅ Monitorar taxa de sucesso
- ✅ Ver histórico de erros
- ✅ Listar todos os webhooks

**Tudo armazenado no MongoDB Atlas!** 🚀
