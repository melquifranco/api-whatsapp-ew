# ⚡ Correção Rápida - 2 Minutos

## 🎯 O Problema

O hostname do PostgreSQL está **incompleto** nas variáveis de ambiente.

**Atual:**
```
Hostname = dpg-d5ml48sarvns73f7v6u0-a
```

**Correto:**
```
Hostname = dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com
```

❌ **Falta:** `.oregon-postgres.render.com`

---

## ✅ Solução em 4 Passos

### **1. Acessar Render**

https://dashboard.render.com → `api-whatsapp-ew` → **Environment**

### **2. Editar Hostname**

Encontre a variável `Hostname` e clique no ícone de **lápis** (editar)

### **3. Adicionar Sufixo**

Mude de:
```
dpg-d5ml48sarvns73f7v6u0-a
```

Para:
```
dpg-d5ml48sarvns73f7v6u0-a.oregon-postgres.render.com
```

**Dica:** Copie o hostname completo de **Databases** → **postgres-whatsapp** → **Info** → **Hostname**

### **4. Salvar e Redeploy**

1. Clique em **"Save Changes"**
2. Aguarde redeploy automático (3 minutos)
3. Vá em **Logs** e procure por:

```
✅ Connected to PostgreSQL successfully
✅ Database tables synchronized successfully
✅ Found 3 tables in database
```

---

## 🎉 Pronto!

As tabelas serão criadas automaticamente:
- ✅ `chats`
- ✅ `messages`
- ✅ `webhooks`

---

## 🔍 Verificar no pgAdmin

1. Refresh em **Tabelas** (F5)
2. Expanda **Tabelas**
3. Você verá as 3 tabelas criadas

---

## 🆘 Se Não Funcionar

Execute o script SQL manualmente:

1. Abra Query Tool no pgAdmin
2. Copie o script: https://raw.githubusercontent.com/melquifranco/api-whatsapp-ew/main/database/schema.sql
3. Cole e execute (F5)

Veja `PGADMIN_GUIDE.md` para detalhes.

---

**Tempo total:** 2 minutos de edição + 3 minutos de redeploy = **5 minutos** ⚡
