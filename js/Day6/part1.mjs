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
        times = line.match(LINE_RE).map(v => Number.parseInt(v));
        console.log(times);
    } else if (line.startsWith("Distance:")) {
        distances = line.match(LINE_RE).map(v => Number.parseInt(v));
        console.log(distances);
    }
}

let product = 1;
times.forEach((t, idx) => {
    let scores = new Array(t).fill(1).map((v, idx) => (idx + 1) * (t - (idx + 1)));
    let wins = scores.filter(s => s > distances[idx]);
    console.log(`For time ${t}: ${scores}; winners: ${wins.length}`);
    product *= wins.length;
});

console.log(product);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
