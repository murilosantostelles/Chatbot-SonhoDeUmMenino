import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcodeTerminal from 'qrcode-terminal';
import qrcodeWeb from 'qrcode';
import express from 'express';
import pino from 'pino';
import messageHandler from './messageHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

let qrAtual = null;
let sock = null;

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

const conectar = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  console.log(`🔧 Usando WhatsApp Web versão ${version.join('.')}`);

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Chatbot ONG', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: false,
    fireInitQueries: true,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrAtual = qr;
      qrcodeTerminal.generate(qr, { small: true });
      console.log('📱 QR Code gerado — acesse /qr no navegador para escanear');
    }

    if (connection === 'close') {
      qrAtual = null;
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode
        : null;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Conexão fechada. Motivo:', lastDisconnect?.error?.message);

      if (shouldReconnect) {
        console.log('🔄 Reconectando em 5 segundos...');
        setTimeout(conectar, 5000);
      } else {
        console.log('🚫 Deslogado do WhatsApp.');
        console.log('💡 Delete a pasta auth/ e reinicie: pm2 restart chatbot-ong');
      }
    }

    if (connection === 'open') {
      qrAtual = null;
      console.log('✅ Bot conectado e pronto para atender!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      try {
        await messageHandler(sock, message);
      } catch (err) {
        console.log('⚠️ Erro ao processar mensagem:', err.message);
      }
    }
  });
};

process.on('unhandledRejection', (err) => {
  console.log('⚠️ Erro não tratado:', err.message);
});

conectar();