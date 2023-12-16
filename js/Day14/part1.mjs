/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let grid = [];

for await (const line of file.readLines()) {
    grid.push([...line.split("")]);
}

for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
        if (grid[y][x] === ".") {
            for (let ny = y + 1; ny < grid.length; ny++) {
                if (grid[ny][x] === "#") break;
                if (grid[ny][x] === "O") {
                    grid[y][x] = "O";
                    grid[ny][x] = ".";
                    break;
                }
            }
        }
    }
}

//console.log(`grid: \n\t${grid.map(row => row.join("")).join("\n\t")}`);

console.log(`north load: ${grid.map((row, idx) => row.filter(c => c === "O").length)}`);

console.log(`north load: ${grid.map((row, idx) => row.filter(c => c === "O").length * (grid.length - idx)).reduce((a, b) => a + b)}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
