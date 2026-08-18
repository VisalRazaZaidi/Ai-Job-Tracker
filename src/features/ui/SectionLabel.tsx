// Compact editorial label (Geist Mono, uppercase, muted). The data voice used
// for section headings and metadata labels across the product.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="section-label">{children}</span>;
}
