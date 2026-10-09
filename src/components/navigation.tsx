"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";

export function Navigation() {
  const pathname = usePathname();
  return <nav aria-label="Navegação principal" className="navigation">
    {site.navigation.map(({ href, label }) => (
      <Link key={href} href={href} aria-current={(pathname === href || (href !== "/" && pathname.startsWith(href + "/"))) ? "page" : undefined}>{label}</Link>
    ))}
  </nav>;
}
