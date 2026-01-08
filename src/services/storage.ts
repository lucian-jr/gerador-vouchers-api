import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Força o carregamento do .env procurando na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// DEBUG: Vamos ver o que está sendo carregado (pode apagar depois)
console.log('--- DEBUG ENV ---');
console.log('Bucket:', process.env.AWS_BUCKET_NAME);
console.log('Endpoint:', process.env.AWS_ENDPOINT);
console.log('Region:', process.env.AWS_REGION);
console.log('-----------------');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-south',
    // Se a variavel não carregar, use o fallback ou lance erro
    endpoint: process.env.AWS_ENDPOINT || 'https://s3.us-south.objectstorage.softlayer.net',
    forcePathStyle: true, // Obrigatório para IBM/MinIO
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

export const uploadPdfToS3 = async (fileName: string, pdfBuffer: Buffer) => {
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("ERRO: AWS_BUCKET_NAME não definido no .env");
    }

    const key = fileName;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'public-read'
    });

    try {
        await s3Client.send(command);

        // Monta a URL pública (ajuste conforme a configuração de acesso público do seu bucket)
        const endpointUrl = process.env.AWS_ENDPOINT || 'https://s3.us-south.objectstorage.softlayer.net';
        const url = `${endpointUrl}/${bucketName}/${key}`;

        return url;

    } catch (error) {
        console.error(`❌ Erro detalhado no upload do ${fileName}:`, error);
        throw error;
    }
};