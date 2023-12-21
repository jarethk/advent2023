/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { dirSet, shiftPoint, getSurrounding } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let current = [1, 1];
let coords = [];

const LINE_RE = /^(\w)\s(\d+)\s\(#([\d\w]+)(\d)\)$/;
const DIR_REMAP = {
    "0": "R",
    "1": "D",
    "2": "L",
    "3": "U"
};

let moves = [];
let points = [];
points.push(current);
// 1 for origin, double
let borderLength = 2;

for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let move = Number.parseInt(parts[3], 16);
    moves.push([move, dirSet[DIR_REMAP[parts[4]]]]);
    current = shiftPoint(current, dirSet[DIR_REMAP[parts[4]]].map(v => v * move));
    points.push(current);
    borderLength += move;
}

// shoelace
console.log(`Moves:\n\t${moves.map(m => JSON.stringify(m)).join("\n\t")}`);

console.log(`Points:\n\t${points.map(m => JSON.stringify(m)).join("\n\t")}`)
console.log((borderLength / 2) + points.map((p, idx, arr) => ((p[1] * arr[(idx + 1) % arr.length][0]) - (p[0] * arr[(idx + 1) % arr.length][1])) / 2).reduce((a, b) => a + b));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
