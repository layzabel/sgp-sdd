import { createReadStream, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';

// Servidor mínimo que serve somente os arquivos de out/ (research R13). Sem dependências.

const RAIZ = path.resolve('out');
const PORTA = 4173;
const HOST = 'localhost';

const TIPOS: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function responder(res: ServerResponse, status: number, texto: string): void {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(texto);
}

/** Converte o caminho da URL num arquivo dentro de out/, ou null se inválido/inexistente. */
function resolverArquivo(caminhoUrl: string): string | null {
  let decodificado: string;
  try {
    decodificado = decodeURIComponent(caminhoUrl);
  } catch {
    return null;
  }
  if (decodificado.includes('..') || decodificado.includes('\0')) return null;
  const relativo = decodificado.endsWith('/') ? `${decodificado}index.html` : decodificado;
  const absoluto = path.join(RAIZ, relativo);
  if (!absoluto.startsWith(RAIZ)) return null;
  try {
    return statSync(absoluto).isFile() ? absoluto : null;
  } catch {
    return null;
  }
}

function tratar(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    responder(res, 405, 'Método não permitido');
    return;
  }
  const url = new URL(req.url ?? '/', `http://${HOST}:${PORTA}`);
  const arquivo = resolverArquivo(url.pathname);
  const tipo = arquivo === null ? undefined : TIPOS[path.extname(arquivo)];
  if (arquivo === null || tipo === undefined) {
    responder(res, 404, 'Não encontrado');
    return;
  }
  // Tamanho explícito (também no HEAD): sem ele a resposta vai em blocos e o Firefox às vezes
  // deixa a conexão reaproveitada pendurada, travando o carregamento de scripts.
  res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': statSync(arquivo).size });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(arquivo)
    .on('error', () => res.destroy())
    .pipe(res);
}

// "localhost" pode resolver para IPv4 ou IPv6 conforme o navegador; escuta nos dois endereços de
// loopback (nunca em interfaces de rede). Sem IPv6 disponível, segue só com IPv4.
createServer(tratar).listen(PORTA, '127.0.0.1', () => {
  console.log(`Servindo ${RAIZ} em http://${HOST}:${PORTA}`);
});
createServer(tratar)
  .on('error', () => undefined)
  .listen(PORTA, '::1');
