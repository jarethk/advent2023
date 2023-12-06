/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const LINE_RE = /\d+/g;

let times = [];
let distances = [];
for await (const line of file.readLines()) {
    if (line.startsWith("Time:")) {
        times = Number.parseInt(line.match(LINE_RE).join(""));
        console.log(times);
    } else if (line.startsWith("Distance:")) {
        distances = Number.parseInt(line.match(LINE_RE).join(""));
        console.log(distances);
    }
}

let idx = 0;
while (((idx + 1) * (times - (idx + 1))) <= distances) idx++;
idx++;

console.log(idx);
console.log(times - (idx * 2) + 1)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
