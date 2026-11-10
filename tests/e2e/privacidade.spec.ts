import { expect, test } from '@playwright/test';
import { secao } from './apoio/dados.ts';

const ORIGEM = 'http://localhost:4173';

/**
 * Métodos permitidos: GET e HEAD, ambos sem corpo. O HEAD é emitido pelo próprio Next.js na
 * exportação estática para pré-carregar rotas (confere o HTML da página de destino na mesma
 * origem; node_modules/next/dist/client/components/segment-cache/cache.js) e não carrega dados
 * do SGP. Qualquer outra origem, outro método ou requisição com corpo reprova o teste.
 */
const METODOS_SEM_CORPO = new Set(['GET', 'HEAD']);

test('SC-004/FR-037: nenhuma requisição sai da aplicação nem envia dados', async ({ page }) => {
  const requisicoes: { metodo: string; url: string; corpo: string | null }[] = [];
  page.on('request', (r) =>
    requisicoes.push({ metodo: r.method(), url: r.url(), corpo: r.postData() }),
  );

  await page.goto('/times/novo/');
  await page.getByLabel(/^Nome/).fill('Plataforma');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Plataforma');
  await page.getByRole('link', { name: 'Editar' }).click();
  await page.getByLabel(/^Área de atuação/).fill('Web');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('status')).toContainText('Time atualizado com sucesso.');

  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: 'Projetos' })
    .click();
  await page.getByRole('link', { name: 'Novo projeto' }).first().click();
  await page.getByLabel(/^Nome/).fill('Portal');
  await page.getByLabel(/^Data de início/).fill('2026-03-10');
  await page.getByLabel(/^Situação/).selectOption({ label: 'Planejado' });
  await page.getByLabel(/^Time responsável/).selectOption({ label: 'Plataforma' });
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto: Portal');
  await secao(page, 'Relatórios')
    .getByLabel(/^Texto do relatório/)
    .fill('Andamento');
  await secao(page, 'Relatórios').getByRole('button', { name: 'Adicionar relatório' }).click();
  await secao(page, 'Marcos')
    .getByLabel(/^Descrição do marco/)
    .fill('Kickoff');
  await secao(page, 'Marcos').getByRole('button', { name: 'Adicionar marco' }).click();
  await secao(page, 'Cronograma')
    .getByLabel(/^Atividade/)
    .fill('Testes');
  await secao(page, 'Cronograma')
    .getByLabel(/^Data prevista/)
    .fill('2026-04-05');
  await secao(page, 'Cronograma').getByRole('button', { name: 'Adicionar item' }).click();
  await expect(secao(page, 'Cronograma').getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projetos');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projetos');

  expect(requisicoes.length).toBeGreaterThan(0);
  const indevidas = requisicoes.filter(
    (r) => new URL(r.url).origin !== ORIGEM || !METODOS_SEM_CORPO.has(r.metodo) || r.corpo !== null,
  );
  expect(
    indevidas,
    'Requisições para fora da aplicação, com corpo ou com método diferente de GET/HEAD',
  ).toEqual([]);
});
