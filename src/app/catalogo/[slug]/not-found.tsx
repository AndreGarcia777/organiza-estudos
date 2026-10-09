import Link from "next/link";

export default function MaterialNotFound() {
  return <section className="container inner-page">
    <p className="eyebrow">MATERIAL NÃO ENCONTRADO</p>
    <h1>Este exemplo não está no catálogo.</h1>
    <p className="lead">Confira o endereço ou explore os materiais demonstrativos disponíveis.</p>
    <Link className="button primary" href="/catalogo">Voltar ao catálogo</Link>
  </section>;
}
