const XLSX = require('xlsx');
const excelPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Sample rows from row 18 to 35:');
rawRows.slice(17, 35).forEach((r, i) => {
  console.log(`Row ${i + 18}:`, r);
});
