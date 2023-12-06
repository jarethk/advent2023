/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

// destination, source, range length
const RANGE_RE = /^(\d+)\s+(\d+)\s+(\d+)$/;
const MAP_LINE_RE = /^(\w+)\-to\-(\w+)\smap:/;

let seeds = [];
let newSeeds = [];

for await (const line of file.readLines()) {
    if (line.trim().length == 0) {
        if (seeds.length > 0) newSeeds.push(...seeds);
        seeds = newSeeds;
        newSeeds = [];
        console.log(`New seeds: ${JSON.stringify(seeds)}`);
    } else if (line.startsWith("seeds:")) {
        seeds = line.split(":")[1].trim().split(" ").map(v => Number.parseInt(v));
    } else if (RANGE_RE.test(line)) {
        let range = line.match(RANGE_RE).filter((v, idx) => idx >= 1 && idx <= 3).map(v => Number.parseInt(v));
        console.log(`Parsed range: ${range}`);
        let origs = [];
        seeds.forEach(s => {
            if ((s - range[1]) >= 0 && (s - range[1]) < range[2]) {
                origs.push(s);
                newSeeds.push(range[0] + (s - range[1]))
            }
        });
        seeds = seeds.filter(s => !origs.includes(s));
    }
}
if (seeds.length > 0) newSeeds.push(...seeds);
seeds = newSeeds;

console.log(JSON.stringify(seeds));
console.log(Math.min(...seeds));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
