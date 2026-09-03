/**
 * Formata um valor em centavos como moeda brasileira (BRL).
 *
 * NOTA: `toLocaleString('pt-BR', ...)` depende do suporte a `Intl` do motor
 * JS. No Jest (Node com ICU completo) o resultado é correto e determinístico
 * (ex.: 4500 → "R$ 45", 123456 → "R$ 1.234,56"). O app real roda em Hermes —
 * desde a versão empacotada com RN 0.80 o Hermes inclui `Intl`/ICU
 * embutido, então o comportamento deve ser equivalente, mas isso não foi
 * verificado num emulador/dispositivo real neste task.
 */
export function formatBRL(cents: number): string {
  return 'R$ ' + (cents / 100).toLocaleString('pt-BR', {minimumFractionDigits: 0});
}
