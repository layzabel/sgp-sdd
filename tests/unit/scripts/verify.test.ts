import { describe, expect, it, vi } from 'vitest';
import type { Exec } from '../../../scripts/lib/exec.ts';
import { STAGES, runStages } from '../../../scripts/verify/stages.ts';

function setup(failAt?: { cmd: string; args: string[] }) {
  const calls: string[] = [];
  const exec: Exec = vi.fn(async (cmd: string, args: string[]) => {
    const line = [cmd, ...args].join(' ');
    calls.push(line);
    const fails = failAt !== undefined && line === [failAt.cmd, ...failAt.args].join(' ');
    return { code: fails ? 7 : 0, stdout: '', stderr: '' };
  });
  const out: string[] = [];
  const err: string[] = [];
  const log = { log: (m: string) => out.push(m), error: (m: string) => err.push(m) };
  return { calls, exec, out, err, log };
}

describe('runStages', () => {
  it('executa as 5 etapas na ordem e retorna 0', async () => {
    const { calls, exec, out, log } = setup();
    await expect(runStages(STAGES, exec, log)).resolves.toBe(0);
    expect(STAGES.map((s) => s.name)).toEqual(['tipos', 'padroes', 'testes', 'build', 'e2e']);
    expect(calls).toEqual(
      STAGES.flatMap((s) => s.commands.map((c) => [c.cmd, ...c.args].join(' '))),
    );
    expect(out.filter((m) => m.startsWith('VERIFY ▶'))).toEqual([
      'VERIFY ▶ etapa=tipos',
      'VERIFY ▶ etapa=padroes',
      'VERIFY ▶ etapa=testes',
      'VERIFY ▶ etapa=build',
      'VERIFY ▶ etapa=e2e',
    ]);
    expect(out.at(-1)).toBe('VERIFY OK: 5/5 etapas');
  });

  it.each(STAGES.map((stage, index) => [stage.name, index] as const))(
    'falha na etapa %s → código próprio e etapas seguintes não executam',
    async (name, index) => {
      const stage = STAGES[index]!;
      const { calls, exec, err, out, log } = setup(stage.commands[0]);
      await expect(runStages(STAGES, exec, log)).resolves.toBe(index + 1);
      expect(err).toContain(`VERIFY FALHOU: etapa=${name} (código ${index + 1})`);
      const later = STAGES.slice(index + 1).flatMap((s) => s.commands);
      for (const command of later) {
        expect(calls).not.toContain([command.cmd, ...command.args].join(' '));
      }
      expect(out).not.toContain('VERIFY OK: 5/5 etapas');
    },
  );

  it('falha no segundo comando da etapa padroes também falha a etapa', async () => {
    const padroes = STAGES.find((s) => s.name === 'padroes')!;
    const second = padroes.commands[1]!;
    expect(second.args.join(' ')).toContain('prettier');
    const { err, log, exec } = setup(second);
    await expect(runStages(STAGES, exec, log)).resolves.toBe(2);
    expect(err).toContain('VERIFY FALHOU: etapa=padroes (código 2)');
  });
});
