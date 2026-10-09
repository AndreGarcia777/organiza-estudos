"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="pt-BR"><body style={{ margin: 0, background: "#f8fafc", color: "#0f172a", fontFamily: "Arial, Helvetica, sans-serif" }}>
    <title>Serviço indisponível | Guia de Estudos</title>
    <main style={{ width: "min(680px, calc(100% - 40px))", margin: "12vh auto", lineHeight: 1.6 }}>
      <p style={{ color: "#0f766e", fontWeight: 700 }}>SERVIÇO INDISPONÍVEL</p>
      <h1>Não foi possível carregar a aplicação.</h1>
      <p role="alert">Tente novamente. Se o problema continuar, aguarde e retorne mais tarde.</p>
      <button onClick={retry} style={{ minHeight: 48, padding: "12px 18px", border: 0, borderRadius: 7, background: "#4338ca", color: "white", fontWeight: 700, cursor: "pointer" }}>Tentar novamente</button>
    </main>
  </body></html>;
}
