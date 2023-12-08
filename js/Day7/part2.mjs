/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 1;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

const translationMap = {
    "A": "M",
    "K": "L",
    "Q": "K",
    "T": "I",
    "9": "H",
    "8": "G",
    "7": "F",
    "6": "E",
    "5": "D",
    "4": "C",
    "3": "B",
    "2": "A",
    "J": "0"
}

const HAND_RE = /^([\w\d]+)\s(\d+)$/;
// array of {cards: , type: , bid:}
let hands = [];

for await (const line of file.readLines()) {
    let matches = line.match(HAND_RE);
    dl(`Hand :${matches[1]} translates to: ${matches[1].split("").map(c => translationMap[c]).join("")}`);
    let hand = { "cards": matches[1].split("").map(c => translationMap[c]).join(""), "orig": matches[1], "bid": Number.parseInt(matches[2]) };
    let scoring = hand.orig.split("")
        .reduce((ac, cv) => { ac[cv] = (ac[cv]) ? ac[cv] + 1 : 1; return ac; }, {});
    scoring.counts = Object.entries(scoring).filter(pair => pair[0] != "J").map(pair => pair[1]).sort((a, b) => b - a);
    if (scoring.counts[0] == 5) hand.type = 5;
    else if (scoring.counts[0] == 4 && scoring.J == 1) hand.type = 5;
    else if (scoring.counts[0] == 4) hand.type = 4;
    else if (scoring.counts[0] == 3 && scoring.J == 2) hand.type = 5;
    else if (scoring.counts[0] == 3 && scoring.J == 1) hand.type = 4;
    else if (scoring.counts[0] == 3 && scoring.counts[1] == 2) hand.type = 3.1;
    else if (scoring.counts[0] == 3) hand.type = 3;
    else if (scoring.counts[0] == 2 && scoring.J == 3) hand.type = 5;
    else if (scoring.counts[0] == 2 && scoring.J == 2) hand.type = 4;
    else if (scoring.counts[0] == 2 && scoring.counts[1] == 2 && scoring.J == 1) hand.type = 3.1;
    else if (scoring.counts[0] == 2 && scoring.J == 1) hand.type = 3;
    else if (scoring.counts[0] == 2 && scoring.counts[1] == 2) hand.type = 2.1;
    else if (scoring.counts[0] == 2) hand.type = 2;
    else if (scoring.J == 5) hand.type = 5;
    else if (scoring.J == 4) hand.type = 5;
    else if (scoring.J == 3) hand.type = 4;
    else if (scoring.J == 2) hand.type = 3;
    else if (scoring.J == 1) hand.type = 2;
    else hand.type = 0;
    if (hands.length == 0) hands.push(hand);
    else {
        let idx = 0;
        for (; idx < hands.length; idx++) {
            if (hands[idx].type < hand.type) continue;
            if (hands[idx].type == hand.type && hands[idx].cards < hand.cards) continue;
            // insert after everything of lower value
            break;
        }
        hands.splice(idx, 0, hand);
    }
}
if (debug) {
    //console.log(JSON.stringify(hands));
    console.log(hands.map(h => JSON.stringify(h)).join("\n\t"));
}
let winnings = hands.map((h, idx) => (idx + 1) * h.bid).reduce((ac, cv) => ac + cv);
console.log(winnings);
// bid * rank order


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
