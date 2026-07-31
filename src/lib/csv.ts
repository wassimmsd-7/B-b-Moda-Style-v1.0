// Utilitaires CSV génériques pour l'export/import de données dans l'admin.
// Format standard RFC4180 (compatible Excel/LibreOffice/Google Sheets).

/** Transforme une valeur en cellule CSV sûre (échappe guillemets, virgules, retours ligne). */
function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('|') : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Génère un texte CSV à partir de lignes d'objets et d'une liste de colonnes { key, header }. */
export function toCsv<T extends object>(
  rows: T[],
  columns: { key: string; header: string }[],
): string {
  const headerLine = columns.map((c) => toCsvCell(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => toCsvCell((row as Record<string, unknown>)[c.key])).join(','));
  return [headerLine, ...lines].join('\r\n');
}

/** Déclenche le téléchargement d'un fichier CSV dans le navigateur. */
export function downloadCsv(filename: string, csvText: string) {
  // \uFEFF = BOM pour qu'Excel ouvre correctement les caractères arabes/accentués
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Parse un texte CSV (RFC4180 : gère guillemets, virgules et retours ligne dans les champs). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  // Normalise les fins de ligne et retire un BOM éventuel
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',' || char === ';') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** Convertit les lignes CSV brutes (avec en-tête) en objets, en s'appuyant sur le mapping header -> key fourni. */
export function csvRowsToObjects(
  csvRows: string[][],
  headerToKey: Record<string, string>,
): Record<string, string>[] {
  if (csvRows.length === 0) return [];
  const [headerRow, ...dataRows] = csvRows;
  const keys = headerRow.map((h) => headerToKey[h.trim()] ?? null);
  return dataRows.map((r) => {
    const obj: Record<string, string> = {};
    keys.forEach((key, i) => {
      if (key) obj[key] = (r[i] ?? '').trim();
    });
    return obj;
  });
}

/** Lit un fichier <input type="file"> comme texte (Promise). */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

// Helpers de conversion de types pour l'import
export const csvToNumber = (v: string, fallback = 0): number => {
  const n = Number(String(v).replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
};
export const csvToBool = (v: string, fallback = false): boolean => {
  const s = v.trim().toLowerCase();
  if (['true', '1', 'oui', 'yes', 'vrai'].includes(s)) return true;
  if (['false', '0', 'non', 'no', 'faux'].includes(s)) return false;
  return fallback;
};
export const csvToArray = (v: string): string[] =>
  v ? v.split('|').map((s) => s.trim()).filter(Boolean) : [];
