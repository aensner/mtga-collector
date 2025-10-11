import React from 'react';
import type { CardData } from '../../types';
import { exportToCSV, exportToJSON, downloadFile } from '../../utils/csvParser';
import { downloadArenaDeck, getArenaExportStats } from '../../utils/arenaExport';

interface ExportButtonsProps {
  cards: CardData[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ cards }) => {
  const handleExportCSV = () => {
    const csv = exportToCSV(cards);
    downloadFile(csv, `mtga-collection-${Date.now()}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(cards);
    downloadFile(json, `mtga-collection-${Date.now()}.json`, 'application/json');
  };

  const handleExportArena = () => {
    try {
      const stats = getArenaExportStats(cards);

      if (stats.invalidCards > 0) {
        const message = `${stats.validCards} cards can be exported.\n\n` +
          `${stats.invalidCards} cards are missing Scryfall data:\n` +
          stats.missingData.slice(0, 5).join('\n') +
          (stats.missingData.length > 5 ? `\n... and ${stats.missingData.length - 5} more` : '');

        const confirm = window.confirm(
          `${message}\n\nContinue with export of ${stats.validCards} valid cards?`
        );

        if (!confirm) return;
      }

      downloadArenaDeck(cards);
      alert(`✅ Exported ${stats.validCards} cards to MTG Arena format!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export: ' + (error as Error).message);
    }
  };

  const handleCopyToClipboard = () => {
    const csv = exportToCSV(cards);
    navigator.clipboard.writeText(csv);
    alert('CSV data copied to clipboard!');
  };

  if (cards.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {/* MTG Arena Export - Primary action */}
      <button
        onClick={handleExportArena}
        className="button ok flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export to Arena
      </button>

      <button
        onClick={handleExportCSV}
        className="button flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>

      <button
        onClick={handleExportJSON}
        className="button flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        Export JSON
      </button>

      <button
        onClick={handleCopyToClipboard}
        className="button ghost flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy to Clipboard
      </button>
    </div>
  );
};
