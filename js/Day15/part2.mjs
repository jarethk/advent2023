/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const hashVal = (val) => (val * 17) % 256;
const hashString = (str) => str.split("").map(c => c.charCodeAt(0)).reduce((ac, cv) => hashVal(ac + cv), 0);

let lenses = new Array(256);
let instructions;

for await (const line of file.readLines()) {
    instructions = line.split(",");
}

instructions.forEach(inst => {
    let parts = inst.split(/(=|-)/);
    let h = hashString(parts[0]);
    if (parts[1] == "=") {
        if (!lenses[h]) lenses[h] = [];
        if (!lenses[h].some(lens => lens[0] == parts[0])) {
            // if not already there, add it
            lenses[h].push([parts[0], parts[2]]);
        } else {
            // if already there, replace it
            let idx = lenses[h].findIndex(lens => lens[0] == parts[0]);
            lenses[h][idx][1] = parts[2];
        }
    } else if (parts[1] == "-" && (lenses[h] && lenses[h].some(lens => lens[0] == parts[0]))) {
        // remove it
        let idx = lenses[h].findIndex(lens => lens[0] == parts[0]);
        lenses[h].splice(idx, 1);
    }
});

let focalPower = lenses.map((box, bidx) => box.map((lens, lidx) => (1 + bidx) * (1 + lidx) * lens[1]).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b);
console.log(focalPower);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
