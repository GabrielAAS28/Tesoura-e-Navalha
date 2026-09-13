// Extraído de 8 cópias idênticas espalhadas por Badge, ServiceCard, Servicos,
// Checkout, BarbeiroAgenda, BarbeiroCadastro, BarbeiroCadastroEtapa2 e
// BarbeiroServicos (todas em seus respectivos styles.ts) — ver "FINAL
// WHOLE-BRANCH REVIEW" (Minor fold-in). Comportamento idêntico ao das 8
// cópias originais, verificado byte-a-byte antes da extração.
export function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
