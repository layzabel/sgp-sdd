import Link from 'next/link';
import { REGISTRO_NAO_ENCONTRADO } from '../domain/mensagens.ts';

/** Registro inexistente (endereço salvo ou registro excluído) com retorno à lista. */
export function NaoEncontrado({ lista, href }: { lista: string; href: string }) {
  return (
    <div>
      <p>{REGISTRO_NAO_ENCONTRADO}</p>
      <p>
        <Link href={href}>{`Voltar para ${lista}`}</Link>
      </p>
    </div>
  );
}
