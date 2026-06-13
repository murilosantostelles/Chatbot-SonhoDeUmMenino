import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ong = require('../data/ong.json');
import menu from './menu.js';
import fs from 'fs';
import path from 'path';

const ARQUIVO_CONTATOS = path.resolve('./data/contatos.json');
const HORAS_PARA_RENOVAR = 24;

const carregarContatos = () => {
  if (!fs.existsSync(ARQUIVO_CONTATOS)) {
    fs.writeFileSync(ARQUIVO_CONTATOS, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(ARQUIVO_CONTATOS));
};

const salvarContatos = (contatos) => {
  fs.writeFileSync(ARQUIVO_CONTATOS, JSON.stringify(contatos, null, 2));
};

// Extrai o texto da mensagem no formato do Baileys
const extrairTexto = (message) => {
  const msg = message.message;
  if (!msg) return null;
  return msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    null;
};

const enviarResposta = async (sock, jid, message, texto) => {
  try {
    await sock.sendMessage(jid, { text: texto }, { quoted: message });
  } catch (err) {
    console.log('⚠️ Erro ao enviar mensagem, tentando novamente em 2s...');
    await new Promise(r => setTimeout(r, 2000));
    try {
      await sock.sendMessage(jid, { text: texto }, { quoted: message });
    } catch (err2) {
      console.log('❌ Falha ao enviar mensagem:', err2.message);
    }
  }
};

const messageHandler = async (sock, message) => {
  // Ignora mensagens enviadas pelo próprio bot
  if (message.key.fromMe) return;

  // Ignora mensagens de grupos
  const jid = message.key.remoteJid;
  if (jid.endsWith('@g.us')) return;

  // Extrai o texto
  const texto = extrairTexto(message);
  if (!texto) return;

  const textoLower = texto.trim().toLowerCase();
  const numero = jid;
  const agoraMs = Date.now();

  const contatos = carregarContatos();
  const contato = contatos[numero];

  const horasPassadas = contato
    ? (agoraMs - contato.ultimoContato) / (1000 * 60 * 60)
    : null;

  const ehNovoContato = !contato || horasPassadas >= HORAS_PARA_RENOVAR;

  if (ehNovoContato) {
    contatos[numero] = { ultimoContato: agoraMs, menuAberto: true };
    salvarContatos(contatos);
    await enviarResposta(sock, jid, message, menu);
    return;
  }

  if (textoLower === 'menu' || textoLower === 'início' || textoLower === 'inicio') {
    contatos[numero].menuAberto = true;
    salvarContatos(contatos);
    await enviarResposta(sock, jid, message, menu);
    return;
  }

  if (contato.menuAberto) {
    const opcoes = ['1', '2', '3', '4'];

    if (opcoes.includes(textoLower)) {
      contatos[numero].menuAberto = false;
      salvarContatos(contatos);

      const resposta = ong.respostas[textoLower];
      await enviarResposta(sock, jid, message, resposta ?? ong.mensagemPadrao);
      return;
    }

    await enviarResposta(sock, jid, message, 'Por favor, escolha uma das opções do menu digitando um número de *1 a 4*. 😊');
    return;
  }

  // Texto livre — bot não responde, deixa a conversa fluir
};

export default messageHandler;