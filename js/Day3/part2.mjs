/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const DIGIT_RE = /\d/;
const SYMBOL_RE = /[^\.\d\w]/;

let priorRow;
let rowIdx = 0;
let savedNumbers = {};

function clearNumber(row, startIndex, gearKey) {
    if (DIGIT_RE.test(row[startIndex])) {
        // find the first by going backwards
        let first = startIndex;
        while (first > 0 && DIGIT_RE.test(row[first - 1])) first--;
        let num = "";
        for (let r = first; r < row.length && DIGIT_RE.test(row[r]); r++) {
            num += row[r];
            row[r] = ".";
        }
        if (!savedNumbers[gearKey]) savedNumbers[gearKey] = [];
        savedNumbers[gearKey].push(~~num);
    }
}

for await (const line of file.readLines()) {
    let currentRow = line.split("");
    for (let c = 1; c < currentRow.length; c++) {
        if (currentRow[c] === ".") continue;
        if (currentRow[c] === "*") {
            clearNumber(currentRow, c - 1, (rowIdx) + "|" + c);
            clearNumber(currentRow, c + 1, (rowIdx) + "|" + c);
            clearNumber(priorRow, c - 1, (rowIdx) + "|" + c);
            clearNumber(priorRow, c, (rowIdx) + "|" + c);
            clearNumber(priorRow, c + 1, (rowIdx) + "|" + c);
        } else if (priorRow && DIGIT_RE.test(currentRow[c])) {
            if (priorRow[c - 1] === "*") {
                clearNumber(currentRow, c, (rowIdx - 1) + "|" + (c - 1));
            }
            if (priorRow[c] === "*") {
                clearNumber(currentRow, c, (rowIdx - 1) + "|" + (c));
            }
            if (priorRow[c + 1] === "*") {
                clearNumber(currentRow, c, (rowIdx - 1) + "|" + (c + 1));
            }
        }
    }
    priorRow = currentRow;
    rowIdx++;
    dl(`updated row ${currentRow} `);
}

console.log(Object.values(savedNumbers)
    .filter(v => v.length == 2)
    .map(v => v.reduce((ac, cv) => ac * cv, 1))
    .reduce((ac, cv) => ac + cv));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
