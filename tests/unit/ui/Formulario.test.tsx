import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CampoFormulario } from '../../../src/ui/Formulario.tsx';
import { Formulario } from '../../../src/ui/Formulario.tsx';

const CAMPOS: readonly CampoFormulario[] = [
  {
    campo: 'nome',
    rotulo: 'Nome',
    rotuloComArtigo: 'o nome',
    obrigatorio: true,
    max: 100,
    tipo: 'texto',
  },
  {
    campo: 'descricao',
    rotulo: 'Descrição',
    rotuloComArtigo: 'a descrição',
    obrigatorio: false,
    max: 1000,
    tipo: 'texto',
    controle: 'textarea',
  },
  {
    campo: 'nivel',
    rotulo: 'Nível',
    rotuloComArtigo: 'o nível',
    obrigatorio: true,
    tipo: 'enum',
    opcoes: [
      { valor: 'junior', rotulo: 'Júnior' },
      { valor: 'pleno', rotulo: 'Pleno' },
    ],
  },
  {
    campo: 'inicio',
    rotulo: 'Data de início',
    rotuloComArtigo: 'a data de início',
    obrigatorio: false,
    tipo: 'data',
  },
];

function montar(aoSalvar = vi.fn(), aoCancelar = vi.fn(), aoSucesso = vi.fn()) {
  const resultado = render(
    <Formulario
      campos={CAMPOS}
      valoresIniciais={{ nome: 'Inicial' }}
      aoSalvar={aoSalvar}
      aoSucesso={aoSucesso}
      aoCancelar={aoCancelar}
    />,
  );
  return { ...resultado, aoSalvar, aoCancelar, aoSucesso };
}

describe('Formulario', () => {
  it('rótulos, asterisco nos obrigatórios, legenda, noValidate e select em "Selecione…"', () => {
    const { container } = montar();
    expect(screen.getByLabelText(/^Nome/)).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText(/^Descrição/)).toBeInstanceOf(HTMLTextAreaElement);
    expect(screen.getByLabelText(/^Data de início/).getAttribute('type')).toBe('date');
    const nivel = screen.getByLabelText(/^Nível/) as HTMLSelectElement;
    expect(nivel.value).toBe('');
    expect(nivel.options[0]?.textContent).toBe('Selecione…');
    expect(container.querySelector('label[for="campo-nome"]')?.textContent).toContain(' *');
    expect(container.querySelector('label[for="campo-descricao"]')?.textContent).not.toContain('*');
    expect(screen.getByText('* campo obrigatório')).toBeTruthy();
    expect(container.querySelector('form')?.noValidate).toBe(true);
    expect(container.querySelector('[maxlength]')).toBeNull();
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe('Inicial');
  });

  it('erros de validação: mensagem sob o campo, aria, foco no primeiro inválido e resumo', async () => {
    const aoSalvar = vi.fn(() => ({
      ok: false as const,
      erro: {
        tipo: 'validacao' as const,
        campos: { nivel: 'Selecione o nível.', nome: 'Informe o nome.' },
      },
    }));
    const { aoSucesso } = montar(aoSalvar);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    const nome = screen.getByLabelText(/^Nome/);
    expect(nome.getAttribute('aria-invalid')).toBe('true');
    expect(nome.getAttribute('aria-describedby')).toBe('erro-nome');
    expect(document.getElementById('erro-nome')?.textContent).toBe('Informe o nome.');
    expect(screen.getByLabelText(/^Nível/).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText(/^Descrição/).getAttribute('aria-invalid')).toBeNull();
    expect(document.activeElement).toBe(nome);
    expect(screen.getByRole('alert').textContent).toContain('Corrija os campos destacados.');
    expect(aoSucesso).not.toHaveBeenCalled();
  });

  it('envia os valores digitados e chama aoSucesso', async () => {
    const aoSalvar = vi.fn(() => ({ ok: true as const, valor: { id: 'x' } }));
    const { aoSucesso } = montar(aoSalvar);
    await userEvent.clear(screen.getByLabelText(/^Nome/));
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Plataforma');
    await userEvent.selectOptions(screen.getByLabelText(/^Nível/), 'pleno');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(aoSalvar).toHaveBeenCalledWith({
      nome: 'Plataforma',
      descricao: '',
      nivel: 'pleno',
      inicio: '',
    });
    expect(aoSucesso).toHaveBeenCalledWith({ id: 'x' });
  });

  it('erro de gravação mantém os valores e anuncia a falha', async () => {
    const aoSalvar = vi.fn(() => ({ ok: false as const, erro: { tipo: 'gravacao' as const } }));
    montar(aoSalvar);
    await userEvent.type(screen.getByLabelText(/^Descrição/), 'texto digitado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível salvar os dados no navegador',
    );
    expect((screen.getByLabelText(/^Descrição/) as HTMLTextAreaElement).value).toBe(
      'texto digitado',
    );
  });

  it('registro não encontrado ao salvar', async () => {
    const aoSalvar = vi.fn(() => ({
      ok: false as const,
      erro: { tipo: 'nao_encontrado' as const },
    }));
    montar(aoSalvar);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('alert').textContent).toContain('Registro não encontrado.');
  });

  it('"Cancelar" chama a navegação de volta sem confirmação', async () => {
    const { aoCancelar, aoSalvar } = montar();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(aoCancelar).toHaveBeenCalledTimes(1);
    expect(aoSalvar).not.toHaveBeenCalled();
  });
});
