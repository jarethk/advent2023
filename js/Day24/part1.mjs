/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { shiftPoint } from 'geometry/space3d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

//let rangeMin = 7;
//let rangeMax = 27;
//let simplifier = 10000000000000;
let rangeMin = 200000000000000n;// / simplifier;
let rangeMax = 400000000000000n;// / simplifier;

const t0 = performance.now();

function lineIntersection(line1, line2) {
    let intersection = [undefined, undefined];
    let denom = ((line1[0][0] - line1[1][0]) * (line2[0][1] - line2[1][1])) - ((line1[0][1] - line1[1][1]) * (line2[0][0] - line2[1][0]));
    if (denom == 0) return intersection;
    let nump1 = (line1[0][0] * line1[1][1]) - (line1[0][1] * line1[1][0]);
    let nump2 = (line2[0][0] * line2[1][1]) - (line2[0][1] * line2[1][0]);
    intersection[0] = (((nump1 * (line2[0][0] - line2[1][0])) - ((line1[0][0] - line1[1][0]) * nump2)) / denom);
    intersection[1] = (((nump1 * (line2[0][1] - line2[1][1])) - ((line1[0][1] - line1[1][1]) * nump2)) / denom);
    return intersection;
}

function checkIntersectFuture(h1, h2, intersect) {
    console.log(intersect[0] + "|" + intersect[1]);
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

for await (const line of file.readLines()) {
    let split = line.split("@")
    let p1 = split[0].split(",").map(c => BigInt(c.trim()));//(Number.parseInt(c.trim()) / simplifier));
    let v1 = split[1].split(",").map(c => BigInt(c.trim()));
    let p2 = shiftPoint(p1, v1);
    hailstones.push([p1, v1, p2]);
    //if (hailstones.length > 10) break;
}

let intersectCount = 0;
for (let h1 = 1; h1 < hailstones.length; h1++) {
    for (let h2 = 0; h2 < h1; h2++) {
        let intersect = lineIntersection([hailstones[h1][0], hailstones[h1][2]], [hailstones[h2][0], hailstones[h2][2]]);

        if (intersect[0] == undefined || intersect[1] == undefined) {
            console.log(`Skipping, undefined intersect for ${h1} and ${h2}`);
            continue;
        }

        // need to check if the intersection is within the range
        if (intersect[0] < rangeMin || intersect[0] > rangeMax || intersect[1] < rangeMin || intersect[1] > rangeMax) {
            //dl(`-- intersection out of range`);
            continue;
        }
        if (intersect[0] < 1 || intersect[1] < 1) {
            dl(`-- intersection out of range`);
            continue;
        }
        // need to check if the intersection is in the past or future
        if (!checkIntersectFuture(hailstones[h1], hailstones[h2], intersect)) {
            //dl(`Intersection between: \n\t${hailstones[h1][0]} and \n\t${hailstones[h2][0]}:\n\t${JSON.stringify(intersect)}`);
            dl(`-- intersection in past`);
            dl(`\tDirection of h1: ${hailstones[h1][0]} + ${hailstones[h1][1]}`);
            dl(`\tDirection of h2: ${hailstones[h2][0]} + ${hailstones[h2][1]}`);
            continue;
        }

        //console.log(`Intersection is future and in range`);
        console.log(`Future intersection between ${h1} and ${h2} at ${intersect[0]},${intersect[1]}`);
        intersectCount++;
    }
}

console.log(`intersectCount: ${intersectCount}`);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
