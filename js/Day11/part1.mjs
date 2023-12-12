/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { distance } from 'geometry/manhattan.js'

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let universe = [];
let toExpand;

for await (const line of file.readLines()) {
    let split = line.split("");
    if (!toExpand) toExpand = new Set([...split.map((v, idx) => idx)]);
    universe.push(split);
    // expansion
    if (!line.includes("#")) universe.push([...split]);
    split.map((v, idx) => [v, idx]).filter(vi => vi[0] == "#").forEach(vi => toExpand.delete(vi[1]));
}

dl(`To expand: ${toExpand.values()}`);

// expand the universe vertically, because more work
universe.forEach(row => {
    let adder = 0;
    toExpand.forEach(idx => {
        row.splice(idx + adder, 0, ".");
        adder++;
    });
});

if (debug) console.log(universe.map(row => row.join("")).join("\n"));

// now get the coords of our galaxies
let galaxies = [];
universe.forEach((row, idy) => {
    row.forEach((s, idx) => {
        if (s == "#") galaxies.push([idy, idx]);
    });
});

let distances = 0;
for (let g = 1; g < galaxies.length; g++) {
    for (let g0 = 0; g0 < g; g0++) {
        distances += distance(galaxies[g], galaxies[g0]);
    }
}

console.log(`Galactic distances: ${distances}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
