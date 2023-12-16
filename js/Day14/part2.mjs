/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

function rollNorth() {
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
}

function rollSouth() {
    for (let x = grid[0].length - 1; x >= 0; x--) {
        for (let y = grid.length - 1; y >= 0; y--) {
            if (grid[y][x] === ".") {
                for (let ny = y - 1; ny >= 0; ny--) {
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
}

function rollWest() {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === ".") {
                for (let nx = x + 1; nx < grid.length; nx++) {
                    if (grid[y][nx] === "#") break;
                    if (grid[y][nx] === "O") {
                        grid[y][x] = "O";
                        grid[y][nx] = ".";
                        break;
                    }
                }
            }
        }
    }
}

function rollEast() {
    for (let y = grid.length - 1; y >= 0; y--) {
        for (let x = grid[0].length - 1; x >= 0; x--) {
            if (grid[y][x] === ".") {
                for (let nx = x - 1; nx >= 0; nx--) {
                    if (grid[y][nx] === "#") break;
                    if (grid[y][nx] === "O") {
                        grid[y][x] = "O";
                        grid[y][nx] = ".";
                        break;
                    }
                }
            }
        }
    }
}

let grid = [];

for await (const line of file.readLines()) {
    grid.push([...line.split("")]);
}

let pastCache = new Map();
let pastStates = [];

const MAX_CYCLES = 1000000000;

for (let cycle = 0; cycle < MAX_CYCLES; cycle++) {
    rollNorth();
    rollWest();
    rollSouth();
    rollEast();
    let gridAfter = JSON.stringify(grid);
    if (!pastCache.has(gridAfter)) {
        pastCache.set(gridAfter, cycle);
        pastStates.push(gridAfter);
    } else {
        let pastCycle = pastCache.get(gridAfter);
        console.log(`Found we've been here before!`);
        console.log(`Current: ${cycle}; past: ${pastCycle}`);
        grid = JSON.parse(pastStates[pastCycle + (MAX_CYCLES - cycle) % (cycle - pastCycle) - 1]);
        break;
    }
}

//console.log(`grid: \n\t${grid.map(row => row.join("")).join("\n\t")}`);

console.log(`north load: ${grid.map((row, idx) => row.filter(c => c === "O").length)}`);

console.log(`north load: ${grid.map((row, idx) => row.filter(c => c === "O").length * (grid.length - idx)).reduce((a, b) => a + b)}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
