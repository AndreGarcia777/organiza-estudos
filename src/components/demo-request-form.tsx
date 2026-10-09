"use client";

import { useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function DemoRequestForm() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  return (
    <section className="demo-form-section" aria-labelledby="experimente">
      <div className="section-heading"><div><p className="eyebrow">EXPERIMENTE COM UM CENÁRIO FICTÍCIO</p><h2 id="experimente">Como será informar sua necessidade</h2></div></div>
      <p className="demo-callout">Simulação local: use apenas as opções de exemplo. Não há envio, conta, cobrança ou armazenamento. Ao recarregar, a simulação é apagada. Não insira dados pessoais.</p>
      <form className="demo-form" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const hours = Number(data.get("hours"));
        if (!Number.isFinite(hours) || hours < 1 || hours > 100 || !Number.isInteger(hours)) {
          setError("Informe de 1 a 100 horas inteiras para o cenário de exemplo.");
          setResult(null);
          return;
        }
        setError("");
        setResult(`Cenário de exemplo: ${data.get("topic")}, para ${data.get("goal")}, com ${hours} horas disponíveis. Preferência: ${data.get("format")}; orçamento: ${data.get("budget")}.`);
        requestAnimationFrame(() => resultRef.current?.focus());
      }} onChange={() => { setResult(null); setError(""); }} onReset={() => { setResult(null); setError(""); }}>
        <fieldset disabled={!ready}>
          <legend>Necessidade de estudo fictícia</legend>
          <div className="form-grid">
            <label className="field"><span>Disciplina de exemplo</span><select name="subject" required defaultValue=""><option value="" disabled>Selecione</option><option>Introdução à inteligência artificial</option><option>Aprendizado de máquina</option><option>Matemática básica</option><option>Lógica de programação</option></select></label>
            <label className="field"><span>Tópico de exemplo</span><select name="topic" required defaultValue=""><option value="" disabled>Selecione</option><option>Fundamentos de IA</option><option>Redes neurais</option><option>Ética em IA</option><option>Funções</option><option>Lógica de programação</option></select></label>
            <label className="field"><span>Objetivo</span><select name="goal" required defaultValue=""><option value="" disabled>Selecione</option><option value="revisão para prova">Prova</option><option value="trabalho acadêmico">Trabalho</option><option value="compreensão do assunto">Compreensão do assunto</option><option value="outro objetivo de exemplo">Outro</option></select></label>
            <label className="field"><span>Nível de conhecimento</span><select name="level" required defaultValue=""><option value="" disabled>Selecione</option><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></label>
            <label className="field"><span>Pré-requisitos dominados</span><select name="prerequisites" defaultValue="Nenhum"><option>Nenhum</option><option>Álgebra básica</option><option>Python básico</option><option>Python e estatística</option></select></label>
            <label className="field"><span>Horas disponíveis para estudar</span><input name="hours" type="number" min="1" max="100" step="1" required aria-describedby="hours-help" /><small id="hours-help">Entre 1 e 100 horas, apenas para a simulação.</small></label>
            <label className="field"><span>Prazo de exemplo (opcional)</span><select name="deadline"><option>Sem prazo definido</option><option>Daqui a uma semana</option><option>Daqui a um mês</option></select></label>
            <label className="field"><span>Formato preferido</span><select name="format"><option>Sem preferência</option><option>Artigo</option><option>Vídeo</option><option>Curso</option><option>Livro</option></select></label>
            <label className="field"><span>Idioma preferido</span><select name="language"><option>Português</option><option>Inglês</option><option>Sem preferência</option></select></label>
            <label className="field"><span>Orçamento para materiais externos</span><select name="budget"><option>Somente gratuitos</option><option>Até R$ 50 (exemplo)</option><option>Até R$ 100 (exemplo)</option></select></label>
            <label className="field"><span>Experiência anterior (opcional)</span><select name="previous"><option>Nenhuma experiência informada</option><option>Exemplo: um vídeo avançado demais</option><option>Exemplo: um curso muito extenso</option></select></label>
            <label className="field"><span>Observação de exemplo (opcional)</span><select name="notes"><option>Sem observações</option><option>Exemplo: prefiro exercícios guiados</option><option>Exemplo: preciso revisar conceitos</option></select></label>
          </div>
          <p className="fine-print">No fluxo real, o e-mail virá da conta e o WhatsApp será opcional. Contatos e escolha de canal não são coletados nesta demonstração.</p>
          {error && <p role="alert" className="form-error">{error}</p>}
          <div className="actions"><button className="button primary" type="submit">Simular preenchimento</button><button className="button secondary" type="reset">Limpar simulação</button></div>
        </fieldset>
        <noscript><p>Ative o JavaScript para experimentar a simulação. O catálogo continua disponível.</p></noscript>
      </form>
      {result && <div className="simulation-result" ref={resultRef} tabIndex={-1} role="status"><h3>Simulação concluída — nenhum pedido foi enviado</h3><p>{result}</p><p>Este resumo permanece somente nesta página. A seleção manual e o acompanhamento de pedidos ainda não estão disponíveis.</p></div>}
    </section>
  );
}
