/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let points = 0;

for await (const line of file.readLines()) {
    let parts = line.split(/:|\|/);
    let winners = parts[1].trim().split(/\s+/).reduce((ac, cv) => { ac[cv] = 0; return ac; }, {});
    let numbers = parts[2].trim().split(/\s+/);
    dl(`Numbers: ${JSON.stringify(numbers)}`)
    numbers.forEach(n => {
        if (winners[n] != undefined) { winners[n] += 1 };
        dl(`updated ${n}: ${winners[n]}`)
    });
    console.log(`Winners: ${JSON.stringify(winners)}`)
    winners = Object.values(winners).filter(v => v != 0);
    let score = winners.length > 0 ? 1 : 0;
    if (winners.length > 1) score *= Math.pow(2, winners.length - 1);
    console.log(`Score: ${score}`);
    points += score;
}

console.log(`Points: ${points}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
