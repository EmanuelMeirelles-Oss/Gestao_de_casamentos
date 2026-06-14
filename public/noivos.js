const ROTA_API = '/api/noivos';

let listaDeNoivos = [];
let idEmEdicao = null;

const formulario       = document.getElementById('form-noivos');
const tituloFormulario = document.getElementById('titulo-form');
const divMensagem      = document.getElementById('mensagem');
const btnSalvar        = document.getElementById('btn-salvar');
const btnCancelar      = document.getElementById('btn-cancelar');
const corpoTabela      = document.getElementById('tbody-noivos');
const spanTotal        = document.getElementById('total-registros');

function protegerHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function exibirMensagem(texto, tipo) {
  divMensagem.textContent = texto;
  divMensagem.className = `mensagem ${tipo}`;
  divMensagem.style.display = 'block';
  clearTimeout(exibirMensagem._temporizador);
  exibirMensagem._temporizador = setTimeout(() => { divMensagem.style.display = 'none'; }, 4500);
}

function montarTabela(lista) {
  spanTotal.textContent = `${lista.length} casal(is)`;
  if (lista.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum casal cadastrado.</td></tr>';
    return;
  }
  corpoTabela.innerHTML = lista.map(f => `
    <tr>
      <td>${protegerHtml(f.nome_noivo)}</td>
      <td>${protegerHtml(f.nome_noiva)}</td>
      <td>${protegerHtml(f.email)}</td>
      <td>${protegerHtml(f.telefone)}</td>
      <td class="acoes">
        <button class="btn-editar"  data-id="${f.id}">Editar</button>
        <button class="btn-excluir" data-id="${f.id}" data-nome="${protegerHtml(f.nome_noivo + ' e ' + f.nome_noiva)}">Excluir</button>
      </td>
    </tr>
  `).join('');
}

async function carregarNoivos() {
  try {
    const resposta = await fetch(ROTA_API);
    if (!resposta.ok) throw new Error('Falha ao buscar dados.');
    listaDeNoivos = await resposta.json();
    montarTabela(listaDeNoivos);
  } catch {
    exibirMensagem('Erro ao carregar noivos. Verifique o servidor.', 'erro');
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Erro ao carregar dados.</td></tr>';
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = {
    nome_noivo: document.getElementById('nome_noivo').value.trim(),
    nome_noiva: document.getElementById('nome_noiva').value.trim(),
    email:      document.getElementById('email').value.trim(),
    telefone:   document.getElementById('telefone').value.trim(),
  };

  if (!dados.nome_noivo || !dados.nome_noiva || !dados.email || !dados.telefone) {
    exibirMensagem('Preencha todos os campos obrigatórios.', 'erro');
    return;
  }

  const endereco = idEmEdicao ? `${ROTA_API}/${idEmEdicao}` : ROTA_API;
  const metodo   = idEmEdicao ? 'PUT' : 'POST';

  try {
    const resposta = await fetch(endereco, {
      method:  metodo,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dados),
    });
    const retorno = await resposta.json();
    if (!resposta.ok) {
      exibirMensagem(retorno.erro || 'Erro ao salvar casal.', 'erro');
      return;
    }
    exibirMensagem(idEmEdicao ? 'Casal atualizado com sucesso!' : 'Casal cadastrado com sucesso!', 'sucesso');
    limparFormulario();
    await carregarNoivos();
  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
});

function abrirEdicao(id) {
  const casal = listaDeNoivos.find(f => f.id === id);
  if (!casal) return;
  document.getElementById('nome_noivo').value = casal.nome_noivo;
  document.getElementById('nome_noiva').value = casal.nome_noiva;
  document.getElementById('email').value      = casal.email;
  document.getElementById('telefone').value   = casal.telefone;

  idEmEdicao = id;
  tituloFormulario.textContent = 'Editar Casal';
  btnSalvar.textContent        = 'Salvar Alterações';
  btnCancelar.style.display    = 'inline-block';
  document.getElementById('nome_noivo').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function removerNoivos(id, nome) {
  if (!confirm(`Confirmar exclusão do casal "${nome}"?`)) return;
  try {
    const resposta = await fetch(`${ROTA_API}/${id}`, { method: 'DELETE' });
    const retorno  = await resposta.json();
    if (!resposta.ok) {
      exibirMensagem(retorno.erro || 'Erro ao excluir casal.', 'erro');
      return;
    }
    exibirMensagem('Casal excluído com sucesso!', 'sucesso');
    if (idEmEdicao === id) limparFormulario();
    await carregarNoivos();
  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
}

function limparFormulario() {
  formulario.reset();
  idEmEdicao = null;
  tituloFormulario.textContent = 'Cadastrar Noivos';
  btnSalvar.textContent        = 'Cadastrar';
  btnCancelar.style.display    = 'none';
  divMensagem.style.display    = 'none';
}

btnCancelar.addEventListener('click', limparFormulario);

corpoTabela.addEventListener('click', (evento) => {
  const btnEditar  = evento.target.closest('.btn-editar');
  const btnExcluir = evento.target.closest('.btn-excluir');
  if (btnEditar) abrirEdicao(parseInt(btnEditar.dataset.id, 10));
  if (btnExcluir) removerNoivos(parseInt(btnExcluir.dataset.id, 10), btnExcluir.dataset.nome);
});

// Aplica máscara de telefone
aplicarMascaraTelefone(document.getElementById('telefone'));

carregarNoivos();
