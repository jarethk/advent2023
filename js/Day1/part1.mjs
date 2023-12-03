/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let lines = [];

for await (const line of file.readLines()) {
    lines.push(~~line.match(/\d/g).filter((v, i, a) => i == 0 || i == a.length - 1).join(""));
}
lines = lines.map(v => v < 10 ? v * 11 : v);
console.log(JSON.stringify(lines));
console.log(lines.reduce((ac, cv) => ac + cv));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
