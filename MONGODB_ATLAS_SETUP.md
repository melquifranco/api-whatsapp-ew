# 🚀 Guia: Configurar MongoDB Atlas para API WhatsApp

## 📋 Passo 1: Criar Conta MongoDB Atlas (5 minutos)

### **1.1. Acessar MongoDB Atlas**

Acesse: https://www.mongodb.com/cloud/atlas/register

### **1.2. Criar Conta**

- **Opção 1:** Usar email e senha
- **Opção 2:** Continuar com Google (mais rápido)

**Não precisa de cartão de crédito!**

### **1.3. Preencher Questionário Inicial**

Quando perguntado:
- **What is your goal today?** → "Build a new application"
- **What type of application are you building?** → "Other"
- **Preferred language** → "JavaScript"

Clique em **"Finish"**

---

## 🗄️ Passo 2: Criar Cluster Gratuito (3 minutos)

### **2.1. Escolher Plano**

Na tela "Deploy a cloud database":

1. Selecione **"M0 FREE"** (já vem selecionado)
2. **Provider:** AWS (recomendado)
3. **Region:** Escolha uma das opções:
   - **São Paulo (sa-east-1)** ← Recomendado (mais próximo do Brasil)
   - **N. Virginia (us-east-1)** ← Alternativa (mais próximo do Render)

4. **Cluster Name:** `whatsapp-api` (ou deixe o padrão)

5. Clique em **"Create"**

### **2.2. Aguardar Criação**

O cluster leva 1-3 minutos para ser criado. Você verá uma barra de progresso.

---

## 🔐 Passo 3: Configurar Segurança (5 minutos)

### **3.1. Criar Usuário do Banco**

Após a criação, você verá a tela "Security Quickstart":

1. **Username:** `admin` (ou escolha outro)
2. **Password:** Clique em **"Autogenerate Secure Password"**
   - **IMPORTANTE:** Copie e salve a senha! Você vai precisar dela.
   - Exemplo: `xK9mP2nQ4vL7wR5t`

3. Clique em **"Create User"**

### **3.2. Configurar Acesso de Rede**

Na mesma tela, role para baixo até "Where would you like to connect from?":

1. Selecione **"My Local Environment"**
2. Clique em **"Add My Current IP Address"**
3. **IMPORTANTE:** Adicione também o IP do Render:
   - Clique em **"Add IP Address"**
   - No campo "IP Address", digite: `0.0.0.0/0`
   - No campo "Description", digite: `Allow all (Render)`
   - Clique em **"Add Entry"**

4. Clique em **"Finish and Close"**

**Nota:** `0.0.0.0/0` permite acesso de qualquer IP. É seguro porque você tem usuário/senha.

---

## 🔗 Passo 4: Obter Connection String (2 minutos)

### **4.1. Acessar Connection String**

1. Na tela principal do Atlas, clique em **"Connect"** (botão ao lado do nome do cluster)
2. Selecione **"Drivers"**
3. **Driver:** Node.js
4. **Version:** 4.1 or later

### **4.2. Copiar Connection String**

Você verá uma string assim:

```
mongodb+srv://admin:<password>@whatsapp-api.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**IMPORTANTE:**
1. Copie a string completa
2. Substitua `<password>` pela senha que você copiou no Passo 3.1

**Exemplo final:**
```
mongodb+srv://admin:xK9mP2nQ4vL7wR5t@whatsapp-api.abc123.mongodb.net/?retryWrites=true&w=majority
```

3. **Adicione o nome do banco** no final (antes do `?`):

```
mongodb+srv://admin:xK9mP2nQ4vL7wR5t@whatsapp-api.abc123.mongodb.net/whatsapp?retryWrites=true&w=majority
```

**Salve essa string! Você vai usar no Render.**

---

## 📊 Passo 5: Verificar Cluster (1 minuto)

### **5.1. Acessar Database**

1. No menu lateral, clique em **"Database"**
2. Você verá seu cluster `whatsapp-api` com status **"Active"**
3. Clique em **"Browse Collections"**
4. Você verá "No databases found" - isso é normal!

**Pronto! MongoDB Atlas configurado!** ✅

---

## 🔧 Passo 6: Configurar Variáveis no Render (5 minutos)

### **6.1. Acessar Render Dashboard**

1. Acesse: https://dashboard.render.com
2. Selecione `api-whatsapp-ew`
3. Vá na aba **"Environment"**

### **6.2. Remover Variáveis PostgreSQL**

Delete as seguintes variáveis (se existirem):
- `POSTGRES_ENABLED`
- `Hostname`
- `Port`
- `Database`
- `Username`
- `Password`

### **6.3. Adicionar Variáveis MongoDB**

Clique em **"Add Environment Variable"** e adicione:

**Variável 1:**
- **Key:** `MONGODB_ENABLED`
- **Value:** `true`

**Variável 2:**
- **Key:** `MONGODB_URI`
- **Value:** (cole a connection string do Passo 4.2)
  ```
  mongodb+srv://admin:xK9mP2nQ4vL7wR5t@whatsapp-api.abc123.mongodb.net/whatsapp?retryWrites=true&w=majority
  ```

**Variável 3 (opcional, mas recomendado):**
- **Key:** `DATABASE_URL`
- **Value:** (mesma connection string)

### **6.4. Salvar**

Clique em **"Save Changes"**

**O Render vai fazer redeploy automaticamente!**

---

## ✅ Checklist de Configuração

- [ ] Conta MongoDB Atlas criada
- [ ] Cluster M0 (Free) criado
- [ ] Região escolhida (São Paulo ou N. Virginia)
- [ ] Usuário `admin` criado
- [ ] Senha copiada e salva
- [ ] IP `0.0.0.0/0` adicionado
- [ ] Connection string copiada
- [ ] `<password>` substituído pela senha real
- [ ] Nome do banco `/whatsapp` adicionado
- [ ] Variáveis PostgreSQL removidas do Render
- [ ] `MONGODB_ENABLED=true` adicionada
- [ ] `MONGODB_URI` adicionada com connection string
- [ ] Alterações salvas no Render

---

## 🎯 Próximos Passos

Após configurar o MongoDB Atlas:

1. ✅ Código será atualizado para usar MongoDB
2. ✅ PostgreSQL será removido
3. ✅ Deploy será feito no Render
4. ✅ Testes serão realizados

---

## 🆘 Troubleshooting

### **Problema: "Authentication failed"**

**Causa:** Senha incorreta na connection string

**Solução:**
1. Vá em "Database Access" no Atlas
2. Edite o usuário `admin`
3. Clique em "Edit Password"
4. Gere nova senha
5. Atualize a connection string no Render

### **Problema: "Connection timeout"**

**Causa:** IP não está na whitelist

**Solução:**
1. Vá em "Network Access" no Atlas
2. Verifique se `0.0.0.0/0` está na lista
3. Se não estiver, adicione

### **Problema: "Database not found"**

**Causa:** Nome do banco não está na connection string

**Solução:**
Adicione `/whatsapp` antes do `?` na connection string:
```
mongodb+srv://...mongodb.net/whatsapp?retryWrites=true...
```

---

## 📚 Recursos Úteis

- **MongoDB Atlas Dashboard:** https://cloud.mongodb.com
- **Documentação MongoDB:** https://docs.mongodb.com
- **Mongoose Docs:** https://mongoosejs.com/docs/guide.html
- **Render Dashboard:** https://dashboard.render.com

---

**Após configurar, me avise para continuar com a atualização do código!** 🚀
