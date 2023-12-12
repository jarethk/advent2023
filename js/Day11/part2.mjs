/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { distance } from 'geometry/manhattan.js'

const debug = 1;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let universe = [];
let toExpandY = new Set();
let toExpandX;

for await (const line of file.readLines()) {
    let split = line.split("");
    if (!toExpandX) toExpandX = new Set([...split.map((v, idx) => idx)]);
    universe.push(split);
    // expansion
    if (!line.includes("#")) toExpandY.add(universe.length - 1);
    split.map((v, idx) => [v, idx]).filter(vi => vi[0] == "#").forEach(vi => toExpandX.delete(vi[1]));
}

dl(`To expandX: ${[...toExpandX.values()]}`);
dl(`To expandY: ${[...toExpandY.values()]}`);

if (debug) console.log(universe.map(row => row.join("")).join("\n"));

// now get the coords of our galaxies
let galaxies = [];
universe.forEach((row, idy) => {
    row.forEach((s, idx) => {
        if (s == "#") galaxies.push([idy, idx]);
    });
});

const SPACE_EXPANSION = 1000000 - 1;
//const SPACE_EXPANSION = 100 - 1;

let distances = 0;
for (let g = 1; g < galaxies.length; g++) {
    for (let g0 = 0; g0 < g; g0++) {
        distances += distance(galaxies[g], galaxies[g0]);
        let xSet = [galaxies[g][1], galaxies[g0][1]].sort((a, b) => a - b);
        for (let x = xSet[0] + 1; x < xSet[1]; x++) {
            if (toExpandX.has(x)) distances += SPACE_EXPANSION;
        }
        let ySet = [galaxies[g][0], galaxies[g0][0]].sort((a, b) => a - b);
        for (let y = ySet[0] + 1; y < ySet[1]; y++) {
            if (toExpandY.has(y)) distances += SPACE_EXPANSION;
        }
    }
}

console.log(`Galactic distances: ${distances}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
