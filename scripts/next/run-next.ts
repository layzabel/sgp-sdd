import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

// Lançador multiplataforma do Next.js com a telemetria desativada (FR-037, research R11).
process.env.NEXT_TELEMETRY_DISABLED = '1';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error: Error) => {
  console.error(`Falha ao iniciar o Next.js: ${error.message}`);
  process.exit(127);
});

child.on('close', (code: number | null) => {
  process.exit(code ?? 1);
});
