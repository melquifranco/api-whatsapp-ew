# 🚀 Teste Rápido de Webhook (5 Minutos)

## 📋 Pré-requisitos

- ✅ API rodando: https://api-whatsapp-ew.onrender.com
- ✅ Instância criada e conectada ao WhatsApp
- ✅ Token de autorização: `8c60114e5b3d9b9e64d9b2a4cf0e1a1d`

---

## 🎯 Opção 1: Teste com Webhook.site (Mais Rápido)

### **Passo 1: Criar URL de Teste**

1. Acesse: https://webhook.site
2. Você verá uma URL única gerada automaticamente:
   ```
   https://webhook.site/abc-123-def-456
   ```
3. **Copie essa URL!**

### **Passo 2: Configurar Webhook na API**

**Usando cURL:**
```bash
curl -X POST "https://api-whatsapp-ew.onrender.com/webhook/set?key=INSTANCE_KEY" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://webhook.site/abc-123-def-456",
    "enabled": true
  }'
```

**Usando Postman:**
- **Method:** POST
- **URL:** `https://api-whatsapp-ew.onrender.com/webhook/set?key=INSTANCE_KEY`
- **Headers:**
  - `Authorization`: `Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "webhook_url": "https://webhook.site/abc-123-def-456",
    "enabled": true
  }
  ```

**Substitua:**
- `INSTANCE_KEY` pela chave da sua instância
- `abc-123-def-456` pelo ID do seu webhook.site

### **Passo 3: Testar Webhook**

**Opção A: Teste Automático**
```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/test?key=INSTANCE_KEY" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Opção B: Teste Real**

Envie uma mensagem para o número do WhatsApp conectado.

### **Passo 4: Ver Resultado**

Volte para https://webhook.site e você verá:

```json
{
  "instance_key": "INSTANCE_KEY",
  "event": "messages_upsert",
  "data": {
    "from": "5511999999999@s.whatsapp.net",
    "body": "Olá!",
    "messageType": "conversation",
    ...
  },
  "timestamp": 1768868327077
}
```

✅ **Funcionou!** Seu webhook está configurado corretamente!

---

## 🎯 Opção 2: Teste com ngrok (Desenvolvimento Local)

### **Passo 1: Instalar ngrok**

```bash
npm install -g ngrok
```

### **Passo 2: Criar Servidor Local**

Crie um arquivo `test-webhook.js`:

```javascript
const express = require('express')
const app = express()

app.use(express.json())

app.post('/webhook', (req, res) => {
    console.log('📩 Webhook recebido!')
    console.log(JSON.stringify(req.body, null, 2))
    res.status(200).json({ received: true })
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})
```

Execute:
```bash
node test-webhook.js
```

### **Passo 3: Expor com ngrok**

Em outro terminal:
```bash
ngrok http 3000
```

Você verá:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copie a URL:** `https://abc123.ngrok.io`

### **Passo 4: Configurar Webhook**

```bash
curl -X POST "https://api-whatsapp-ew.onrender.com/webhook/set?key=INSTANCE_KEY" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://abc123.ngrok.io/webhook",
    "enabled": true
  }'
```

### **Passo 5: Testar**

Envie uma mensagem para o WhatsApp e veja no console:

```
📩 Webhook recebido!
{
  "instance_key": "INSTANCE_KEY",
  "event": "messages_upsert",
  "data": {
    "from": "5511999999999@s.whatsapp.net",
    "body": "Teste",
    ...
  }
}
```

✅ **Funcionou!** Seu webhook local está recebendo mensagens!

---

## 🎯 Opção 3: Teste com Postman Echo

### **Passo 1: Usar Postman Echo**

URL de teste: `https://postman-echo.com/post`

### **Passo 2: Configurar Webhook**

```bash
curl -X POST "https://api-whatsapp-ew.onrender.com/webhook/set?key=INSTANCE_KEY" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://postman-echo.com/post",
    "enabled": true
  }'
```

### **Passo 3: Testar**

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/test?key=INSTANCE_KEY" \
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

✅ **Funcionou!** O webhook foi enviado com sucesso!

---

## 📊 Verificar Status do Webhook

```bash
curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/get?key=INSTANCE_KEY" \
  -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
```

**Resposta:**
```json
{
  "error": false,
  "message": "Webhook found",
  "webhook": {
    "instance_key": "INSTANCE_KEY",
    "webhook_url": "https://webhook.site/abc-123",
    "enabled": true,
    "retry_count": 3,
    "retry_delay": 1000,
    "total_sent": 5,
    "total_failed": 0,
    "last_success_at": "2026-01-19T12:30:00.000Z"
  }
}
```

**Campos importantes:**
- `total_sent`: Quantos webhooks foram enviados com sucesso
- `total_failed`: Quantos falharam
- `last_success_at`: Último envio bem-sucedido
- `last_failure_at`: Último erro (se houver)
- `last_error`: Mensagem do último erro (se houver)

---

## 🆘 Troubleshooting Rápido

### **Webhook não é chamado?**

1. Verifique se está configurado:
   ```bash
   curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/get?key=INSTANCE_KEY" \
     -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
   ```

2. Verifique se `enabled: true`

3. Teste manualmente:
   ```bash
   curl -X GET "https://api-whatsapp-ew.onrender.com/webhook/test?key=INSTANCE_KEY" \
     -H "Authorization: Bearer 8c60114e5b3d9b9e64d9b2a4cf0e1a1d"
   ```

4. Verifique se a URL está acessível:
   ```bash
   curl -X POST "https://sua-url.com/webhook" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### **Webhook retorna erro?**

1. Verifique logs do seu servidor
2. Certifique-se de responder com status 200
3. Responda rapidamente (< 5 segundos)

### **Recebe webhook duplicado?**

Use `message.key.id` para identificar mensagens únicas:

```javascript
const processedMessages = new Set()

app.post('/webhook', (req, res) => {
    const messageId = req.body.data?.key?.id
    
    if (processedMessages.has(messageId)) {
        console.log('Mensagem duplicada, ignorando')
        return res.status(200).json({ received: true })
    }
    
    processedMessages.add(messageId)
    
    // Processar mensagem...
    res.status(200).json({ received: true })
})
```

---

## ✅ Checklist de Teste

- [ ] Webhook configurado com sucesso
- [ ] Teste automático funcionou (`/webhook/test`)
- [ ] Mensagem real foi recebida
- [ ] Dados estão corretos (from, body, messageType)
- [ ] Webhook responde com status 200
- [ ] Tempo de resposta < 5 segundos
- [ ] Logs estão funcionando

---

## 🎯 Próximos Passos

Após testar com sucesso:

1. ✅ Implemente lógica de processamento
2. ✅ Adicione validação de dados
3. ✅ Configure tratamento de erros
4. ✅ Implemente resposta automática
5. ✅ Integre com seu sistema

---

**Guia completo:** `WEBHOOK_SETUP_GUIDE.md`

**Repositório:** https://github.com/melquifranco/api-whatsapp-ew

**Boa sorte!** 🚀
