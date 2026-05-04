const fs   = require('fs');
const path = require('path');

const CAMINHO_ARQUIVO = path.join(__dirname, 'fornecedores.json');

function ler() {
  if (!fs.existsSync(CAMINHO_ARQUIVO)) {
    fs.writeFileSync(CAMINHO_ARQUIVO, JSON.stringify({ proximo_id: 1, registros: [] }, null, 2), 'utf8');
  }
  return JSON.parse(fs.readFileSync(CAMINHO_ARQUIVO, 'utf8'));
}

function salvar(dados) {
  fs.writeFileSync(CAMINHO_ARQUIVO, JSON.stringify(dados, null, 2), 'utf8');
}

const db = {
  listarTodos() {
    const { registros } = ler();
    return registros.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  },

  buscarPorId(id) {
    const { registros } = ler();
    return registros.find(r => r.id === Number(id)) || null;
  },

  criar(dados) {
    const arquivo = ler();
    const novo    = { id: arquivo.proximo_id, ...dados, criado_em: new Date().toISOString() };
    arquivo.registros.push(novo);
    arquivo.proximo_id += 1;
    salvar(arquivo);
    return novo;
  },

  atualizar(id, dados) {
    const arquivo = ler();
    const posicao = arquivo.registros.findIndex(r => r.id === Number(id));
    if (posicao === -1) return null;
    arquivo.registros[posicao] = { ...arquivo.registros[posicao], ...dados };
    salvar(arquivo);
    return arquivo.registros[posicao];
  },

  excluir(id) {
    const arquivo = ler();
    const existe  = arquivo.registros.some(r => r.id === Number(id));
    if (!existe) return false;
    arquivo.registros = arquivo.registros.filter(r => r.id !== Number(id));
    salvar(arquivo);
    return true;
  },
};

module.exports = db;
