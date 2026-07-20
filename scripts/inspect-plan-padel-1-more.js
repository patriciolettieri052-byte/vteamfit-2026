const XLSX = require('xlsx');
const path = require('path');

const excelPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Rows 15 to 60:');
data.slice(15, 60).forEach((row, i) => {
  if (row && row.length > 0) {
    console.log(`Row ${i + 16}:`, row.filter(cell => cell !== null && cell !== undefined && cell !== ''));
  }
});
