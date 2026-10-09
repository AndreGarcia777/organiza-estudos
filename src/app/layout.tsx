import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { Navigation } from "@/components/navigation";
import { site } from "@/config/site";
import "./globals.css";
import { appMode } from "@/lib/app-mode";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: `${site.name} | Um caminho para aprender`, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header"><div className="container header-inner"><Brand /><Navigation /></div></header>
    <div className="preview-notice"><div className="container">{appMode() === "demo" ? site.previewNotice : "Versão piloto · Atendimento manual. Solicitar não efetua cobrança."}</div></div>
    <main id="conteudo" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><div className="container footer-inner"><Brand /><p>Mais contexto para escolher. Mais clareza para estudar.</p><span>Projeto acadêmico · MVP em construção</span></div></footer>
  </body></html>;
}
