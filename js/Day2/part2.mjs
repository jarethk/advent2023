/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 1;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const MAX_RED = 12;
const MAX_GREEN = 13;
const MAX_BLUE = 14;

let games = [];

for await (const line of file.readLines()) {
    let lp = line.split(":");
    let gameNum = lp[0].match(/\d+/)[0];
    let rounds = lp[1].trim().split(/;|,/)
        .map(pair => pair.trim().split(" "))
        .reduce((ac, cv) => { ac[cv[1]] = ac[cv[1]] ? Math.max(ac[cv[1]], ~~cv[0]) : ~~cv[0]; return ac; }, {});
    dl(JSON.stringify(rounds));
    games.push([gameNum, Object.values(rounds).reduce((ac, cv) => ac * cv, 1)]);
}

console.log(JSON.stringify(games));
console.log(games.map(g => g[1]).reduce((ac, cv) => ac + cv));

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
