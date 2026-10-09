import Link from "next/link";
import { appMode } from "@/lib/app-mode";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const demo = appMode() === "demo";
  return <section className="container inner-page auth-page">
    <p className="eyebrow">SUA CONTA</p><h1>{title}</h1><p className="lead">{description}</p>
    {demo ? <div className="empty-state"><h2>Contas indisponíveis na demonstração</h2><p>O ambiente de autenticação ainda não está habilitado. Nenhum e-mail ou senha é coletado nesta página.</p><Link className="button secondary" href="/catalogo">Explorar demonstração</Link></div> : children}
  </section>;
}
