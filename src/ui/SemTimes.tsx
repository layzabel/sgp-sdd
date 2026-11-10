import Link from 'next/link';
import { semTimes } from '../domain/mensagens.ts';

/** Aviso exibido no lugar do formulário quando não há times (FR-015, FR-023). */
export function SemTimes({ cadastro }: { cadastro: 'desenvolvedores' | 'projetos' }) {
  return (
    <div>
      <p>{semTimes(cadastro)}</p>
      <p>
        <Link href="/times/novo/" className="botao-link">
          Cadastrar time
        </Link>
      </p>
    </div>
  );
}
