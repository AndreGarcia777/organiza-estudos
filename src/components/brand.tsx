import Link from "next/link";
import { site } from "@/config/site";

export function Brand() {
  return <Link href="/" className="brand" aria-label={`${site.name} — início`}>
    <span className="brand-mark" aria-hidden="true">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2V4Z" /></svg>
    </span>
    {site.name}
  </Link>;
}
