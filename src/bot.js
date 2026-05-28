import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import messageHandler from './messageHandler.js';

const MAX_QR = 3;
const MAX_TENTATIVAS = 5;
const INTERVALO_MS = 5000;

let qrCount = 0;
let tentativas = 0;

const criarCliente = () => new Client({
  authStrategy: new LocalAuth({
    dataPath: './auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let client = criarCliente();

const iniciar = () => {

  client.on('qr', (qr) => {
    qrCount++;

    if (qrCount > MAX_QR) {
      console.log('⏱️ QR Code expirou 3 vezes sem ser escaneado. Encerrando...');
      console.log('💡 Rode novamente: node src/bot.js');
      process.exit(0);
    }

    console.log(`📱 QR Code (tentativa ${qrCount} de ${MAX_QR}) — escaneie com o WhatsApp da ONG:\n`);
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    qrCount = 0;
    tentativas = 0;
    console.log('✅ Bot conectado e pronto para atender!');
  });

  client.on('disconnected', async (reason) => {
    console.log('❌ Bot desconectado. Motivo:', reason);

    if (tentativas >= MAX_TENTATIVAS) {
      console.log(`🚫 ${MAX_TENTATIVAS} tentativas sem sucesso. Encerrando.`);
      console.log('💡 Verifique a conexão e reinicie com: node src/bot.js');
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
    console.log('💡 Delete a pasta auth/ e escaneie o QR Code novamente:');
    console.log('   Windows: rmdir /s /q auth');
    console.log('   Mac/Linux: rm -rf auth/');
    console.log('   Depois rode: node src/bot.js');
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