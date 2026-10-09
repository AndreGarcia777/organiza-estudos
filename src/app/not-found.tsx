import Link from "next/link";

export default function NotFound() {
  return <div className="container inner-page"><p className="eyebrow">PÁGINA NÃO ENCONTRADA</p><h1>Vamos encontrar outro caminho.</h1><p className="lead">Este endereço não existe ou foi alterado.</p><Link className="button primary" href="/">Voltar ao início</Link></div>;
}
