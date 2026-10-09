export const site = {
  name: "Guia de Estudos",
  description: "Encontre materiais de estudo que façam sentido para o que você precisa aprender.",
  previewNotice: "Modo demonstração · Materiais fictícios. Nenhum pedido real é enviado.",
  priceInCents: 1990,
  navigation: [
    { href: "/", label: "Início" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/solicitar", label: "Seleção personalizada" },
    { href: "/conta", label: "Minha conta" },
  ],
} as const;

export const selectionPrice = new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL",
}).format(site.priceInCents / 100);
