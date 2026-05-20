import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import messageHandler from './messageHandler.js';

const MAX_TENTATIVAS = 5;
const INTERVALO_MS = 5000; // 5 segundos entre tentativas
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
    console.log('📱 Escaneie o QR Code abaixo com o WhatsApp da ONG:\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    tentativas = 0; // reseta o contador ao conectar com sucesso
    console.log('✅ Bot conectado e pronto para atender!');
  });

  client.on('disconnected', async (reason) => {
    console.log('❌ Bot desconectado. Motivo:', reason);

    if (tentativas >= MAX_TENTATIVAS) {
      console.log(`🚫 ${MAX_TENTATIVAS} tentativas sem sucesso. Encerrando.`);
      console.log('💡 Verifique a conexão e reinicie com: node src/bot.js');
      process.exit(1); // encerra o processo limpo
    }

    tentativas++;
    console.log(`🔄 Tentativa ${tentativas} de ${MAX_TENTATIVAS} em ${INTERVALO_MS / 1000}s...`);

    await new Promise(r => setTimeout(r, INTERVALO_MS));

    client = criarCliente(); // cria instância nova
    iniciar();               // reinicia os listeners
  });

  client.on('auth_failure', (msg) => {
    console.log('🔐 Falha de autenticação:', msg);
    console.log('💡 Delete a pasta auth/ e escaneie o QR Code novamente.');
    process.exit(1);
  });

  client.on('message', (message) => {
    messageHandler(client, message);
  });

  client.initialize();
};

iniciar();