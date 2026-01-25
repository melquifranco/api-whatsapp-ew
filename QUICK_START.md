# ⚡ Guia Rápido: Deploy MongoDB Atlas

## 🎯 Resumo

A API foi migrada de PostgreSQL para MongoDB Atlas. Siga estes passos para fazer funcionar.

---

## 📋 Passo 1: MongoDB Atlas (10 minutos)

### **1.1. Criar Conta**
- Acesse: https://www.mongodb.com/cloud/atlas/register
- Use Google para login rápido
- **Não precisa cartão de crédito!**

### **1.2. Criar Cluster**
1. Escolha **M0 FREE**
2. Provider: **AWS**
3. Region: **São Paulo** ou **N. Virginia**
4. Cluster Name: `whatsapp-api`
5. Clique em **"Create"**

### **1.3. Criar Usuário**
1. Username: `admin`
2. Password: Clique em **"Autogenerate"** e **COPIE A SENHA**
3. Clique em **"Create User"**

### **1.4. Configurar Rede**
1. Clique em **"Add IP Address"**
2. Digite: `0.0.0.0/0`
3. Description: `Allow all`
4. Clique em **"Add Entry"**
5. Clique em **"Finish and Close"**

### **1.5. Copiar Connection String**
1. Clique em **"Connect"**
2. Selecione **"Drivers"**
3. Copie a connection string:
   ```
   mongodb+srv://admin:<password>@whatsapp-api.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Substitua `<password>` pela senha copiada no passo 1.3
5. Adicione `/whatsapp` antes do `?`:
   ```
   mongodb+srv://admin:SUA_SENHA@whatsapp-api.xxxxx.mongodb.net/whatsapp?retryWrites=true&w=majority
   ```

**Salve essa string!**

---

## 🚀 Passo 2: Configurar Render (5 minutos)

### **2.1. Acessar Dashboard**
- https://dashboard.render.com
- Selecione `api-whatsapp-ew`
- Vá na aba **"Environment"**

### **2.2. Remover Variáveis PostgreSQL**

Delete estas variáveis (se existirem):
- `POSTGRES_ENABLED`
- `Hostname`
- `Port`
- `Database`
- `Username`
- `Password`

### **2.3. Adicionar Variáveis MongoDB**

Clique em **"Add Environment Variable"**:

**Variável 1:**
```
Key: MONGODB_ENABLED
Value: true
```

**Variável 2:**
```
Key: MONGODB_URI
Value: (cole a connection string do Passo 1.5)
```

Exemplo:
```
mongodb+srv://admin:xK9mP2nQ4vL7wR5t@whatsapp-api.abc123.mongodb.net/whatsapp?retryWrites=true&w=majority
```

### **2.4. Salvar**

Clique em **"Save Changes"**

**O Render vai fazer redeploy automático!**

---

## ✅ Passo 3: Verificar Deploy (3 minutos)

### **3.1. Ver Logs**

1. No Render, vá na aba **"Logs"**
2. Aguarde o deploy completar (2-3 minutos)
3. Procure por:

```
STATE: Connecting to MongoDB Atlas...
✅ STATE: Successfully connected to MongoDB Atlas
✅ MongoDB initialized successfully
Listening on port 10000
```

**Se ver essas mensagens, funcionou!** 🎉

### **3.2. Testar API**

Acesse no navegador:
```
https://api-whatsapp-ew.onrender.com/status
```

Deve retornar: `OK`

---

## 🎯 Checklist Completo

- [ ] Conta MongoDB Atlas criada
- [ ] Cluster M0 criado
- [ ] Usuário `admin` criado
- [ ] Senha copiada
- [ ] IP `0.0.0.0/0` adicionado
- [ ] Connection string copiada
- [ ] `<password>` substituído
- [ ] `/whatsapp` adicionado
- [ ] Variáveis PostgreSQL removidas
- [ ] `MONGODB_ENABLED=true` adicionada
- [ ] `MONGODB_URI` adicionada
- [ ] Alterações salvas no Render
- [ ] Redeploy completado
- [ ] Logs mostram "Successfully connected"
- [ ] `/status` retorna OK

---

## 🆘 Problemas?

### **Erro: "Connection to MongoDB Atlas failed"**

**Verifique:**
1. Connection string está correta?
2. Senha foi substituída corretamente?
3. IP `0.0.0.0/0` está na whitelist?
4. Cluster está ativo no Atlas?

**Solução rápida:**
1. Vá em "Network Access" no Atlas
2. Adicione `0.0.0.0/0` se não estiver
3. Vá em "Database Access"
4. Resete a senha do usuário `admin`
5. Atualize `MONGODB_URI` no Render

### **Erro: "MONGODB_URI is not defined"**

**Solução:**
1. Verifique se adicionou a variável no Render
2. Verifique se salvou as alterações
3. Aguarde o redeploy completar

---

## 📚 Documentação Completa

- **Setup detalhado:** [`MONGODB_ATLAS_SETUP.md`](./MONGODB_ATLAS_SETUP.md)
- **Documentação da migração:** [`MONGODB_MIGRATION.md`](./MONGODB_MIGRATION.md)

---

## 🎉 Pronto!

Após seguir estes passos, sua API estará rodando com MongoDB Atlas de forma estável e permanente.

**Tempo total:** 15-20 minutos

**Custo:** R$ 0,00 (100% gratuito)

**Expiração:** Nunca! ✅

---

**Última atualização:** 19 de Janeiro de 2026
