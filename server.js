const express = require('express');
const path    = require('path');
const supabase = require('./db_supabase');

const app  = express();
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

// ====== ROTAS DE FORNECEDORES (usando Supabase) ======

// Listar todos os fornecedores
app.get('/api/fornecedores', async (req, res) => {
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome', { ascending: true });
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data || []);
});

// Buscar um fornecedor pelo ID
app.get('/api/fornecedores/:id', async (req, res) => {
    const { data, error } = await supabase.from('fornecedores').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
    res.json(data);
});

// Cadastrar novo fornecedor
app.post('/api/fornecedores', async (req, res) => {
    const erro = validarFornecedor(req.body);
    if (erro) return res.status(400).json({ erro });

           const { nome, tipo_servico, email, telefone } = req.body;
    const { data, error } = await supabase.from('fornecedores').insert([{
          nome: nome.trim(),
          tipo_servico: tipo_servico.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
    }]).select().single();

           if (error) return res.status(500).json({ erro: error.message });
    res.status(201).json(data);
});

// Atualizar dados de um fornecedor
app.put('/api/fornecedores/:id', async (req, res) => {
    const erro = validarFornecedor(req.body);
    if (erro) return res.status(400).json({ erro });

          const { nome, tipo_servico, email, telefone } = req.body;
    const { data, error } = await supabase.from('fornecedores').update({
          nome: nome.trim(),
          tipo_servico: tipo_servico.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
    }).eq('id', req.params.id).select().single();

          if (error || !data) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
    res.json(data);
});

// Excluir um fornecedor
app.delete('/api/fornecedores/:id', async (req, res) => {
    const { error } = await supabase.from('fornecedores').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ erro: error.message });
    res.json({ mensagem: 'Fornecedor excluído com sucesso.' });
});

// ====== ROTAS DE NOIVOS ======
app.get('/api/noivos', async (req, res) => {
    const { data, error } = await supabase.from('noivos').select('*').order('nome_noiva', { ascending: true });
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data || []);
});

app.get('/api/noivos/:id', async (req, res) => {
    const { data, error } = await supabase.from('noivos').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ erro: 'Casal não encontrado.' });
    res.json(data);
});

app.post('/api/noivos', async (req, res) => {
    const { nome_noivo, nome_noiva, email, telefone } = req.body;
    if (!nome_noivo || !nome_noiva || !email || !telefone) {
          return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }
    const { data, error } = await supabase.from('noivos').insert([{ nome_noivo, nome_noiva, email, telefone }]).select().single();
    if (error) return res.status(500).json({ erro: error.message });
    res.status(201).json(data);
});

app.put('/api/noivos/:id', async (req, res) => {
    const { nome_noivo, nome_noiva, email, telefone } = req.body;
    const { data, error } = await supabase.from('noivos').update({ nome_noivo, nome_noiva, email, telefone }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data);
});

app.delete('/api/noivos/:id', async (req, res) => {
    const { error } = await supabase.from('noivos').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ erro: error.message });
    res.json({ mensagem: 'Casal excluído com sucesso.' });
});

// ====== ROTAS DE EVENTOS ======
app.get('/api/eventos', async (req, res) => {
    const { data, error } = await supabase.from('eventos').select('*, noivos(nome_noivo, nome_noiva)').order('data_evento', { ascending: true });
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data || []);
});

app.get('/api/eventos/:id', async (req, res) => {
    const { data, error } = await supabase.from('eventos').select('*, noivos(nome_noivo, nome_noiva)').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ erro: 'Evento não encontrado.' });
    res.json(data);
});

app.post('/api/eventos', async (req, res) => {
    const { noivos_id, data_evento, local, descricao, orcamento } = req.body;
    if (!noivos_id || !data_evento || !local) {
          return res.status(400).json({ erro: 'noivos_id, data_evento e local são obrigatórios.' });
    }
    const { data, error } = await supabase.from('eventos').insert([{ noivos_id, data_evento, local, descricao, orcamento }]).select().single();
    if (error) return res.status(500).json({ erro: error.message });
    res.status(201).json(data);
});

app.put('/api/eventos/:id', async (req, res) => {
    const { noivos_id, data_evento, local, descricao, orcamento } = req.body;
    const { data, error } = await supabase.from('eventos').update({ noivos_id, data_evento, local, descricao, orcamento }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data);
});

app.delete('/api/eventos/:id', async (req, res) => {
    const { error } = await supabase.from('eventos').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ erro: error.message });
    res.json({ mensagem: 'Evento excluído com sucesso.' });
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});
