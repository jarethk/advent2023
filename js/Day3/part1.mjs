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
let remainingNumbers = [];
let savedNumbers = [];

function clearNumber(row, startIndex) {
    if (DIGIT_RE.test(row[startIndex])) {
        // find the first by going backwards
        let first = startIndex;
        while (first > 0 && DIGIT_RE.test(row[first - 1])) first--;
        let num = "";
        for (let r = first; r < row.length && DIGIT_RE.test(row[r]); r++) {
            num += row[r];
            row[r] = ".";
        }
        savedNumbers.push(~~num);
    }
}

function hasNearbySymbol(row, fromIndex) {
    if (SYMBOL_RE.test(row[fromIndex - 1])) return true;
    if (priorRow &&
        (SYMBOL_RE.test(priorRow[fromIndex - 1]) ||
            SYMBOL_RE.test(priorRow[fromIndex]) ||
            SYMBOL_RE.test(priorRow[fromIndex + 1]))) return true;
}

for await (const line of file.readLines()) {
    let currentRow = line.split("");
    for (let c = 1; c < currentRow.length; c++) {
        if (currentRow[c] === ".") continue;
        if (DIGIT_RE.test(currentRow[c])) {
            if (hasNearbySymbol(currentRow, c)) {
                clearNumber(currentRow, c);
            }
        } else {
            dl(`Have a symbol: ${currentRow[c]} & ${DIGIT_RE.test(currentRow[c - 1])}`)
            clearNumber(currentRow, c - 1);
            if (priorRow) {
                clearNumber(priorRow, c - 1);
                clearNumber(priorRow, c);
                clearNumber(priorRow, c + 1);
            }
        }
    }
    priorRow = currentRow;
    dl(`updated row ${currentRow} `);
}

console.log(savedNumbers.reduce((ac, cv) => ac + cv))

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
