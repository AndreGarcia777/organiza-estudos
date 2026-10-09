-- Dados exclusivamente fictícios para a avaliação acadêmica.
-- Aplicação manual e idempotente após as migrações do projeto remoto.
-- Este arquivo não cria usuários, avaliações, depoimentos ou pagamentos.

do $evaluation$
begin

insert into public.topics (name)
values
  ('Fundamentos de IA'),
  ('Matemática'),
  ('Funções'),
  ('Programação'),
  ('Lógica de programação')
on conflict (name) do nothing;

insert into public.materials (
  slug,
  title,
  author,
  original_url,
  summary,
  coverage,
  limitations,
  prerequisites,
  level,
  format,
  language,
  access,
  duration,
  study_estimate,
  reviewed_at,
  curation,
  status
)
values
  (
    'avaliacao-fundamentos-ia',
    '[EXEMPLO FICTÍCIO] Fundamentos de inteligência artificial',
    'Equipe acadêmica fictícia',
    null,
    'Dado fictício para demonstrar a organização do catálogo durante a avaliação acadêmica.',
    'Conceitos introdutórios de inteligência artificial, aprendizado de máquina e limites de sistemas automatizados.',
    'Não representa um curso real e não cobre implementação ou treinamento de modelos.',
    'Nenhum conhecimento técnico prévio no cenário de avaliação.',
    'Iniciante',
    'Artigo',
    'Português',
    'Gratuito',
    null,
    '1 a 2 horas',
    date '2026-10-09',
    'Comentário fictício para demonstrar como a curadoria explicaria a finalidade e os limites do material.',
    'published'
  ),
  (
    'avaliacao-funcoes-graficos',
    '[EXEMPLO FICTÍCIO] Funções e gráficos: revisão guiada',
    'Equipe acadêmica fictícia',
    null,
    'Dado fictício de matemática preparado somente para a avaliação da aplicação.',
    'Domínio, imagem e leitura de gráficos de funções lineares e quadráticas, com exercícios comentados.',
    'Não representa um material real e não aborda cálculo, trigonometria ou demonstrações formais.',
    'Operações algébricas básicas e plano cartesiano.',
    'Iniciante',
    'Artigo',
    'Português',
    'Gratuito',
    null,
    '2 a 3 horas',
    date '2026-10-09',
    'Comentário fictício para demonstrar uma indicação de revisão antes de uma lista de exercícios.',
    'published'
  ),
  (
    'avaliacao-logica-programacao',
    '[EXEMPLO FICTÍCIO] Lógica de programação com exercícios',
    'Equipe acadêmica fictícia',
    null,
    'Dado fictício de programação preparado somente para a avaliação da aplicação.',
    'Variáveis, decisões, repetições e funções por meio de pequenos exercícios guiados.',
    'Não representa um curso real e não cobre orientação a objetos, desenvolvimento web ou estruturas avançadas.',
    'Nenhuma experiência prévia com programação no cenário de avaliação.',
    'Iniciante',
    'Curso',
    'Português',
    'Gratuito',
    '2 horas',
    '4 a 6 horas',
    date '2026-10-09',
    'Comentário fictício para demonstrar uma indicação voltada à prática gradual de lógica.',
    'published'
  )
on conflict (slug) do update set
  title = excluded.title,
  author = excluded.author,
  original_url = excluded.original_url,
  summary = excluded.summary,
  coverage = excluded.coverage,
  limitations = excluded.limitations,
  prerequisites = excluded.prerequisites,
  level = excluded.level,
  format = excluded.format,
  language = excluded.language,
  access = excluded.access,
  duration = excluded.duration,
  study_estimate = excluded.study_estimate,
  reviewed_at = excluded.reviewed_at,
  curation = excluded.curation,
  status = excluded.status;

delete from public.material_topics
where material_id in (
  select id
  from public.materials
  where slug in (
    'avaliacao-fundamentos-ia',
    'avaliacao-funcoes-graficos',
    'avaliacao-logica-programacao'
  )
);

with relations (slug, topic_name) as (
  values
    ('avaliacao-fundamentos-ia', 'Fundamentos de IA'),
    ('avaliacao-funcoes-graficos', 'Matemática'),
    ('avaliacao-funcoes-graficos', 'Funções'),
    ('avaliacao-logica-programacao', 'Programação'),
    ('avaliacao-logica-programacao', 'Lógica de programação')
)
insert into public.material_topics (material_id, topic_id)
select materials.id, topics.id
from relations
join public.materials on materials.slug = relations.slug
join public.topics on topics.name = relations.topic_name
on conflict (material_id, topic_id) do nothing;

update public.offer_settings
set
  offer_text = 'Seleção manual para avaliação acadêmica',
  delivery_text = 'Fluxo demonstrativo, sem cobrança ou envio automático de mensagens.',
  pilot_enabled = true,
  requests_enabled = true
where id = true;

end
$evaluation$;
