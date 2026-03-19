export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return `${year}.${month}`;
}
