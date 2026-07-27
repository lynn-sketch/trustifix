export function formatUGX(cents: number): string {
  const shillings = Math.round(cents / 100);
  return `UGX ${shillings.toLocaleString("en-UG")}`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
