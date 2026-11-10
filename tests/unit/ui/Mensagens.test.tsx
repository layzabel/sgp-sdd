import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MensagensProvider, RegiaoMensagens, useMensagens } from '../../../src/ui/Mensagens.tsx';
import { definirRota } from './setup.ts';

function Publicador() {
  const mensagens = useMensagens();
  return (
    <>
      <button type="button" onClick={() => mensagens.sucesso('Time cadastrado com sucesso.')}>
        sucesso
      </button>
      <button
        type="button"
        onClick={() => mensagens.sucesso('Time excluído com sucesso.', { aposNavegacao: true })}
      >
        sucesso-navegando
      </button>
      <button type="button" onClick={() => mensagens.erro('Falhou.')}>
        erro
      </button>
      <button type="button" onClick={() => mensagens.limpar()}>
        limpar
      </button>
    </>
  );
}

function montar() {
  render(
    <MensagensProvider>
      <Publicador />
      <RegiaoMensagens />
    </MensagensProvider>,
  );
}

describe('Mensagens', () => {
  it('sucesso em role=status e erro em role=alert', async () => {
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'sucesso' }));
    expect(screen.getByRole('status').textContent).toContain('Time cadastrado com sucesso.');
    await userEvent.click(screen.getByRole('button', { name: 'erro' }));
    expect(screen.getByRole('alert').textContent).toContain('Falhou.');
    expect(screen.queryByText('Time cadastrado com sucesso.')).toBeNull();
  });

  it('"Fechar mensagem" remove a mensagem', async () => {
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'sucesso' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fechar mensagem' }));
    expect(screen.queryByText('Time cadastrado com sucesso.')).toBeNull();
  });

  it('limpar() remove a mensagem', async () => {
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'erro' }));
    await userEvent.click(screen.getByRole('button', { name: 'limpar' }));
    expect(screen.queryByText('Falhou.')).toBeNull();
  });

  it('mensagem publicada antes de navegar aparece no destino e some na navegação seguinte', async () => {
    definirRota('/times/detalhes', { id: '1' });
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'sucesso-navegando' }));
    act(() => definirRota('/times'));
    expect(screen.getByText('Time excluído com sucesso.')).toBeTruthy();
    act(() => definirRota('/times/novo'));
    expect(screen.queryByText('Time excluído com sucesso.')).toBeNull();
  });

  it('mensagem da própria tela some na primeira navegação', async () => {
    definirRota('/projetos/detalhes', { id: '1' });
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'sucesso' }));
    act(() => definirRota('/projetos'));
    expect(screen.queryByText('Time cadastrado com sucesso.')).toBeNull();
  });
});
