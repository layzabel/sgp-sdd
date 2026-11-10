import { expect, test, type Page } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import {
  lerDocumento,
  secao,
  semearDocumento,
  umItem,
  umMarco,
  umProjeto,
  umRelatorio,
  umTime,
} from './apoio/dados.ts';

async function preencherProjeto(
  page: Page,
  dados: { nome?: string; inicio?: string; termino?: string; situacao?: string; time?: string },
) {
  if (dados.nome !== undefined) await page.getByLabel(/^Nome/).fill(dados.nome);
  if (dados.inicio !== undefined) await page.getByLabel(/^Data de início/).fill(dados.inicio);
  if (dados.termino !== undefined) {
    await page.getByLabel(/^Data de término prevista/).fill(dados.termino);
  }
  if (dados.situacao !== undefined) {
    await page.getByLabel(/^Situação/).selectOption({ label: dados.situacao });
  }
  if (dados.time !== undefined) {
    await page.getByLabel(/^Time responsável/).selectOption({ label: dados.time });
  }
}

test.describe('US2 — Gerenciar projetos', () => {
  test('cenário 1: cadastro com sucesso e projeto na lista', async ({ page }) => {
    await semearDocumento(page, { times: [umTime({ nome: 'Plataforma' })] });
    await page.goto('/projetos/novo/');
    await verificarAcessibilidade(page);
    await preencherProjeto(page, {
      nome: 'Portal do Cliente',
      inicio: '2026-03-01',
      situacao: 'Planejado',
      time: 'Plataforma',
    });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto: Portal do Cliente');
    await expect(page.getByRole('status')).toContainText('Projeto cadastrado com sucesso.');
    await expect(page.getByText('01/03/2026')).toBeVisible();
    await verificarAcessibilidade(page);
    await page.goto('/projetos/');
    await expect(page.getByRole('link', { name: 'Portal do Cliente' })).toBeVisible();
    await verificarAcessibilidade(page);
  });

  test('cenário 2: todos os obrigatórios indicados', async ({ page }) => {
    await semearDocumento(page, { times: [umTime({ nome: 'Plataforma' })] });
    await page.goto('/projetos/novo/');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-nome')).toHaveText('Informe o nome.');
    await expect(page.locator('#erro-inicio')).toHaveText('Informe a data de início.');
    await expect(page.locator('#erro-situacao')).toHaveText('Selecione a situação.');
    await expect(page.locator('#erro-timeId')).toHaveText('Selecione o time responsável.');
    await verificarAcessibilidade(page);
  });

  test('cenários 3 e 4: término antes do início bloqueado; igual aceito', async ({ page }) => {
    await semearDocumento(page, { times: [umTime({ nome: 'Plataforma' })] });
    await page.goto('/projetos/novo/');
    await preencherProjeto(page, {
      nome: 'Portal',
      inicio: '2026-03-10',
      termino: '2026-03-09',
      situacao: 'Planejado',
      time: 'Plataforma',
    });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-terminoPrevisto')).toHaveText(
      'A data de término prevista não pode ser anterior à data de início.',
    );
    expect((await lerDocumento(page))?.projetos).toHaveLength(0);
    await page.getByLabel(/^Data de término prevista/).fill('2026-03-10');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto: Portal');
    await expect(page.getByText('10/03/2026')).toHaveCount(2);
  });

  test('cenário 5: sem times, aviso com acesso ao cadastro de times', async ({ page }) => {
    await page.goto('/projetos/novo/');
    await expect(
      page.getByText('É preciso cadastrar um time antes de cadastrar projetos.'),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Cadastrar time' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Novo time');
  });

  test('cenário 6: busca, situação e time combinados', async ({ page }) => {
    const plataforma = umTime({ nome: 'Plataforma' });
    const mobile = umTime({ nome: 'Mobile' });
    await semearDocumento(page, {
      times: [plataforma, mobile],
      projetos: [
        umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id, situacao: 'em_andamento' }),
        umProjeto({ nome: 'Portal Interno', timeId: mobile.id, situacao: 'em_andamento' }),
        umProjeto({ nome: 'Portal Antigo', timeId: plataforma.id, situacao: 'cancelado' }),
        umProjeto({ nome: 'App', timeId: plataforma.id, situacao: 'em_andamento' }),
      ],
    });
    await page.goto('/projetos/');
    await expect(page.getByRole('status')).toHaveText('4 registro(s) encontrado(s)');
    await page.getByLabel('Buscar por nome').fill('portal');
    await page.getByLabel('Situação').selectOption({ label: 'Em andamento' });
    await page.getByLabel('Time').selectOption({ label: 'Plataforma' });
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
    await expect(page.getByRole('link', { name: 'Portal do Cliente' })).toBeVisible();
    await page.getByLabel('Time').selectOption({ label: 'Mobile' });
    await expect(page.getByRole('link', { name: 'Portal Interno' })).toBeVisible();
    await page.getByLabel('Buscar por nome').fill('zzz');
    await page.getByRole('button', { name: 'Limpar busca e filtros' }).click();
    await expect(page.getByRole('status')).toHaveText('4 registro(s) encontrado(s)');
  });

  test('cenário 7: troca de situação e de time refletida nos dois times', async ({ page }) => {
    const plataforma = umTime({ nome: 'Plataforma' });
    const mobile = umTime({ nome: 'Mobile' });
    const portal = umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id });
    await semearDocumento(page, { times: [plataforma, mobile], projetos: [portal] });
    await page.goto(`/projetos/editar/?id=${portal.id}`);
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Situação/).selectOption({ label: 'Em andamento' });
    await page.getByLabel(/^Time responsável/).selectOption({ label: 'Mobile' });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status')).toContainText('Projeto atualizado com sucesso.');
    await expect(page.getByText('Em andamento')).toBeVisible();
    await page.getByRole('link', { name: 'Mobile' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Mobile');
    await expect(secao(page, 'Projetos do time').getByRole('link')).toHaveText([
      'Portal do Cliente',
    ]);
    await page.goto(`/times/detalhes/?id=${plataforma.id}`);
    await expect(secao(page, 'Projetos do time').getByRole('link')).toHaveCount(0);
    await page.goto('/projetos/');
    await expect(page.getByRole('row', { name: /Portal do Cliente/ })).toContainText('Mobile');
  });

  test('cenário 8: exclusão com acompanhamento avisa as quantidades e remove tudo', async ({
    page,
  }) => {
    const plataforma = umTime({ nome: 'Plataforma' });
    const portal = umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id });
    await semearDocumento(page, {
      times: [plataforma],
      projetos: [portal],
      relatorios: [umRelatorio({ projetoId: portal.id }), umRelatorio({ projetoId: portal.id })],
      marcos: [umMarco({ projetoId: portal.id })],
      itensCronograma: [umItem({ projetoId: portal.id })],
    });
    await page.goto(`/projetos/detalhes/?id=${portal.id}`);
    await page.getByRole('button', { name: 'Excluir' }).first().click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toContainText(
      'Também serão excluídos 2 relatório(s), 1 marco(s) e 1 item(ns) de cronograma.',
    );
    await verificarAcessibilidade(page);
    await dialogo.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projetos');
    await expect(page.getByRole('status').first()).toContainText(
      'Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma.',
    );
    const salvo = await lerDocumento(page);
    expect(salvo?.projetos).toEqual([]);
    expect(salvo?.relatorios).toEqual([]);
    expect(salvo?.marcos).toEqual([]);
    expect(salvo?.itensCronograma).toEqual([]);
  });
});
