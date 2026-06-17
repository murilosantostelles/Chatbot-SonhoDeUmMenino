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

    git clone https://github.com/murilosantostelles/Chatbot-SonhoDeUmMenino.git
    cd Chatbot-SonhoDeUmMenino

**2. Instale as dependências**

    npm install

**3. Crie o arquivo de contatos** (se não existir)

Crie o arquivo `data/contatos.json` com o conteúdo:

    {}

---

## ▶️ Como rodar

    node src/bot.js

Na primeira vez, o QR Code ficará disponível de duas formas:
- **No terminal** — exibido diretamente pelo Baileys
- **No navegador** — acesse `http://localhost:3000/qr`

---

## 📱 Conectando ao WhatsApp

1. Rode o bot com `node src/bot.js`
2. Acesse `http://localhost:3000/qr` no navegador
3. Abra o WhatsApp no celular
4. Toque nos **três pontinhos** (Android) ou **Configurações** (iPhone)
5. Selecione **Dispositivos conectados**
6. Toque em **Conectar dispositivo**
7. Escaneie o QR Code exibido na página

✅ Após escanear, o terminal exibirá: `Bot conectado e pronto para atender!`

> O QR Code expira rapidamente. Caso expire, atualize a página `/qr` para gerar um novo.

---

## 🔄 Atualizando o código

Antes de começar a trabalhar, sempre rode:

    git pull

---

## 🔁 Resetar a sessão (trocar de número)

**Windows:**

    rmdir /s /q auth
    node src/bot.js

**Mac/Linux:**

    rm -rf auth/
    node src/bot.js

---

## 📁 Estrutura do projeto

    Chatbot-SonhoDeUmMenino/
    ├── auth/                  # Sessão do WhatsApp (gerada automaticamente)
    ├── data/
    │   ├── contatos.json      # Registro de contatos atendidos
    │   └── ong.json           # Respostas e configurações do bot
    ├── src/
    │   ├── bot.js             # Conexão, inicialização e servidor web (/qr)
    │   ├── menu.js            # Mensagem de boas-vindas
    │   └── messageHandler.js  # Lógica de atendimento
    ├── .gitignore
    ├── package.json
    └── README.md

---

## 📦 Dependências principais

| Pacote | Função |
|---|---|
| `@whiskeysockets/baileys` | Conexão com o WhatsApp (sem navegador) |
| `@hapi/boom` | Tratamento de erros de conexão |
| `express` | Servidor web para disponibilizar o QR Code via navegador |
| `qrcode` | Geração do QR Code como imagem na rota `/qr` |
| `qrcode-terminal` | Exibição do QR Code no terminal |
| `pino` | Logger interno do Baileys |
| `dotenv` | Leitura de variáveis de ambiente |

---

## ⚙️ Como funciona

1. Ao receber a **primeira mensagem** de um contato, o bot envia automaticamente o menu de boas-vindas
2. O contato é registrado em `contatos.json` com o horário do primeiro atendimento
3. Após **24 horas**, o contato é considerado novo novamente e recebe o menu na próxima mensagem
4. As respostas do bot são definidas no arquivo `data/ong.json`
5. Mensagens enviadas pela própria ONG são ignoradas pelo bot
6. Texto livre fora do menu é ignorado, permitindo que a representante responda manualmente pelo celular

---

## ✏️ Como editar as respostas do bot

Abra o arquivo `data/ong.json` e edite as respostas conforme necessário:

    {
      "respostas": {
        "1": "Resposta para a opção 1 do menu",
        "2": "Resposta para a opção 2 do menu"
      },
      "mensagemPadrao": "Não entendi sua mensagem. Digite *menu* para ver as opções."
    }

> Não é necessário reiniciar o bot para as alterações fazerem efeito.

---

## ⚠️ Observações importantes

- Nunca suba a pasta `auth/` para o GitHub — ela contém a sessão do WhatsApp
- Nunca suba o arquivo `data/contatos.json` para o GitHub — ele contém dados de usuários
- O Baileys **não utiliza navegador** (sem Puppeteer/Chrome), tornando o bot mais leve e estável

---

## 🐛 Problemas comuns

**Bot não conecta após escanear o QR**

    rmdir /s /q auth   # Windows
    rm -rf auth/       # Mac/Linux
    node src/bot.js

**QR Code não aparece na página /qr**

Aguarde alguns segundos e atualize a página. Se continuar sem aparecer, verifique os logs no terminal.

**Erro de dependências**

    npm install

**Verificar versão do Node.js**

    node -v
