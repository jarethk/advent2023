/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { getAdjacent } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let grid = [];

let startCoords = [0, -1];

for await (const line of file.readLines()) {
    grid.push(line.split(""));
    if (line.includes("S")) startCoords[1] = line.indexOf("S");
    else if (startCoords[1] != -1) startCoords[0]++;
}

const MAX_STEPS = 64;
for (let s = 0; s < MAX_STEPS; s++) {
    let newGrid = grid.map(row => [...row]);
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if ("SO".includes(grid[y][x])) {
                getAdjacent([y, x], grid)
                    .filter(p => grid[p[0]][p[1]] != "#")
                    .forEach(p => newGrid[p[0]][p[1]] = "O");
                newGrid[y][x] = ".";
            }
        }
    }
    grid = newGrid;
}

//console.log(`Grid:\n\t${grid.map(row => row.join("")).join("\n\t")}`);
console.log(grid.map(row => row.filter(c => c === "O").length).reduce((ac, cv) => ac + cv));


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
