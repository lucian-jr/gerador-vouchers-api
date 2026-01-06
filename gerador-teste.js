const fs = require('fs');

// Função para gerar Hash de 25 caracteres (Letras Maiúsculas e Números)
function gerarHash(tamanho) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < tamanho; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

// IDs de produtos para variar os layouts (Copo, Cartão, Music Park...)
const idsProdutos = [1, 15, 16]; 

const lista = [];

// Gerar 100 itens
console.log('Gerando 100 vouchers aleatórios...');

for (let i = 0; i < 100; i++) {
    lista.push({
        id_produto: idsProdutos[Math.floor(Math.random() * idsProdutos.length)],
        codigo: gerarHash(25)
        // O campo 'nome' foi removido conforme solicitado
    });
}

const payload = { vouchers: lista };

// Salva no arquivo
fs.writeFileSync('teste_payload.json', JSON.stringify(payload, null, 2));

console.log('✅ Arquivo "teste_payload.json" criado com sucesso!');
console.log('Copie o conteúdo dele e cole no Body do Postman.');