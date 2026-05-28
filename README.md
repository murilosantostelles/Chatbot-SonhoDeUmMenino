# 🤖 ChatBot — Sonho de Um Menino

Chatbot para automatização do primeiro atendimento no WhatsApp da ONG **Sonho de Um Menino**, desenvolvido como projeto de extensão universitária.

**Integrantes:** André Silva de Moura, Enzo Machado, Murilo Santos Telles, Rafael Andrade Medeiros, Tomaz Camara Jacinto, Vinícius Raone dos Passos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado na sua máquina:

- [Node.js](https://nodejs.org/) v18 ou superior
- [Git](https://git-scm.com/)
- WhatsApp instalado no celular (para escanear o QR Code)

---

## 🚀 Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/murilosantostelles/Chatbot-SonhoDeUmMenino.git
cd Chatbot-SonhoDeUmMenino
```

**2. Instale as dependências**
```bash
npm install
```

**3. Crie o arquivo de contatos** (se não existir)

Crie o arquivo `data/contatos.json` com o conteúdo abaixo:
```json
{}
```

---

## ▶️ Como rodar

```bash
node src/bot.js
```

Na primeira vez, um QR Code vai aparecer no terminal. Siga os passos abaixo para conectar.

---

## 📱 Conectando ao WhatsApp

1. Abra o WhatsApp no celular
2. Toque nos **três pontinhos** (Android) ou **Configurações** (iPhone)
3. Selecione **Dispositivos conectados**
4. Toque em **Conectar dispositivo**
5. Escaneie o QR Code que apareceu no terminal

✅ Após escanear, o terminal exibirá: `Bot conectado e pronto para atender!`

> O QR Code expira após alguns segundos. Caso expire, um novo é gerado automaticamente. Após 3 tentativas sem escanear, o bot encerra e você deve rodá-lo novamente.

---

## 🔄 Atualizando o código do repositório

Antes de começar a trabalhar, sempre rode:
```bash
git pull
```

---

## 🔁 Resetar a sessão (trocar de número)

Caso queira desconectar e conectar outro número, delete a pasta `auth/` e rode o bot novamente:

**Windows:**
```bash
rmdir /s /q auth
node src/bot.js
```

**Mac/Linux:**
```bash
rm -rf auth/
node src/bot.js
```

---

## 📁 Estrutura do projeto

```
Chatbot-SonhoDeUmMenino/
├── auth/                  # Sessão do WhatsApp (gerada automaticamente)
├── data/
│   ├── contatos.json      # Registro de contatos atendidos
│   └── ong.json           # Respostas e configurações do bot
├── src/
│   ├── bot.js             # Conexão e inicialização do cliente
│   ├── menu.js            # Mensagem de boas-vindas
│   └── messageHandler.js  # Lógica de atendimento
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Como funciona

1. Ao receber a **primeira mensagem** de um contato, o bot envia automaticamente o menu de boas-vindas
2. O contato é registrado em `contatos.json` com o horário do primeiro atendimento
3. Após **24 horas**, o contato é considerado novo novamente e recebe o menu ao próxima mensagem
4. As respostas do bot são definidas no arquivo `data/ong.json`
5. Mensagens enviadas pela própria ONG são ignoradas pelo bot

---

## ✏️ Como editar as respostas do bot

Abra o arquivo `data/ong.json` e edite as respostas conforme necessário:

```json
{
  "respostas": {
    "1": "Resposta para a opção 1 do menu",
    "2": "Resposta para a opção 2 do menu"
  },
  "mensagemPadrao": "Não entendi sua mensagem. Digite *menu* para ver as opções."
}
```

Não é necessário reiniciar o bot para as alterações fazerem efeito.

---

## ⚠️ Observações importantes

- Nunca suba a pasta `auth/` para o GitHub — ela contém a sessão do WhatsApp
- Nunca suba o arquivo `data/contatos.json` para o GitHub — ele contém dados de usuários
- Confirme que ambos estão listados no `.gitignore` antes de qualquer commit

---

## 🐛 Problemas comuns

**Bot não conecta após escanear o QR**
```bash
rmdir /s /q auth   # Windows
rm -rf auth/       # Mac/Linux
node src/bot.js
```

**Erro de dependências**
```bash
npm install
```

**QR Code não aparece no terminal**

Verifique se o Node.js está na versão 18 ou superior:
```bash
node -v
```