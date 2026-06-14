// Formata o campo de telefone conforme o usuário digita: (XX) XXXXX-XXXX
function aplicarMascaraTelefone(input) {
  if (!input) return;

  input.addEventListener('input', () => {
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);

    if (digitos.length === 0) {
      input.value = '';
    } else if (digitos.length <= 2) {
      input.value = `(${digitos}`;
    } else if (digitos.length <= 6) {
      input.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    } else if (digitos.length <= 10) {
      input.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    } else {
      input.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
  });
}
