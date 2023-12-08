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
let cycle = 0;

for await (const line of file.readLines()) {
    if (line.trim().length == 0) {
        if (seeds.length > 0) newSeeds.push(...seeds);
        seeds = newSeeds;
        newSeeds = [];
        console.log(`New seeds: ${JSON.stringify(seeds)}`);
    } else if (line.startsWith("seeds:")) {
        seeds = line.split(":")[1].trim()
            .split(" ")
            .map(v => Number.parseInt(v))
            .reduce((ac, cv, idx, arr) => { if (idx % 2 === 0) ac.push([cv, arr[idx + 1]]); return ac; }, []);
    } else if (RANGE_RE.test(line)) {
        let range = line.match(RANGE_RE).filter((v, idx) => idx >= 1 && idx <= 3).map(v => Number.parseInt(v));
        dl(`Parsed range: ${range}`);
        let keepSeeds = [];
        seeds.forEach((s, idx) => {
            let seedMin = s[0];
            let seedMax = s[0] + s[1] - 1;
            let rangeMin = range[1];
            let rangeMax = (range[1] + range[2] - 1);
            let rangeShift = range[0] - range[1];
            if (seedMax < rangeMin) {
                keepSeeds.push(s);
            } else if (seedMin > rangeMax) {
                keepSeeds.push(s);
            } else {
                // if seed range is wider/lower than the map range, keep the subrange for next range
                if (seedMin < rangeMin) {
                    dl(`seed range below range min ${rangeMin}`);
                    keepSeeds.push([seedMin, (rangeMin + 1) - seedMin]);
                    seedMin = rangeMin;
                }
                // if seed range is wider/higher than the map range, keep the subrange for next range
                if (rangeMax < seedMax) {
                    dl(`seed range above range max ${rangeMax}`);
                    keepSeeds.push([rangeMax + 1, (seedMax + 1) - (rangeMax)]);
                    seedMax = rangeMax;
                }
                // what subrange is left is for translation
                if (seedMin < seedMax && seedMin >= rangeMin && seedMax <= rangeMax) {
                    newSeeds.push([rangeShift + seedMin, (seedMax + 1) - seedMin]);
                }
            }
        });
        seeds = keepSeeds;
        //if (cycle >= 2) break;
        cycle++;
    }
}
if (seeds.length > 0) newSeeds.push(...seeds);
seeds = newSeeds;

console.log("----Final Seeds----");
console.log(JSON.stringify(seeds));
console.log(seeds.map(s => s[0]).sort((a, b) => a - b)[0]);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
