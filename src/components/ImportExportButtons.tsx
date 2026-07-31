import { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { toCsv, downloadCsv, parseCsv, csvRowsToObjects, readFileAsText } from '@/lib/csv';

export interface CsvColumn {
  /** Clé du champ dans l'objet JS (et libellé attendu en en-tête de colonne à l'import) */
  key: string;
  /** Libellé affiché en en-tête de colonne CSV */
  header: string;
}

interface ImportExportButtonsProps<T extends object> {
  /** Données actuellement affichées (filtrées) à exporter */
  data: T[];
  /** Colonnes exportées / attendues à l'import (le header doit correspondre entre export et import) */
  columns: CsvColumn[];
  /** Nom de fichier sans extension, ex: "produits" */
  filename: string;
  /**
   * Reçoit les lignes CSV importées sous forme d'objets { [header]: string brut }.
   * Doit convertir les types (nombres, booléens, tableaux) et écrire en base (upsert).
   * Doit lever une erreur (throw) en cas de ligne invalide pour que l'utilisateur soit averti.
   */
  onImportRows: (rows: Record<string, string>[]) => Promise<{ inserted: number; updated: number; errors: string[] }>;
}

/**
 * Barre de boutons "Exporter CSV" / "Importer CSV" à placer en haut de chaque page
 * de gestion (produits, clients, fournisseurs, dépenses...). Permet de préparer les
 * données en masse dans Excel/Google Sheets puis de les injecter d'un coup, au lieu
 * de saisir chaque fiche une par une dans l'interface.
 */
export function ImportExportButtons<T extends object>({
  data, columns, filename, onImportRows,
}: ImportExportButtonsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = () => {
    const csv = toCsv(data, columns);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`${filename}_${stamp}.csv`, csv);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const text = await readFileAsText(file);
      const rawRows = parseCsv(text);
      if (rawRows.length < 2) {
        setResult('Fichier vide ou sans données (uniquement l\'en-tête détecté).');
        return;
      }
      const headerToKey = Object.fromEntries(columns.map((c) => [c.header, c.header]));
      const objects = csvRowsToObjects(rawRows, headerToKey);
      const { inserted, updated, errors } = await onImportRows(objects);
      let msg = `Import terminé : ${inserted} créé(s), ${updated} mis à jour.`;
      if (errors.length > 0) msg += ` ${errors.length} ligne(s) en erreur : ${errors.slice(0, 3).join(' | ')}${errors.length > 3 ? '…' : ''}`;
      setResult(msg);
    } catch (err) {
      setResult('Erreur pendant l\'import : ' + (err instanceof Error ? err.message : 'inconnue'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        title="Exporter les lignes affichées en fichier CSV (Excel)"
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-pink-300 dark:hover:border-pink-700"
      >
        <Download className="w-4 h-4" /> Exporter
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        disabled={importing}
        title="Importer plusieurs lignes depuis un fichier CSV"
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-pink-300 dark:hover:border-pink-700 disabled:opacity-50"
      >
        {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Importer
      </button>
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      {result && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200">
          {result}
          <button onClick={() => setResult(null)} className="block mt-1 text-pink-500 font-medium">Fermer</button>
        </div>
      )}
    </div>
  );
}
