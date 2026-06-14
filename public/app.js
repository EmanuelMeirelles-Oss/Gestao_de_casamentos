const ROTA_API = '/api/fornecedores';

let listaDeFornecedores = [];
let idEmEdicao = null;

const formulario       = document.getElementById('form-fornecedor');
const tituloFormulario = document.getElementById('titulo-form');
const divMensagem      = document.getElementById('mensagem');
const btnSalvar        = document.getElementById('btn-salvar');
const btnCancelar      = document.getElementById('btn-cancelar');
const corpoTabela      = document.getElementById('tbody-fornecedores');
const spanTotal        = document.getElementById('total-registros');

// Evita que caracteres especiais virem código HTML na página
function protegerHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Exibe uma mensagem de sucesso ou erro por alguns segundos
function exibirMensagem(texto, tipo) {
  divMensagem.textContent = texto;
  divMensagem.className = `mensagem ${tipo}`;
  divMensagem.style.display = 'block';
  clearTimeout(exibirMensagem._temporizador);
  exibirMensagem._temporizador = setTimeout(() => {
    divMensagem.style.display = 'none';
  }, 4500);
}

// Monta as linhas da tabela com os fornecedores recebidos
function montarTabela(lista) {
  spanTotal.textContent = `${lista.length} fornecedor(es)`;

  if (lista.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum fornecedor cadastrado.</td></tr>';
    return;
  }

  corpoTabela.innerHTML = lista.map(f => `
    <tr>
      <td>${protegerHtml(f.nome)}</td>
      <td>${protegerHtml(f.tipo_servico)}</td>
      <td>${protegerHtml(f.email)}</td>
      <td>${protegerHtml(f.telefone)}</td>
      <td class="acoes">
        <button class="btn-editar"  data-id="${f.id}">Editar</button>
        <button class="btn-excluir" data-id="${f.id}" data-nome="${protegerHtml(f.nome)}">Excluir</button>
      </td>
    </tr>
  `).join('');
}

// Busca todos os fornecedores no servidor e atualiza a tabela
async function carregarFornecedores() {
  try {
    const resposta = await fetch(ROTA_API);
    if (!resposta.ok) throw new Error('Falha ao buscar dados.');
    listaDeFornecedores = await resposta.json();
    montarTabela(listaDeFornecedores);
  } catch {
    exibirMensagem('Erro ao carregar fornecedores. Verifique o servidor.', 'erro');
    corpoTabela.innerHTML = '<tr><td colspan="5" class="vazio">Erro ao carregar dados.</td></tr>';
  }
}

// Envia o formulário para cadastrar ou atualizar um fornecedor
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const dados = {
    nome:         document.getElementById('nome').value.trim(),
    tipo_servico: document.getElementById('tipo_servico').value.trim(),
    email:        document.getElementById('email').value.trim(),
    telefone:     document.getElementById('telefone').value.trim(),
  };

  if (!dados.nome || !dados.tipo_servico || !dados.email || !dados.telefone) {
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
      exibirMensagem(retorno.erro || 'Erro ao salvar fornecedor.', 'erro');
      return;
    }

    exibirMensagem(
      idEmEdicao ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!',
      'sucesso'
    );
    limparFormulario();
    await carregarFornecedores();

  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
});

// Preenche o formulário com os dados do fornecedor escolhido para edição
function abrirEdicao(id) {
  const fornecedor = listaDeFornecedores.find(f => f.id === id);
  if (!fornecedor) return;

  document.getElementById('nome').value         = fornecedor.nome;
  document.getElementById('tipo_servico').value = fornecedor.tipo_servico;
  document.getElementById('email').value        = fornecedor.email;
  document.getElementById('telefone').value     = fornecedor.telefone;

  idEmEdicao                   = id;
  tituloFormulario.textContent = 'Editar Fornecedor';
  btnSalvar.textContent        = 'Salvar Alterações';
  btnCancelar.style.display    = 'inline-block';

  document.getElementById('nome').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Solicita confirmação e remove o fornecedor
async function removerFornecedor(id, nome) {
  if (!confirm(`Confirmar exclusão do fornecedor "${nome}"?`)) return;

  try {
    const resposta = await fetch(`${ROTA_API}/${id}`, { method: 'DELETE' });
    const retorno  = await resposta.json();

    if (!resposta.ok) {
      exibirMensagem(retorno.erro || 'Erro ao excluir fornecedor.', 'erro');
      return;
    }

    exibirMensagem('Fornecedor excluído com sucesso!', 'sucesso');
    if (idEmEdicao === id) limparFormulario();
    await carregarFornecedores();

  } catch {
    exibirMensagem('Erro de conexão com o servidor.', 'erro');
  }
}

// Limpa o formulário e volta ao modo de cadastro
function limparFormulario() {
  formulario.reset();
  idEmEdicao                   = null;
  tituloFormulario.textContent = 'Cadastrar Fornecedor';
  btnSalvar.textContent        = 'Cadastrar';
  btnCancelar.style.display    = 'none';
  divMensagem.style.display    = 'none';
}

btnCancelar.addEventListener('click', limparFormulario);

// Detecta clique nos botões Editar e Excluir de qualquer linha da tabela
corpoTabela.addEventListener('click', (evento) => {
  const btnEditar  = evento.target.closest('.btn-editar');
  const btnExcluir = evento.target.closest('.btn-excluir');

  if (btnEditar) {
    abrirEdicao(parseInt(btnEditar.dataset.id, 10));
  }
  if (btnExcluir) {
    removerFornecedor(parseInt(btnExcluir.dataset.id, 10), btnExcluir.dataset.nome);
  }
});

// Aplica máscara de telefone
aplicarMascaraTelefone(document.getElementById('telefone'));

// Carrega os fornecedores assim que a página abre
carregarFornecedores();
