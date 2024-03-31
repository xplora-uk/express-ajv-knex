export function filterColumnNames(columnNames: string[], exclude: string[] = []): string[] {
  if (exclude && exclude.length) {
    return columnNames.filter(s => !exclude.includes(s));
  }
  return columnNames;
}
