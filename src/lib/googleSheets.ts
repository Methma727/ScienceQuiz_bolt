const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

export type ParsedQuestion = {
  question_text: string;
  options: string[];
  correct_answer: string;
};

export async function fetchQuestionsFromSheet(
  range: string = 'Sheet1!A:F',
  spreadsheetId?: string,
): Promise<ParsedQuestion[]> {
  const sheetId = spreadsheetId || import.meta.env.VITE_GOOGLE_SHEETS_ID;

  if (!API_KEY || !sheetId) {
    throw new Error(
      'Google Sheets is not configured. Set VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEETS_ID environment variables, or provide a spreadsheet ID.'
    );
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Failed to fetch sheet: ${response.status}`);
  }

  const data = await response.json();

  if (!data.values || data.values.length < 2) {
    throw new Error('Sheet is empty or has no data rows (expected a header row + question rows).');
  }

  const rows = data.values.slice(1);

  return rows
    .filter((row: string[]) => row.some((cell) => cell && cell.trim()))
    .map((row: string[]) => ({
      question_text: (row[0] || '').trim(),
      options: [row[1], row[2], row[3], row[4]].map((opt) => (opt || '').trim()).filter(Boolean),
      correct_answer: (row[5] || '').trim(),
    }));
}
