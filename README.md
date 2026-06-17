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

Na primeira vez, o QR Code ficará disponível de duas formas:
- **No terminal** — exibido diretamente pelo Baileys
- **No navegador** —
