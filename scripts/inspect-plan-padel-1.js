const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx';

if (!fs.existsSync(excelPath)) {
  console.error(`❌ File not found at: ${excelPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
console.log('Sheet Names:', workbook.SheetNames);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
console.log('\nFirst 15 rows of first sheet:');
console.log(data.slice(0, 15));
