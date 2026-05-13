import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ong = require('../data/ong.json');
import menu from './menu.js';
import fs from 'fs';
import path from 'path';

const ARQUIVO_CONTATOS = path.resolve('./data/contatos.json');

// Carrega contatos salvos ou cria arquivo vazio
const carregarContatos = () => {
    if (!fs.existsSync(ARQUIVO_CONTATOS)) {
        fs.writeFileSync(ARQUIVO_CONTATOS, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(ARQUIVO_CONTATOS));
};

const salvarContatos = (contatos) => {
    fs.writeFileSync(ARQUIVO_CONTATOS, JSON.stringify(contatos, null, 2));
};

const HORAS_PARA_RENOVAR = 12; // após 12h, considera novo contato novamente

const messageHandler = async (client, message) => {
    // Ignora mensagens enviadas pela própria ONG
    if (message.fromMe) return;

    const texto = message.body.trim().toLowerCase();
    const numero = message.from;
    const agora = Date.now();

    const contatos = carregarContatos();
    const ultimoContato = contatos[numero];
    const horasPassadas = ultimoContato
        ? (agora - ultimoContato) / (1000 * 60 * 60)
        : null;

    const ehNovoContato = !ultimoContato || horasPassadas >= HORAS_PARA_RENOVAR;

    if (ehNovoContato) {
        contatos[numero] = agora;
        salvarContatos(contatos);
        await message.reply(menu);
        return;
    }

    // Contato já conhecido dentro do período — processa normalmente
    const resposta = ong.respostas[texto];
    if (resposta) {
        await message.reply(resposta);
    } else {
        await message.reply(ong.mensagemPadrao);
    }
};

export default messageHandler;