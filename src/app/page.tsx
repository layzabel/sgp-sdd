'use client';

import Link from 'next/link';
import { SECOES } from '../ui/MenuPrincipal.tsx';
import { Pagina } from '../ui/Pagina.tsx';

export default function Inicio() {
  return (
    <Pagina titulo="SGP — Início">
      <p>Escolha um cadastro para começar:</p>
      <ul>
        {SECOES.map((secao) => (
          <li key={secao.href}>
            <Link href={secao.href}>{secao.rotulo}</Link>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
