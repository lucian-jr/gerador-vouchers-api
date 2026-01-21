import React from 'react';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { renderToStream } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { uploadPdfToS3 } from './services/storage';
import { Voucher } from './templates/Voucher';
import fs from 'fs';
import path from 'path';

// --- CONFIGURAÇÃO DO SERVIDOR ---
const app = express();
const PORT = 3000;

app.use(cors());
// Aumentamos o limite para aceitar JSONs grandes (lotes de 100+)
app.use(express.json({ limit: '50mb' })); 

// --- FUNÇÕES AUXILIARES ---

function carregarImagemLocal(nomeArquivo: string) {
  try {
    const caminho = path.resolve(__dirname, 'assets', nomeArquivo);
    // console.log(`🔍 Lendo imagem: ${caminho}`); // Descomente para debug
    
    if (!fs.existsSync(caminho)) {
        console.error(`❌ ARQUIVO NÃO EXISTE: ${caminho}`);
        return '';
    }

    const bitmap = fs.readFileSync(caminho);
    return `data:image/png;base64,${Buffer.from(bitmap).toString('base64')}`;
  } catch (err) {
    console.error(`❌ Erro imagem (${nomeArquivo}):`, err);
    return '';
  }
}

// 1. Pré-carrega as imagens UMA vez quando o servidor liga
console.log('🔄 Pré-carregando imagens na memória...');
const LOGO_MCE = carregarImagemLocal('logo-mce.png');
const LOGO_PARK = carregarImagemLocal('logo-park.png');


// --- ROTA DA API (Onde o Postman vai bater) ---

app.post('/api/gerar-vouchers', async (req: Request, res: Response): Promise<any> => {
  try {
    // Pega a lista que vem do Postman
    const { vouchers } = req.body; 

    if (!vouchers || !Array.isArray(vouchers)) {
      return res.status(400).json({ error: 'Formato inválido. Envie { "vouchers": [...] }' });
    }

    console.log(`📨 Recebido pedido para gerar ${vouchers.length} vouchers.`);
    
    // Para medir o tempo total
    const inicio = Date.now();
    const resultados = [];

    // Loop de Geração
    for (const dados of vouchers) {
      try {
        // Gera Link e QR Code
        const linkResgate = `https://www.meucopoeco.com.br/site/resgate_caucao/${dados.codigo}`;
        
        const qrCodeDataUrl = await QRCode.toDataURL(linkResgate, {
          width: 300, margin: 1, color: { dark: '#000000', light: '#ffffff' }
        });

        // Renderiza PDF
        const stream = await renderToStream(
          <Voucher 
            codigo={dados.codigo} 
            idProduto={dados.id_produto}
            nomeProduto={dados.nome_produto}
            qrCodeBase64={qrCodeDataUrl}
            logoMceBase64={LOGO_MCE}
            logoMusicParkBase64={LOGO_PARK}
          />
        );

        // --- SUA CORREÇÃO DO BUFFER AQUI ---
        const chunks: any[] = [];
        for await (const chunk of stream) {
           chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        // -----------------------------------

        // Upload S3
        const url = await uploadPdfToS3(`${dados.codigo}.pdf`, buffer);
        
        resultados.push({ codigo: dados.codigo, url: url, status: 'sucesso' });
        
        // Log simplificado para não poluir demais
        // console.log(`✅ ${dados.codigo} OK`);

      } catch (err: any) {
        console.error(`❌ Falha no voucher ${dados.codigo}:`, err);
        resultados.push({ codigo: dados.codigo, erro: err.message, status: 'erro' });
      }
    }

    const fim = Date.now();
    const tempoTotal = (fim - inicio) / 1000;

    console.log(`🏁 Lote finalizado em ${tempoTotal} segundos.`);

    // Responde para o Postman
    return res.json({
      mensagem: 'Processamento concluído',
      tempo_segundos: tempoTotal,
      total_processado: vouchers.length,
      sucessos: resultados.filter(r => r.status === 'sucesso').length,
      erros: resultados.filter(r => r.status === 'erro').length,
      dados: resultados
    });

  } catch (error: any) {
    console.error('Erro fatal na rota:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// --- INICIALIZA O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor API pronto em http://localhost:${PORT}`);
  console.log(`📡 Rota disponível: POST /api/gerar-vouchers`);
});