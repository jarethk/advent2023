/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
//const file = await open("./sample-input3.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let directions;
let paths = new Map();
let locations = [];
const PATH_RE = /^(\w+)\s=\s\((.+)\)$/;

for await (const line of file.readLines()) {
    if (!directions) directions = line.split("");
    if (line.length == 0) continue;
    if (PATH_RE.test(line)) {
        let matches = line.match(PATH_RE);
        if (matches[1].endsWith("A")) locations.push(matches[1]);
        paths.set(matches[1], matches[2].replace(" ", "").split(","));
    }
}


function getLocSteps(location) {
    let dirPos = 0;
    let steps = 0;
    console.log(`Remapping location: ${location}`)
    while (!location.endsWith("Z")) {
        location = paths.get(location)[directions[dirPos] == "L" ? 0 : 1];
        dl(`Next loc: ${location}`);
        dirPos++; steps++;
        if (dirPos >= directions.length) dirPos = 0;
    }
    return steps;
}

console.log(`Start locations: ${locations}`);
locations = locations.map(getLocSteps);
console.log(`End locations: ${locations}`);

// gcd and lcm from https://stackoverflow.com/questions/47047682/least-common-multiple-of-an-array-values-using-euclidean-algorithm
const gcd = (a, b) => a ? gcd(b % a, a) : b;
const lcm = (a, b) => a * b / gcd(a, b);

console.log(`Steps lcm: ${locations.reduce(lcm)}`);
//console.log(`Steps: ${steps}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
