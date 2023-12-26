/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { shiftPoint } from 'geometry/space3d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

function lineIntersection(line1, line2) {
    let intersection = [undefined, undefined];
    let denom = ((line1[0][0] - line1[1][0]) * (line2[0][1] - line2[1][1])) - ((line1[0][1] - line1[1][1]) * (line2[0][0] - line2[1][0]));
    if (denom == 0) return intersection;
    let nump1 = (line1[0][0] * line1[1][1]) - (line1[0][1] * line1[1][0]);
    let nump2 = (line2[0][0] * line2[1][1]) - (line2[0][1] * line2[1][0]);
    intersection[0] = ((nump1 * (line2[0][0] - line2[1][0])) - ((line1[0][0] - line1[1][0]) * nump2)) / denom;
    intersection[1] = ((nump1 * (line2[0][1] - line2[1][1])) - ((line1[0][1] - line1[1][1]) * nump2)) / denom;
    return intersection;
}

function checkIntersectFuture(h1, h2, intersect) {
    let directionX1 = intersect[0] - h1[0][0];
    let directionY1 = intersect[1] - h1[0][1];
    let h1IsFuture = ((directionX1 < 0 && h1[1][0] < 0) || (directionX1 > 0 && h1[1][0] > 0)) &&
        ((directionY1 < 0 && h1[1][1] < 0) || (directionY1 > 0 && h1[1][1] > 0));

    let directionX2 = intersect[0] - h2[0][0];
    let directionY2 = intersect[1] - h2[0][1];
    let h2IsFuture = ((directionX2 < 0 && h2[1][0] < 0) || (directionX2 > 0 && h2[1][0] > 0)) &&
        ((directionY2 < 0 && h2[1][1] < 0) || (directionY2 > 0 && h2[1][1] > 0));
    return (h1IsFuture && h2IsFuture);
}

let hailstones = [];

let simplifier = 1;
//let simplifier = 10000000000000;

for await (const line of file.readLines()) {
    let split = line.split("@")
    let p1 = split[0].split(",").map(c => (Number.parseInt(c.trim()) / simplifier));
    let v1 = split[1].split(",").map(c => Number.parseInt(c.trim()));
    let p2 = shiftPoint(p1, v1);
    hailstones.push([v1, p1, p2]);
    //if (hailstones.length > 10) break;
}

function checkForecast(fromPoint, startingT, velocity, unfixed) {
    let tooFar = false;
    let rUnfixed = [...unfixed];
    let rFixed = [];
    let t = startingT;
    while (!tooFar && rUnfixed.length > 0) {
        t++;
        rUnfixed.filter(u => u.length < t + 1).forEach(u => {
            u.push(shiftPoint(u[t - 1], u[0]));
        });
        rUnfixed.sort((a, b) => a[t][2] - b[t][2]);
        let lowest = rUnfixed.shift();
        if (debug) {
            console.log(`\tLowest at t${t - 1}: ${lowest[t]} which started from ${JSON.stringify(lowest[1])}`);
        }

        let tv = velocity.map(v => ((t - startingT) * v));

        if ((fromPoint[2] + tv[2]) > lowest[t][2]) {
            // if our Z is too low, we've failed
            dl(`\t--we've gotten too low`)
            dl(`\t  base ${fromPoint[2]} with velocity ${tv[2]} aiming at ${lowest[t][2]}`);
            tooFar = true;
        } else if ((lowest[t][0] - fromPoint[0] == tv[0])
            && (lowest[t][1] - fromPoint[1] == tv[1])
            && (lowest[t][2] - fromPoint[2] == tv[2])) {
            // if velocity matches, capture new fromPoint and hold the lowest in fixed
            dl(`\t++we hit the hail, to continue checking`);
            rFixed.push(lowest[t]);
            fromPoint = lowest[t];
            startingT = t;
        } else {
            // if no match, no worry, we might get a hit on the next cycle
            rUnfixed.unshift(lowest);
        }
    }
    return !(tooFar || rUnfixed.length > 0);
}

// t1 == 0
let baseT = 1;
let fixed = [];
let forecastValid = false;


while (!forecastValid) {
    // make a copy of our hailstones, and pick the lowest one
    let unfixed = [...hailstones];
    baseT++;
    console.log(`Checking for base time ${baseT - 1}`);
    unfixed.filter(u => u.length < baseT + 1).forEach(u => {
        u.push(shiftPoint(u[baseT - 1], u[0]));
    });
    unfixed.sort((a, b) => a[baseT][2] - b[baseT][2]);
    let lowest = unfixed.shift();

    if (lowest[baseT][2] <= 1) {
        console.log(`Our target hit the ground, we failed  :(`);
        break;
    }

    let tooLow = false;
    let t = baseT;
    while (!tooLow && !forecastValid && t < 2000) {
        t++;
        unfixed.filter(u => u.length < t + 1).forEach(u => {
            u.push(shiftPoint(u[t - 1], u[0]));
        });
        unfixed.sort((a, b) => a[t][2] - b[t][2]);
        //let nextLowest = unfixed[0];
        let nextLowest = unfixed.shift();;

        console.log(`against time ${t - 1} comparing ${lowest[baseT][2]} against ${nextLowest[t][2]}`);

        if (lowest[baseT][2] > nextLowest[t][2]) {
            dl(`Our 2nd target now too low...`);
            tooLow = true;
        } else {
            let velocity = [(nextLowest[t][0] - lowest[baseT][0]) / (t - baseT), (nextLowest[t][1] - lowest[baseT][1]) / (t - baseT), (nextLowest[t][2] - lowest[baseT][2]) / (t - baseT)];
            if (debug) {
                console.log(`Calculated velocity: ${JSON.stringify(velocity)}`);
                console.log(`\tfor target 1: ${JSON.stringify(lowest[baseT])} at time ${baseT - 1} which started from ${JSON.stringify(lowest[1])}`);
                console.log(`\tfor target 2: ${JSON.stringify(nextLowest[t])} at time ${t - 1} which started from ${JSON.stringify(nextLowest[1])}`);
            }
            forecastValid = checkForecast(nextLowest[t], t, velocity, unfixed);
            if (forecastValid) {
                console.log(`We have a winner!`);
                let throwPosition = shiftPoint(lowest[baseT], velocity.map(v => v * -1));
                console.log(`==So throwing position is ${JSON.stringify(throwPosition)}: ${throwPosition.reduce((a, b) => a + b)}`);
                break;
            } else {
                unfixed.unshift(nextLowest);
            }
        }
    }

}

/*
if ((lowest[2] + tv[2]) > nextLowest[t][2]) {
    // if our Z is too low, we've failed
    tooLow = true;
} else if ((lowest[t][0] - fromPoint[0] == tv[0])
    && (lowest[t][1] - fromPoint[1] == tv[1])
    && (lowest[t][2] - fromPoint[2] == tv[2])) {
    // if velocity matches, capture new fromPoint and hold the lowest in fixed
    rFixed.push(lowest[t]);
    fromPoint = lowest[t];
} else {
    // if no match, no worry, we might get a hit on the next cycle
    rUnfixed.unshift(lowest);
}

unfixed.filter(u => u.length < t + 1).forEach(u => {
    u.push(shiftPoint(u[t - 1], u[0]));
});
unfixed.sort((a, b) => a[t][2] - b[t][2]);
lowest = unfixed.shift();
console.log(`Lowest at t${t - 1}: ${lowest[t]}`);
fixed.push(lowest[t]);

let velocity = [(fixed[2][0] - fixed[1][0]) / 2, (fixed[2][1] - fixed[1][1]) / 2, (fixed[2][2] - fixed[1][2]) / 2];
console.log(`Velocity: ${velocity}`);

console.log(`Validating orignal update: ${JSON.stringify(hailstones[1])}`)
*/
const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
