import { expect, test } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import {
  lerDocumento,
  secao,
  semearDocumento,
  umProjeto,
  umRelatorio,
  umTime,
} from './apoio/dados.ts';

const plataforma = umTime({ nome: 'Plataforma' });
const portal = umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id });

test.describe('US3 — Acompanhar o projeto', () => {
  test('cenários 1 e 2: relatório criado aparece com a data; ordem mais recente primeiro', async ({
    page,
  }) => {
    await semearDocumento(page, {
      times: [plataforma],
      projetos: [portal],
      relatorios: [
        umRelatorio({
          projetoId: portal.id,
          texto: 'Relatório 05/03',
          criadoEm: '2026-03-05T15:00:00.000Z',
        }),
        umRelatorio({
          projetoId: portal.id,
          texto: 'Relatório 12/03',
          criadoEm: '2026-03-12T15:00:00.000Z',
        }),
        umRelatorio({
          projetoId: portal.id,
          texto: 'Relatório 10/03',
          criadoEm: '2026-03-10T15:00:00.000Z',
        }),
      ],
    });
    await page.goto(`/projetos/detalhes/?id=${portal.id}`);
    const relatorios = secao(page, 'Relatórios');
    await expect(relatorios.getByRole('listitem')).toHaveCount(3);
    const textos = await relatorios.getByRole('listitem').allTextContents();
    expect(textos.map((t) => t.slice(0, 10))).toEqual(['12/03/2026', '10/03/2026', '05/03/2026']);
    await relatorios.getByLabel(/^Texto do relatório/).fill('Primeira linha\nSegunda linha');
    await relatorios.getByRole('button', { name: 'Adicionar relatório' }).click();
    await expect(page.getByRole('status')).toContainText('Relatório adicionado com sucesso.');
    await expect(relatorios.getByLabel(/^Texto do relatório/)).toHaveValue('');
    await expect(relatorios.getByRole('listitem')).toHaveCount(4);
    const primeiro = relatorios.getByRole('listitem').first();
    await expect(primeiro).toContainText('Primeira linha\nSegunda linha');
    await expect(primeiro).toContainText(/^\d{2}\/\d{2}\/\d{4}/);
  });

  test('cenário 3: campos vazios bloqueados nas três seções', async ({ page }) => {
    await semearDocumento(page, { times: [plataforma], projetos: [portal] });
    await page.goto(`/projetos/detalhes/?id=${portal.id}`);
    await secao(page, 'Relatórios').getByRole('button', { name: 'Adicionar relatório' }).click();
    await expect(
      secao(page, 'Relatórios').getByText('Informe o texto do relatório.'),
    ).toBeVisible();
    await secao(page, 'Marcos').getByRole('button', { name: 'Adicionar marco' }).click();
    await expect(secao(page, 'Marcos').getByText('Informe a descrição do marco.')).toBeVisible();
    const cronograma = secao(page, 'Cronograma');
    await cronograma.getByRole('button', { name: 'Adicionar item' }).click();
    await expect(cronograma.getByText('Informe a atividade.')).toBeVisible();
    await expect(cronograma.getByText('Informe a data prevista.')).toBeVisible();
    const salvo = await lerDocumento(page);
    expect(salvo?.relatorios).toEqual([]);
    expect(salvo?.marcos).toEqual([]);
    expect(salvo?.itensCronograma).toEqual([]);
  });

  test('cenários 4, 5 e 6: ordem dos marcos e do cronograma, sem editar/excluir', async ({
    page,
  }) => {
    await semearDocumento(page, { times: [plataforma], projetos: [portal] });
    await page.goto(`/projetos/detalhes/?id=${portal.id}`);
    const marcos = secao(page, 'Marcos');
    for (const descricao of ['Kickoff', 'Protótipo', 'Entrega']) {
      await marcos.getByLabel(/^Descrição do marco/).fill(descricao);
      await marcos.getByRole('button', { name: 'Adicionar marco' }).click();
      await expect(marcos.getByRole('listitem').last()).toHaveText(descricao);
    }
    await expect(marcos.locator('ol > li')).toHaveText(['Kickoff', 'Protótipo', 'Entrega']);
    const cronograma = secao(page, 'Cronograma');
    for (const [atividade, data] of [
      ['Implantação', '2026-04-20'],
      ['Testes', '2026-04-05'],
      ['Homologação', '2026-04-12'],
    ] as const) {
      await cronograma.getByLabel(/^Atividade/).fill(atividade);
      await cronograma.getByLabel(/^Data prevista/).fill(data);
      await cronograma.getByRole('button', { name: 'Adicionar item' }).click();
      await expect(page.getByRole('status')).toContainText(
        'Item de cronograma adicionado com sucesso.',
      );
      await expect(cronograma.getByLabel(/^Atividade/)).toHaveValue('');
    }
    await expect(cronograma.getByRole('listitem')).toHaveText([
      '05/04/2026 — Testes',
      '12/04/2026 — Homologação',
      '20/04/2026 — Implantação',
    ]);
    for (const nome of ['Relatórios', 'Marcos', 'Cronograma']) {
      await expect(secao(page, nome).getByRole('button', { name: /Editar|Excluir/ })).toHaveCount(
        0,
      );
      await expect(secao(page, nome).getByRole('link', { name: /Editar|Excluir/ })).toHaveCount(0);
    }
    await secao(page, 'Relatórios')
      .getByLabel(/^Texto do relatório/)
      .fill('Andamento ok');
    await secao(page, 'Relatórios').getByRole('button', { name: 'Adicionar relatório' }).click();
    await expect(secao(page, 'Relatórios').getByRole('listitem')).toHaveCount(1);
    await verificarAcessibilidade(page);
  });
});
