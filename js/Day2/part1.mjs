/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const MAX_RED = 12;
const MAX_GREEN = 13;
const MAX_BLUE = 14;

let games = [];
const ROUND_RE = /^(?:[1-9]|1[0-2])red|^(?:[1-9]|1[0-4])blue|^(?:[1-9]|1[0-3])green/;

for await (const line of file.readLines()) {
    let lp = line.replaceAll(" ", "").split(":");
    let gameNum = lp[0].match(/\d+/)[0];
    let rounds = lp[1].split(";");
    dl(`Testing round: ${JSON.stringify(rounds)}`);
    let valid = rounds.every(round => round.split(",").every(cbe => {
        dl(`--Testing hand: ${JSON.stringify(cbe)}: ${ROUND_RE.test(cbe)}`);
        return ROUND_RE.test(cbe)
    }));
    games.push([gameNum, valid]);
}

console.log(JSON.stringify(games));
console.log(games.filter(g => g[1]).map(g => ~~g[0]).reduce((ac, cv) => ac + cv));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
