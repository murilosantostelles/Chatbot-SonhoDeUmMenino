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

const enviarResposta = async (message, texto) => {
  try {
    await message.reply(texto);
  } catch (err) {
    console.log('⚠️ Erro ao enviar mensagem, tentando novamente em 2s...');
    await new Promise(r => setTimeout(r, 2000));
    try {
      await message.reply(texto);
    } catch (err2) {
      console.log('❌ Falha ao enviar mensagem:', err2.message);
    }
  }
};

const messageHandler = async (client, message) => {
  if (message.fromMe) return;

  const texto = message.body.trim().toLowerCase();
  const numero = message.from;
  const agora = Date.now();

  const contatos = carregarContatos();
  const contato = contatos[numero];

  const horasPassadas = contato
    ? (agora - contato.ultimoContato) / (1000 * 60 * 60)
    : null;

  const ehNovoContato = !contato || horasPassadas >= HORAS_PARA_RENOVAR;

  if (ehNovoContato) {
    contatos[numero] = { ultimoContato: agora, menuAberto: true };
    salvarContatos(contatos);
    await enviarResposta(message, menu);
    return;
  }

  if (texto === 'menu' || texto === 'início' || texto === 'inicio') {
    contatos[numero].menuAberto = true;
    salvarContatos(contatos);
    await enviarResposta(message, menu);
    return;
  }

  if (contato.menuAberto) {
    const opcoes = ['1', '2', '3', '4'];

    if (opcoes.includes(texto)) {
      contatos[numero].menuAberto = false;
      salvarContatos(contatos);

      const resposta = ong.respostas[texto];
      await enviarResposta(message, resposta ?? ong.mensagemPadrao);
      return;
    }

    await enviarResposta(message, 'Por favor, escolha uma das opções do menu digitando um número de *1 a 4*. 😊');
    return;
  }

  // Texto livre após interação — bot não responde, deixa a conversa fluir
};

export default messageHandler;