/**
 * Fixtures exclusivas da demonstração. Não importar como seed do piloto.
 * Nenhum título, autoria, tempo ou condição comercial representa uma oferta real.
 */
export type Material = {
  slug: string;
  title: string;
  author: string;
  topics: string[];
  level: string;
  format: string;
  language: string;
  access: "Gratuito" | "Pago" | "Parcialmente gratuito";
  summary: string;
  coverage: string;
  limitations: string;
  prerequisites: string;
  duration: string | null;
  studyEstimate: string | null;
  reviewedAt: string | null;
  curation: string;
  url: string | null;
};

export const demoMaterials: Material[] = [
  {
    slug: "primeiros-passos-em-ia",
    title: "Primeiros passos em inteligência artificial",
    author: "Equipe Horizonte (fictícia)",
    topics: ["Fundamentos de IA"],
    level: "Iniciante", format: "Artigo", language: "Português", access: "Gratuito",
    summary: "Um panorama dos conceitos que aparecem nas primeiras aulas de IA.",
    coverage: "Diferenças entre IA, aprendizado de máquina e aprendizado profundo, com exemplos conceituais.",
    limitations: "Não aborda programação, demonstrações matemáticas nem treinamento de modelos.",
    prerequisites: "Nenhum conhecimento técnico prévio no cenário demonstrativo.",
    duration: null, studyEstimate: "1 a 2 horas", reviewedAt: null,
    curation: "Neste exemplo, seria um ponto de partida para reconhecer o vocabulário da disciplina antes de avançar para exercícios.",
    url: "https://example.com/#primeiros-passos-em-ia",
  },
  {
    slug: "aprendizado-supervisionado",
    title: "Aprendizado supervisionado na prática",
    author: "Laboratório Aurora (fictício)",
    topics: ["Aprendizado de máquina"],
    level: "Intermediário", format: "Curso", language: "Português", access: "Parcialmente gratuito",
    summary: "Uma sequência de exemplos sobre classificação e avaliação de modelos.",
    coverage: "Separação de treino e teste, classificação, precisão, revocação e sobreajuste.",
    limitations: "No exemplo, apenas a introdução é gratuita. Não inclui implantação de modelos nem redes profundas.",
    prerequisites: "Python básico, tabelas de dados e noções de estatística.",
    duration: "4 horas", studyEstimate: "8 a 12 horas", reviewedAt: null,
    curation: "Exemplo de opção para quem já programa e precisa relacionar as métricas aos exercícios de uma disciplina.",
    url: "https://example.com/#aprendizado-supervisionado",
  },
  {
    slug: "redes-neurais-visuais",
    title: "Redes neurais: uma explicação visual",
    author: "Estúdio Vetor (fictício)",
    topics: ["Redes neurais", "Fundamentos de IA"],
    level: "Iniciante", format: "Vídeo", language: "Português", access: "Gratuito",
    summary: "Uma introdução visual a camadas, pesos e treinamento.",
    coverage: "Perceptrons, camadas e intuição sobre o ajuste de pesos.",
    limitations: "Sem derivação de retropropagação, exercícios ou implementação em código.",
    prerequisites: "Funções e operações algébricas básicas.",
    duration: "35 minutos", studyEstimate: null, reviewedAt: null,
    curation: "No cenário fictício, ajudaria na compreensão inicial, mas precisaria ser complementado por exercícios.",
    url: "https://example.com/#redes-neurais-visuais",
  },
  {
    slug: "matematica-do-aprendizado",
    title: "Matemática do aprendizado de máquina",
    author: "Editora Prisma (fictícia)",
    topics: ["Aprendizado de máquina", "Redes neurais"],
    level: "Avançado", format: "Livro", language: "Inglês", access: "Pago",
    summary: "Um exemplo de leitura aprofundada sobre os fundamentos matemáticos.",
    coverage: "Álgebra linear, gradientes e otimização aplicados ao aprendizado.",
    limitations: "Exige leitura matemática; não oferece um roteiro curto para iniciantes. Preço não informado.",
    prerequisites: "Cálculo diferencial, álgebra linear e probabilidade.",
    duration: null, studyEstimate: null, reviewedAt: null,
    curation: "Exemplo de material de consulta para aprofundamento. Não seria a primeira indicação para uma revisão rápida.",
    url: "https://example.com/#matematica-do-aprendizado",
  },
  {
    slug: "linguagem-e-modelos",
    title: "Do texto aos modelos de linguagem",
    author: "Oficina Contexto (fictícia)",
    topics: ["Processamento de linguagem natural", "IA generativa"],
    level: "Intermediário", format: "Curso", language: "Inglês", access: "Pago",
    summary: "Uma introdução técnica à representação de textos e aos modelos de linguagem.",
    coverage: "Tokenização, embeddings e visão geral do mecanismo de atenção.",
    limitations: "Não inclui treinamento de grandes modelos, infraestrutura ou técnicas avançadas de avaliação.",
    prerequisites: "Python, vetores e fundamentos de aprendizado de máquina.",
    duration: "3 horas", studyEstimate: "6 a 9 horas", reviewedAt: null,
    curation: "Neste exemplo, a seleção priorizaria as partes sobre representação de texto para um trabalho introdutório.",
    url: null,
  },
  {
    slug: "etica-e-vieses",
    title: "Ética e vieses em sistemas de IA",
    author: "Coletivo Perspectiva (fictício)",
    topics: ["Ética em IA", "Fundamentos de IA"],
    level: "Iniciante", format: "Artigo", language: "Português", access: "Gratuito",
    summary: "Questões para analisar os impactos de decisões automatizadas.",
    coverage: "Vieses de dados, limites de automação e discussão de responsabilidade.",
    limitations: "Não oferece aconselhamento jurídico nem técnicas de auditoria de modelos.",
    prerequisites: "Noções gerais sobre o que é um sistema de IA.",
    duration: null, studyEstimate: "1 hora", reviewedAt: null,
    curation: "Exemplo de leitura para apoiar uma discussão em sala; não substitui análise técnica ou outras perspectivas.",
    url: "https://example.com/#etica-e-vieses",
  },
  {
    slug: "funcoes-e-graficos",
    title: "Funções e gráficos: revisão guiada",
    author: "Caderno Vetor (fictício)",
    topics: ["Matemática", "Funções"],
    level: "Iniciante", format: "Artigo", language: "Português", access: "Gratuito",
    summary: "Uma revisão curta para relacionar expressões algébricas e seus gráficos.",
    coverage: "Domínio, imagem e leitura de gráficos de funções lineares e quadráticas, com exercícios comentados.",
    limitations: "Não aborda cálculo, trigonometria nem demonstrações formais.",
    prerequisites: "Operações algébricas básicas e plano cartesiano.",
    duration: null, studyEstimate: "2 a 3 horas", reviewedAt: null,
    curation: "Neste exemplo, ajudaria a revisar os conceitos antes de resolver uma lista de exercícios da disciplina.",
    url: "https://example.com/#funcoes-e-graficos",
  },
  {
    slug: "logica-de-programacao",
    title: "Lógica de programação com exercícios",
    author: "Oficina Código (fictícia)",
    topics: ["Programação", "Lógica de programação"],
    level: "Iniciante", format: "Curso", language: "Português", access: "Gratuito",
    summary: "Uma introdução prática à construção de algoritmos simples.",
    coverage: "Variáveis, decisões, repetições e funções por meio de pequenos exercícios guiados.",
    limitations: "Não cobre orientação a objetos, desenvolvimento web nem estruturas de dados avançadas.",
    prerequisites: "Nenhuma experiência prévia com programação no cenário demonstrativo.",
    duration: "2 horas", studyEstimate: "4 a 6 horas", reviewedAt: null,
    curation: "Exemplo de opção para começar pela lógica e praticar cada conceito antes de escolher uma linguagem específica.",
    url: "https://example.com/#logica-de-programacao",
  },
];

export const demoDisclaimer =
  "Demonstração com dados fictícios. Títulos, autores, cobertura, tempos e condições são exemplos, não recomendações reais. Os links disponíveis abrem um domínio de exemplo.";

export function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function uniqueValues(key: "topics" | "level" | "format" | "access") {
  return [...new Set(demoMaterials.flatMap((material) => material[key]))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}
