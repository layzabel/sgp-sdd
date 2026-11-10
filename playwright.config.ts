import { existsSync } from 'node:fs';
import { defineConfig, devices, type Project } from '@playwright/test';

const URL_BASE = 'http://localhost:4173';
const VIEWPORT = { width: 1280, height: 800 };

const CAMINHOS_EDGE = [
  String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
  String.raw`C:\Program Files\Microsoft\Edge\Application\msedge.exe`,
  '/opt/microsoft/msedge/msedge',
  '/usr/bin/microsoft-edge',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

const edgeInstalado = CAMINHOS_EDGE.some((caminho) => existsSync(caminho));

const projetos: Project[] = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: VIEWPORT } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: VIEWPORT } },
];

if (edgeInstalado) {
  projetos.push({
    name: 'msedge',
    use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: VIEWPORT },
  });
} else {
  console.warn(
    'Projeto msedge omitido: Microsoft Edge não encontrado. Justificativa: plan.md, Riscos — Chromium cobre o mesmo motor.',
  );
}

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // Concorrência limitada: com muitos navegadores abertos ao mesmo tempo, o Firefox do
  // Playwright deixa de enviar algumas requisições (o servidor nunca as recebe) e a tela fica
  // em "Carregando…". Com 4 processos a suíte é estável nos três navegadores.
  workers: 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  webServer: {
    command: 'node tests/e2e/servidor-estatico.ts',
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: URL_BASE,
    viewport: VIEWPORT,
    trace: 'retain-on-failure',
  },
  projects: projetos,
});
