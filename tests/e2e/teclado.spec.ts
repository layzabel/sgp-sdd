import { expect, test, type Locator, type Page } from '@playwright/test';

// Todo o fluxo usa só o teclado: Tab/Shift+Tab para mover o foco, Enter/Espaço para acionar,
// Esc para cancelar e digitação de texto. A navegação começa sempre pelo menu principal.
// As datas têm dia igual ao mês (03/03, 04/04): a ordem dos segmentos do <input type="date">
// segue a localidade do sistema no Edge, e assim o valor digitado é o mesmo em qualquer ordem.

const MAX_TABS = 120;

/** Pressiona Tab (ou Shift+Tab) até o alvo receber o foco; verifica o foco visível. */
async function focar(page: Page, alvo: Locator, tecla: 'Tab' | 'Shift+Tab' = 'Tab') {
  for (let i = 0; i < MAX_TABS; i += 1) {
    if (await alvo.evaluate((el) => el === document.activeElement)) {
      const contorno = await alvo.evaluate((el) => {
        const estilo = getComputedStyle(el);
        return { estilo: estilo.outlineStyle, largura: estilo.outlineWidth };
      });
      expect(contorno.estilo, 'foco visível').not.toBe('none');
      expect(contorno.largura).toBe('3px');
      return;
    }
    await page.keyboard.press(tecla);
  }
  throw new Error(`Não foi possível focar ${alvo.toString()} com ${tecla}`);
}

async function digitar(page: Page, campo: Locator, texto: string) {
  await focar(page, campo);
  await page.keyboard.type(texto);
}

async function acionar(page: Page, alvo: Locator, tecla: 'Enter' | ' ' = 'Enter') {
  await focar(page, alvo);
  await page.keyboard.press(tecla === ' ' ? 'Space' : tecla);
}

/** Escolhe a opção do `<select>` digitando o começo do rótulo (seleção por digitação). */
async function escolher(page: Page, select: Locator, rotulo: string) {
  await focar(page, select);
  await page.keyboard.type(rotulo.slice(0, 3));
  await expect(select.locator('option:checked')).toHaveText(rotulo);
}

async function irPeloMenu(page: Page, secao: string) {
  const link = page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: secao });
  // O menu fica antes do conteúdo: Shift+Tab a partir da posição atual chega a ele.
  await focar(page, link, 'Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(secao);
}

async function novo(page: Page, secao: string, rotuloNovo: string) {
  await irPeloMenu(page, secao);
  await acionar(page, page.getByRole('link', { name: rotuloNovo }).first());
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(rotuloNovo);
}

async function salvar(page: Page, titulo: string) {
  await acionar(page, page.getByRole('button', { name: 'Salvar' }));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
}

test('SC-007/FR-035: fluxo completo só com o teclado', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');

  await novo(page, 'Times', 'Novo time');
  await digitar(page, page.getByLabel(/^Nome/), 'Plataforma');
  await salvar(page, 'Time: Plataforma');

  await novo(page, 'Projetos', 'Novo projeto');
  await digitar(page, page.getByLabel(/^Nome/), 'Portal');
  await digitar(page, page.getByLabel(/^Data de início/), '03032026');
  await expect(page.getByLabel(/^Data de início/)).toHaveValue('2026-03-03');
  await escolher(page, page.getByLabel(/^Situação/), 'Planejado');
  await escolher(page, page.getByLabel(/^Time responsável/), 'Plataforma');
  await salvar(page, 'Projeto: Portal');

  await digitar(page, page.getByLabel(/^Texto do relatório/), 'Relatório pelo teclado');
  await acionar(page, page.getByRole('button', { name: 'Adicionar relatório' }), ' ');
  await expect(page.getByRole('status')).toContainText('Relatório adicionado com sucesso.');
  await digitar(page, page.getByLabel(/^Descrição do marco/), 'Kickoff');
  await acionar(page, page.getByRole('button', { name: 'Adicionar marco' }));
  await expect(page.getByRole('status')).toContainText('Marco adicionado com sucesso.');
  await digitar(page, page.getByLabel(/^Atividade/), 'Testes');
  await digitar(page, page.getByLabel(/^Data prevista/), '04042026');
  await expect(page.getByLabel(/^Data prevista/)).toHaveValue('2026-04-04');
  await acionar(page, page.getByRole('button', { name: 'Adicionar item' }));
  await expect(page.getByRole('status')).toContainText(
    'Item de cronograma adicionado com sucesso.',
  );

  await novo(page, 'Desenvolvedores', 'Novo desenvolvedor');
  await digitar(page, page.getByLabel(/^Nome/), 'Ana');
  await digitar(page, page.getByLabel(/^E-mail/), 'ana@empresa.com');
  await escolher(page, page.getByLabel(/^Nível/), 'Sênior');
  await escolher(page, page.getByLabel(/^Time/), 'Plataforma');
  await salvar(page, 'Desenvolvedor: Ana');

  await novo(page, 'Administradores', 'Novo administrador');
  await digitar(page, page.getByLabel(/^Nome/), 'João');
  await digitar(page, page.getByLabel(/^E-mail/), 'joao@empresa.com');
  await digitar(page, page.getByLabel(/^Telefone/), '11 9999-0000');
  await digitar(page, page.getByLabel(/^Cargo/), 'Gerente');
  await digitar(page, page.getByLabel(/^Setor/), 'TI');
  await salvar(page, 'Administrador: João');

  await novo(page, 'Usuários', 'Novo usuário');
  await digitar(page, page.getByLabel(/^Nome/), 'Maria');
  await digitar(page, page.getByLabel(/^E-mail/), 'maria@cliente.com');
  await salvar(page, 'Usuário: Maria');

  // Exclusão com o diálogo: Esc cancela e devolve o foco ao botão "Excluir"; depois confirma.
  const excluir = page.getByRole('main').getByRole('button', { name: 'Excluir' }).first();
  await acionar(page, excluir);
  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(excluir).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialogo).toBeVisible();
  await focar(page, dialogo.getByRole('button', { name: 'Excluir' }), 'Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usuários');
  await expect(page.getByRole('status').first()).toContainText('Usuário excluído com sucesso.');
});
