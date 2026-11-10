import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DialogoConfirmacao } from '../../../src/ui/DialogoConfirmacao.tsx';

function Cenario({ aoConfirmar, aoCancelar }: { aoConfirmar: () => void; aoCancelar: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>
        Excluir registro
      </button>
      <DialogoConfirmacao
        aberto={aberto}
        titulo="Confirmar exclusão"
        texto='Excluir time "Mobile"? Esta ação não pode ser desfeita.'
        aoConfirmar={() => {
          aoConfirmar();
          setAberto(false);
        }}
        aoCancelar={() => {
          aoCancelar();
          setAberto(false);
        }}
      />
    </>
  );
}

function montar() {
  const aoConfirmar = vi.fn();
  const aoCancelar = vi.fn();
  render(<Cenario aoConfirmar={aoConfirmar} aoCancelar={aoCancelar} />);
  return { aoConfirmar, aoCancelar };
}

async function abrir() {
  const origem = screen.getByRole('button', { name: 'Excluir registro' });
  await userEvent.click(origem);
  return origem;
}

describe('DialogoConfirmacao', () => {
  it('abre com showModal, rotulado pelo título, foco inicial em Cancelar', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    montar();
    await abrir();
    expect(showModal).toHaveBeenCalled();
    const dialogo = screen.getByRole('dialog', { name: 'Confirmar exclusão' });
    expect(dialogo.textContent).toContain(
      'Excluir time "Mobile"? Esta ação não pode ser desfeita.',
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    showModal.mockRestore();
  });

  it('Cancelar chama aoCancelar e devolve o foco à origem', async () => {
    const { aoConfirmar, aoCancelar } = montar();
    const origem = await abrir();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(aoCancelar).toHaveBeenCalledTimes(1);
    expect(aoConfirmar).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(origem);
  });

  it('Esc chama aoCancelar sem confirmar', async () => {
    const { aoConfirmar, aoCancelar } = montar();
    const origem = await abrir();
    await userEvent.keyboard('{Escape}');
    expect(aoCancelar).toHaveBeenCalledTimes(1);
    expect(aoConfirmar).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(origem);
  });

  it('Excluir chama aoConfirmar', async () => {
    const { aoConfirmar, aoCancelar } = montar();
    await abrir();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(aoConfirmar).toHaveBeenCalledTimes(1);
    expect(aoCancelar).not.toHaveBeenCalled();
  });
});
