import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import qrcodeWeb from 'qrcode';
import express from 'express';
import messageHandler from './messageHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

const MAX_QR = 3;
const MAX_TENTATIVAS = 5;
const INTERVALO_MS = 5000;

let qrCount = 0;
let tentativas = 0;
let qrAtual = null;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/qr', async (req, res) => {
  if (!qrAtual) {
    return res.send('<h2>Bot já conectado ou QR Code ainda não gerado. Aguarde e atualize a página.</h2>');
  }
  try {
    const qrImagem = await qrcodeWeb.toDataURL(qrAtual);
    res.send(`
      <html>
        <body style="display:flex;flex-direction:column;align-items:center;font-family:sans-serif;padding:40px">
          <h2>📱 Escaneie o QR Code com o WhatsApp da ONG</h2>
          <img src="${qrImagem}" style="width:300px;height:300px"/>
          <p>Atualize a página se o QR Code expirar.</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.send('<h2>Erro ao gerar QR Code. Tente novamente.</h2>');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse /qr para escanear o QR Code`);
});

const criarCliente = () => new Client({
  authStrategy: new LocalAuth({
    dataPath: './auth'
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  }
});

let client = criarCliente();

const iniciar = () => {

  client.on('qr', async (qr) => {
    qrCount++;
    qrAtual = qr;

    if (qrCount > MAX_QR) {
      console.log('⏱️ QR Code expirou 3 vezes. Acesse /qr para tentar novamente.');
      return;
    }

    console.log(`📱 QR Code gerado (tentativa ${qrCount} de ${MAX_QR})`);
    console.log('🔗 Acesse a rota /qr no navegador para escanear');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    qrCount = 0;
    tentativas = 0;
    qrAtual = null;
    console.log('✅ Bot conectado e pronto para atender!');
  });

  client.on('disconnected', async (reason) => {
    console.log('❌ Bot desconectado. Motivo:', reason);

    if (tentativas >= MAX_TENTATIVAS) {
      console.log(`🚫 ${MAX_TENTATIVAS} tentativas sem sucesso. Encerrando.`);
      console.log('💡 Reinicie o serviço no painel do Render.');
      process.exit(1);
    }

    tentativas++;
    console.log(`🔄 Tentativa ${tentativas} de ${MAX_TENTATIVAS} em ${INTERVALO_MS / 1000}s...`);

    await new Promise(r => setTimeout(r, INTERVALO_MS));

    client = criarCliente();
    iniciar();
  });

  client.on('auth_failure', (msg) => {
    console.log('🔐 Falha de autenticação:', msg);
    console.log('💡 Delete a pasta auth/ e acesse /qr novamente.');
    process.exit(1);
  });

  client.on('message', async (message) => {
    try {
      await messageHandler(client, message);
    } catch (err) {
      console.log('⚠️ Erro ao processar mensagem:', err.message);
    }
  });

  process.on('unhandledRejection', (err) => {
    console.log('⚠️ Erro não tratado:', err.message);
  });

  client.initialize();
};

iniciar();