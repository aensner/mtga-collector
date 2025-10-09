import React from 'react';
import type { CardData } from '../../types';
import { exportToCSV, exportToJSON, downloadFile } from '../../utils/csvParser';

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

  const handleCopyToClipboard = () => {
    const csv = exportToCSV(cards);
    navigator.clipboard.writeText(csv);
    alert('CSV data copied to clipboard!');
  };

  if (cards.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={handleExportCSV}
        className="button ok"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>

      <button
        onClick={handleExportJSON}
        className="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        Export JSON
      </button>

      <button
        onClick={handleCopyToClipboard}
        className="button ghost"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy to Clipboard
      </button>
    </div>
  );
};
