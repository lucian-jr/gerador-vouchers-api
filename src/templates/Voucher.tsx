import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Definição das Props (os dados que variam)
interface VoucherProps {
  codigo: string;
  idProduto: number;
  nomeProduto: string;
  qrCodeBase64: string;
  logoMceBase64: string;
  logoMusicParkBase64: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 10,
    // Simulando a largura de 260px do seu CSS original
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoContainer: {
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    objectFit: 'contain',
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  headerText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  infos: {
    marginVertical: 5,
  },
  infoText: {
    fontSize: 9,
    marginBottom: 2,
    color: '#000',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  qrImage: {
    width: 125,
    height: 125,
  },
  codeText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 5,
    textAlign: 'center',
    color: '#000',
    lineHeight: 1.1,
  },
  footer: {
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
  },
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333',
  }
});

const formatLongHash = (text: string) => {
  if (!text) return '';
  return text.match(/.{1,22}/g)?.join('\n') || text;
};

export const Voucher = ({ codigo, idProduto, nomeProduto, qrCodeBase64, logoMceBase64, logoMusicParkBase64 }: VoucherProps) => {

  const isMusicPark = ![15, 16, 17].includes(idProduto);

  // const isCopoEco = [1, 13, 15, 16, 25, 26, 28, 30].includes(idProduto);
  const produtoNome = nomeProduto || 'Caução';

  let valor = 'R$ 10,00';
  // if (idProduto === 15) valor = 'R$ 0,10';
  // else if (idProduto === 16 || idProduto === 17) valor = 'R$ 15,00';

  return (
    <Document>
      {/* Tamanho customizado: [largura, altura] em pontos (72pts = 1 polegada) */}
      {/* 200pt ~= 7cm de largura (papel térmico/celular) */}
      <Page size={[220, 450]} style={styles.page}>

        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Note: React PDF baixa a imagem da URL na hora de gerar */}
            <Image
              style={styles.logo}
              src={logoMceBase64}
            />
          </View>

          {isMusicPark && (
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                src={logoMusicParkBase64}
              />
            </View>
          )}

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{produtoNome}</Text>
            <Text style={styles.headerText}>{valor}</Text>
          </View>
        </View>

        {/* INSTRUÇÕES */}
        <View style={styles.infos}>
          <Text style={[styles.infoText, styles.bold, { marginBottom: 6 }]}>
            Este cupom vale por 7 dias e ficará disponível em até 24h após a impressão.
          </Text>
          <Text style={styles.infoText}>1. Aponte a câmera do seu celular para o QR Code</Text>
          <Text style={styles.infoText}>2. Acesse o link que aparecer</Text>
          <Text style={styles.infoText}>3. Preencha seus dados Pix</Text>
          <Text style={styles.infoText}>4. Receba sua caução!</Text>
        </View>

        {/* QR CODE E CÓDIGO */}
        <View style={styles.qrSection}>
          <Image src={qrCodeBase64} style={styles.qrImage} />
          <Text style={styles.codeText}>{formatLongHash(codigo)}</Text>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Dúvidas? saceventos@meucopoeco.com.br</Text>
          <Text style={styles.footerText}>Voucher único e de sua responsabilidade</Text>
        </View>

      </Page>
    </Document>
  );
};