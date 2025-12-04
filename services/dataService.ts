import { DataRow, ColumnStats, DatasetMeta, BinData } from '../types';
import { read, utils } from 'xlsx';

// Simple CSV Parser (Robust enough for standard CSVs)
export const parseCSV = (content: string): DataRow[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(','); 
    
    if (currentLine.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        const val = currentLine[index].trim().replace(/^"|"$/g, '');
        // Attempt to parse number
        const numVal = parseFloat(val);
        row[header] = isNaN(numVal) ? val : numVal;
      });
      data.push(row);
    }
  }
  return data;
};

export const parseExcel = (buffer: ArrayBuffer): DataRow[] => {
  const wb = read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  // sheet_to_json automatically handles number parsing and headers
  const jsonData = utils.sheet_to_json(ws) as any[];
  
  // Normalize generic objects to DataRow
  return jsonData.map(row => {
    const newRow: DataRow = {};
    Object.keys(row).forEach(key => {
      newRow[key] = row[key];
    });
    return newRow;
  });
};

export const processFileContent = (content: string | ArrayBuffer, fileName: string): DataRow[] => {
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  
  if (isExcel && content instanceof ArrayBuffer) {
    return parseExcel(content);
  } else if (typeof content === 'string') {
    return parseCSV(content);
  }
  return [];
};

export const analyzeDataset = (data: DataRow[], fileName: string): DatasetMeta => {
  const rowCount = data.length;
  if (rowCount === 0) {
    return { fileName, rowCount: 0, columns: [], stats: {} };
  }

  const columns = Object.keys(data[0]);
  const stats: Record<string, ColumnStats> = {};

  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const definedValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = definedValues.filter(v => typeof v === 'number') as number[];
    const isNumeric = numericValues.length > definedValues.length * 0.9; // Heuristic

    const uniqueSet = new Set(definedValues.map(v => String(v)));
    
    stats[col] = {
      name: col,
      type: isNumeric ? 'numeric' : 'categorical',
      missingCount: rowCount - definedValues.length,
      uniqueCount: uniqueSet.size,
      samples: values.slice(0, 5) as (string|number)[],
    };

    if (isNumeric && numericValues.length > 0) {
      stats[col].mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      stats[col].min = Math.min(...numericValues);
      stats[col].max = Math.max(...numericValues);
    }
  });

  return {
    fileName,
    rowCount,
    columns,
    stats,
  };
};

export const createHistogramData = (data: DataRow[], key: string, binsCount: number = 10): BinData[] => {
  const values = data.map(d => d[key]).filter(v => typeof v === 'number') as number[];
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (min === max) return [{ bin: String(min), count: values.length }];

  const step = (max - min) / binsCount;
  const bins: number[] = new Array(binsCount).fill(0);

  values.forEach(v => {
    const binIndex = Math.min(Math.floor((v - min) / step), binsCount - 1);
    bins[binIndex]++;
  });

  return bins.map((count, i) => ({
    bin: `${(min + i * step).toFixed(1)} - ${(min + (i + 1) * step).toFixed(1)}`,
    count,
  }));
};