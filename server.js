const express = require('express');
const path    = require('path');
const db      = require('./database');

const app   = express();
const PORTA = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validarFornecedor(dados) {
  const { nome, tipo_servico, email, telefone } = dados;

  if (!nome || !tipo_servico || !email || !telefone) {
    return 'Todos os campos são obrigatórios.';
  }
  if (nome.trim().length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres.';
  }
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email.trim())) {
    return 'E-mail inválido.';
  }
  const regexTelefone = /^[\d\s()\-+]{8,20}$/;
  if (!regexTelefone.test(telefone.trim())) {
    return 'Telefone inválido. Use apenas números, parênteses, traços e espaços (8 a 20 caracteres).';
  }
  return null;
}

// Listar todos os fornecedores
app.get('/api/fornecedores', (req, res) => {
  res.json(db.listarTodos());
});

// Buscar um fornecedor pelo ID
app.get('/api/fornecedores/:id', (req, res) => {
  const fornecedor = db.buscarPorId(req.params.id);
  if (!fornecedor) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }
  res.json(fornecedor);
});

// Cadastrar novo fornecedor
app.post('/api/fornecedores', (req, res) => {
  const erro = validarFornecedor(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, tipo_servico, email, telefone } = req.body;
  const novo = db.criar({
    nome:         nome.trim(),
    tipo_servico: tipo_servico.trim(),
    email:        email.trim(),
    telefone:     telefone.trim(),
  });
  res.status(201).json(novo);
});

// Atualizar dados de um fornecedor
app.put('/api/fornecedores/:id', (req, res) => {
  const erro = validarFornecedor(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, tipo_servico, email, telefone } = req.body;
  const atualizado = db.atualizar(req.params.id, {
    nome:         nome.trim(),
    tipo_servico: tipo_servico.trim(),
    email:        email.trim(),
    telefone:     telefone.trim(),
  });

  if (!atualizado) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }
  res.json(atualizado);
});

// Excluir um fornecedor
app.delete('/api/fornecedores/:id', (req, res) => {
  const removido = db.excluir(req.params.id);
  if (!removido) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
  }
  res.json({ mensagem: 'Fornecedor excluído com sucesso.' });
});

app.listen(PORTA, () => {
  console.log('\n  Servidor iniciado com sucesso!');
  console.log(`  Acesse: http://localhost:${PORTA}\n`);
});
