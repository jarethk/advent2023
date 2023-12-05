/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let gameCards = [];

for await (const line of file.readLines()) {
    let parts = line.split(/:|\|/);
    let cardNum = ~~(parts[0].split(" ").pop());
    if (!gameCards[cardNum]) gameCards[cardNum] = 1;
    let winners = parts[1].trim().split(/\s+/).reduce((ac, cv) => { ac[cv] = 0; return ac; }, {});
    let numbers = parts[2].trim().split(/\s+/);
    dl(`Numbers: ${JSON.stringify(numbers)}`)
    numbers.forEach(n => {
        if (winners[n] != undefined) { winners[n] += 1 };
        dl(`updated ${n}: ${winners[n]}`)
    });
    dl(`Winners: ${JSON.stringify(winners)}`)
    winners = Object.values(winners).filter(v => v != 0).length;
    for (let w = 1; w <= winners; w++) {
        if (!gameCards[cardNum + w]) gameCards[cardNum + w] = 1;
        gameCards[cardNum + w] += gameCards[cardNum];
    }
}

console.log(`Game cards: ${gameCards.reduce((ac, cv) => ac + cv)}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
