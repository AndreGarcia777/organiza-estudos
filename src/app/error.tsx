"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="container inner-page"><p className="eyebrow">SERVIÇO INDISPONÍVEL</p><h1>Não foi possível carregar esta página.</h1><p className="lead">Tente novamente. Dados fictícios não serão usados como substitutos de informações reais.</p><div className="actions"><button className="button primary" onClick={retry}>Tentar novamente</button><Link className="button secondary" href="/">Voltar ao início</Link></div></section>;
}
