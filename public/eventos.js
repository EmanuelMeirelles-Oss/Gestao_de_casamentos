const ROTA_API = '/api/eventos';
const ROTA_NOIVOS = '/api/noivos';

let listaDeEventos = [];
let listaDeNoivos = [];
let idEmEdicao = null;

const formulario       = document.getElementById('form-evento');
const tituloFormulario = document.getElementById('titulo-form');
const divMensagem      = document.getElementById('mensagem');
const btnSalvar        = document.getElementById('btn-salvar');
const btnCancelar      = document.getElementById('btn-cancelar');
const corpoTabela      = document.getElementById('tbody-eventos');
const spanTotal        = document.getElementById('total-registros');
const selectNoivos     = document.getElementById('noivos_id');

function protegerHtml(texto) {
  return String(texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const d = new Date(dataISO);
  // Avoid timezone shift
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toLocaleDateString('pt-BR');
}

function exibirMensagem(texto, tipo) {
  divMensagem.textContent = texto;
  divMensagem.className = `mensagem ${tipo}`;
  divMensagem.style.display = 'block';
  clearTimeout(exibirMensagem._temporizador);
  exibirMensagem._temporizador = setTimeout(() => { divMensagem.style.display = 'none'; }, 4500);
}

function montarTabela(lista) {
  spanTotal.textContent = `${lista.length} evento(s)`;
  if (lista.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum evento programado.</td></tr>';
    return;
  }
  corpoTabela.innerHTML = lista.map(f => {
    const nomeCasal = f.noivos ? `${f.noivos.nome_noivo} & ${f.noivos.nome_noiva}` : `ID Casal: ${f.noivos_id}`;
    const orcamentoFormatado = f.orcamento ? `R$ ${parseFloat(f.orcamento).toFixed(2).replace('.', ',')}` : 'Não informado';
    return `
      <tr>
        <td>${protegerHtml(nomeCasal)}</td>
        <td>${formatarData(f.data_evento)}</td>
        <td>${protegerHtml(f.local)}</td>
        <td>${protegerHtml(orcamentoFormatado)}</td>
        <td class="acoes">
          <button class="btn-editar"  data-id="${f.id}">Editar</button>
          <button class="btn-excluir" data-id="${f.id}" data-nome="${protegerHtml('Evento de ' + nomeCasal)}">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function carregarNoivos() {
  try {
    const resposta = await fetch(ROTA_NOIVOS);
    if (!resposta.ok) return;
    listaDeNoivos = await resposta.json();
    selectNoivos.innerHTML = '<option value="">Selecione um casal...</option>' + 
      listaDeNoivos.map(n => `<option value="${n.id}">${protegerHtml(n.nome_noivo)} e ${protegerHtml(n.nome_noiva)}</option>`).join('');
  } catch (err) {
    console.error("Erro ao carregar noivos no select:", err);
  }
}

async function carregarEventos() {
  try {
    const resposta = await fetch(ROTA_API);
    if (!resposta.ok) throw new Error('Falha ao buscar dados.');
    listaDeEventos = await resposta.json();
    montarTabela(listaDeEventos);
  } catch {
    exibirMensagem('Erro ao carregar eventos. Verifique o servidor.', 'erro');
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Erro ao carregar dados.</td></tr>';
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = {
    noivos_id:   document.getElementById('noivos_id').value,
    data_evento: document.getElementById('data_evento').value,
    local:       document.getElementById('local').value.trim(),
    descricao:   document.getElementById('descricao').value.trim(),
    orcamento:   document.getElementById('orcamento').value ? parseFloat(document.getElementById('orcamento').value) : null,
  };

  if (!dados.noivos_id || !dados.data_evento || !dados.local) {
    exibirMensagem('Noivos, Data do Evento e Local são campos obrigatórios.', 'erro');
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
      exibirMensagem(retorno.erro || 'Erro ao salvar evento.', 'erro');
      return;
    }
    exibirMensagem(idEmEdicao ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'sucesso');
    limparFormulario();
    await carregarEventos();
  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
});

function abrirEdicao(id) {
  const evt = listaDeEventos.find(f => f.id === id);
  if (!evt) return;
  document.getElementById('noivos_id').value   = evt.noivos_id;
  document.getElementById('data_evento').value = evt.data_evento;
  document.getElementById('local').value       = evt.local;
  document.getElementById('descricao').value   = evt.descricao || '';
  document.getElementById('orcamento').value   = evt.orcamento || '';

  idEmEdicao = id;
  tituloFormulario.textContent = 'Editar Evento';
  btnSalvar.textContent        = 'Salvar Alterações';
  btnCancelar.style.display    = 'inline-block';
  document.getElementById('noivos_id').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function removerEvento(id, nome) {
  if (!confirm(`Confirmar exclusão do ${nome}?`)) return;
  try {
    const resposta = await fetch(`${ROTA_API}/${id}`, { method: 'DELETE' });
    const retorno  = await resposta.json();
    if (!resposta.ok) {
      exibirMensagem(retorno.erro || 'Erro ao excluir evento.', 'erro');
      return;
    }
    exibirMensagem('Evento excluído com sucesso!', 'sucesso');
    if (idEmEdicao === id) limparFormulario();
    await carregarEventos();
  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
}

function limparFormulario() {
  formulario.reset();
  idEmEdicao = null;
  tituloFormulario.textContent = 'Criar Evento';
  btnSalvar.textContent        = 'Salvar Evento';
  btnCancelar.style.display    = 'none';
  divMensagem.style.display    = 'none';
}

btnCancelar.addEventListener('click', limparFormulario);

corpoTabela.addEventListener('click', (evento) => {
  const btnEditar  = evento.target.closest('.btn-editar');
  const btnExcluir = evento.target.closest('.btn-excluir');
  if (btnEditar) abrirEdicao(parseInt(btnEditar.dataset.id, 10));
  if (btnExcluir) removerEvento(parseInt(btnExcluir.dataset.id, 10), btnExcluir.dataset.nome);
});

carregarNoivos().then(() => carregarEventos());
