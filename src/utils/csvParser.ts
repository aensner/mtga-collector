import Papa from 'papaparse';
import { CardData } from '../types';

export const parseCSV = (csvText: string): CardData[] => {
  const result = Papa.parse<any>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data.map((row) => ({
    nummer: parseInt(row.Nummer || row.nummer || '0'),
    positionX: parseInt(row['Position X'] || row.positionX || '0'),
    positionY: parseInt(row['Position Y'] || row.positionY || '0'),
    kartenname: (row.Kartenname || row.kartenname || '').trim(),
    anzahl: parseInt(row.Anzahl || row.anzahl || '0'),
  }));
};

export const exportToCSV = (cards: CardData[]): string => {
  const csvData = cards.map((card) => ({
    Nummer: card.nummer,
    'Position X': card.positionX,
    'Position Y': card.positionY,
    Kartenname: card.correctedName || card.kartenname,
    Anzahl: card.anzahl,
  }));

  return Papa.unparse(csvData, {
    header: true,
  });
};

export const exportToJSON = (cards: CardData[]): string => {
  return JSON.stringify(cards, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
