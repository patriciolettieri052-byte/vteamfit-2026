const XLSX = require('xlsx');
const excelPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Finding rows containing SEMANA:');
rawRows.forEach((row, idx) => {
  if (row && row.some(cell => String(cell).toUpperCase().includes('SEMANA'))) {
    console.log(`Row ${idx + 1}:`, row.filter(c => c !== null && c !== undefined && c !== ''));
  }
});
