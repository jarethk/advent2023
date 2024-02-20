/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { getAdjacent } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let initGrid = [];

let startCoords = [0, -1];

for await (const line of file.readLines()) {
    initGrid.push(line.split(""));
    if (line.includes("S")) startCoords[1] = line.indexOf("S");
    else if (startCoords[1] != -1) startCoords[0]++;
}

//let initGrid = grid.map(row => [...row.map(c => c == "S" ? "." : c)]);

function calculatePlotCounts(initGrid, startCoords) {
    let plotCounts = [];
    let oldGrid = initGrid.map(row => [...row]);
    oldGrid[startCoords[0]][startCoords[1]] = "O";
    for (let s = 0; s < initGrid.length * 3; s++) {
        let plots = 0;
        let grid = initGrid.map(row => [...row]);
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (oldGrid[y][x] == "O") {
                    let adjacent = getAdjacent([y, x], grid)
                        .filter(p => grid[p[0]][p[1]] == "." || grid[p[0]][p[1]] == "S");
                    //console.log(`++Adding adjacent ${JSON.stringify(adjacent)}`)
                    plots += adjacent.length;
                    adjacent.forEach(p => grid[p[0]][p[1]] = "O");
                    grid[y][x] = ".";
                }
            }
        }
        oldGrid = grid;
        plotCounts.push(plots);
    }
    //console.log(`Grid for ${startCoords}:\n\t${oldGrid.map(row => row.join("")).join("\n\t")}`);
    //console.log(`-- last plotCount ${plotCounts[plotCounts.length - 1]}`);
    //console.log(`-- ${oldGrid.map(row => row.filter(c => c === "O").length).reduce((ac, cv) => ac + cv)}`);
    return plotCounts;
}

let centerCounts = calculatePlotCounts(initGrid, startCoords);
let ulCounts = calculatePlotCounts(initGrid, [initGrid.length - 1, initGrid.length - 1]);
let uCounts = calculatePlotCounts(initGrid, [initGrid.length - 1, startCoords[1]]);
let urCounts = calculatePlotCounts(initGrid, [initGrid.length - 1, 0]);
let lCounts = calculatePlotCounts(initGrid, [startCoords[0], initGrid.length - 1]);
let rCounts = calculatePlotCounts(initGrid, [startCoords[0], 0]);
let dlCounts = calculatePlotCounts(initGrid, [0, initGrid.length - 1]);
let dCounts = calculatePlotCounts(initGrid, [0, startCoords[1]]);
let drCounts = calculatePlotCounts(initGrid, [0, 0]);

// cycle 0
// on step 64 = centerCounts[64]
// cycle 1
// on step 64+131 = centerCounts[64+131] + uCounts[131] + dCounts[131] + lCounts[131] + rCounts[131];
// plus at 64+65 we touch on the corners
// cycle 2
// on step 64+131*2 = centerCounts[64+131*2] + uCounts[131] + uCounts[131*2] + dCounts[131] + dCounts[131*2] + lCounts[131] + lCounts[131*2] + rCounts[131] + rCounts[131*2]
// + ulCounts[131] + urCounts[131] + dlCounts[131] + drCounts[131]
// cycles is even, so the final computation will be based on cycle2
// extrapolated out to 202300/2 times for c, u, d, l, r
// and extrapolated to ... what for ul, ur, ...?
//const CHECKPOINTS_C = [64, (64 + 131) - 1, (64 + (131 * 2)) - 1, (64 + (131 * 3)) - 1];
//const CHECKPOINTS_C = [64 - 1, (64 - 1 + 131) - 1, (64 - 1 + (131 * 2)) - 1, (64 - 1 + (131 * 3)) - 1];
//const CHECKPOINTS = [131, (131 * 2) - 1, (131 * 3) - 1, (131 * 4) - 1];
//const CHECKPOINTS = [131 - 1, (131 * 2) - 1, (131 * 3) - 1, (131 * 4) - 1];
const HALF_WAY = Math.floor(initGrid.length / 2);
const CHECKPOINTS_C = [0, 1, 2, 3, 4].map(v => HALF_WAY + (initGrid.length * v) - 1);
//const CHECKPOINTS = CHECKPOINTS_C;
const CHECKPOINTS = [1, 2, 3, 4].map(v => (initGrid.length * v) - 1);

const MAX_STEPS = 26501365;
//const MAX_STEPS = 45;
let cycles = (MAX_STEPS - (startCoords[1])) / (initGrid.length);
console.log(`++Cycles to run (${MAX_STEPS} | ${MAX_STEPS - (startCoords[1])} / ${initGrid.length}): ${cycles}`);

function spanCorners(cycles) {
    let spans = [cycles, 0, 0];
    for (let f = cycles - 1; f > 0; f -= 2) { spans[1] += f; }
    for (let f = cycles - 2; f > 0; f -= 2) { spans[2] += f; }
    return spans;
}

console.log('Checkpoints: ' + CHECKPOINTS_C.map(cx => centerCounts[cx]));
console.log('Checkpoints: ' + CHECKPOINTS.map(cx => lCounts[cx]));

function printForCycles(cycles) {
    console.log(`-------*** Plotting for cycles ${cycles}`);
    let sc = spanCorners(cycles);
    console.log(sc);

    let totalPlots = centerCounts[CHECKPOINTS_C[2]];
    console.log(`centerCounts: ${totalPlots}`);
    let edgeCounts = lCounts[CHECKPOINTS[0]] + dCounts[CHECKPOINTS[0]] + rCounts[CHECKPOINTS[0]] + uCounts[CHECKPOINTS[0]];
    console.log(`edgeCounts: ${edgeCounts}: ` + lCounts[CHECKPOINTS[0]] + "+" + dCounts[CHECKPOINTS[0]] + "+" + rCounts[CHECKPOINTS[0]] + "+" + uCounts[CHECKPOINTS[0]]);

    let oddCounts = lCounts[CHECKPOINTS[1]] + dCounts[CHECKPOINTS[1]] + rCounts[CHECKPOINTS[1]] + uCounts[CHECKPOINTS[1]];
    console.log(`oddCounts: ${oddCounts} times ${Math.floor((cycles - 1) / 2)}  = ${(oddCounts * Math.floor((cycles - 1) / 2))}`);
    console.log(lCounts[CHECKPOINTS[1]] + "+" + dCounts[CHECKPOINTS[1]] + "+" + rCounts[CHECKPOINTS[1]] + "+" + uCounts[CHECKPOINTS[1]]);

    let evenCounts = lCounts[CHECKPOINTS[2]] + dCounts[CHECKPOINTS[2]] + rCounts[CHECKPOINTS[2]] + uCounts[CHECKPOINTS[2]];
    console.log(`evenCounts: ${evenCounts} times ${Math.ceil((cycles - 1) / 2)} = ${(evenCounts * Math.ceil((cycles - 1) / 2))}`);
    console.log(lCounts[CHECKPOINTS[2]] + "+" + dCounts[CHECKPOINTS[2]] + "+" + rCounts[CHECKPOINTS[2]] + "+" + uCounts[CHECKPOINTS[2]]);

    totalPlots += edgeCounts + (evenCounts * Math.ceil((cycles - 1) / 2)) + (oddCounts * Math.floor((cycles - 1) / 2));

    let edgeCorners = ulCounts[CHECKPOINTS_C[0]] + urCounts[CHECKPOINTS_C[0]] + dlCounts[CHECKPOINTS_C[0]] + drCounts[CHECKPOINTS_C[0]];
    console.log(`edgeCorners: ${edgeCorners} times ${sc[0]}: ` + ulCounts[CHECKPOINTS_C[0]] + "+" + urCounts[CHECKPOINTS_C[0]] + "+" + dlCounts[CHECKPOINTS_C[0]] + "+" + drCounts[CHECKPOINTS_C[0]]);

    let oddCorners = ulCounts[CHECKPOINTS_C[1]] + urCounts[CHECKPOINTS_C[1]] + dlCounts[CHECKPOINTS_C[1]] + drCounts[CHECKPOINTS_C[1]];
    console.log(`oddCorners: ${oddCorners} times ${sc[1]}  = ${oddCorners * sc[1]}`);

    let evenCorners = ulCounts[CHECKPOINTS_C[2]] + urCounts[CHECKPOINTS_C[2]] + dlCounts[CHECKPOINTS_C[2]] + drCounts[CHECKPOINTS_C[2]];
    console.log(`evenCorners: ${evenCorners} times ${sc[2]}  = ${evenCorners * sc[2]}`);

    totalPlots += (edgeCorners * sc[0]) + (oddCorners * sc[1]) + (evenCorners * sc[2]);

    console.log(totalPlots);
    console.log(`target: ${637087163925555}`);
    console.log(`diff: ${totalPlots - 637087163925555}`);
}


function printForCycles2(cycles) {
    console.log(`-------*** Plotting for cycles ${cycles}`);
    let sc = spanCorners(cycles);
    console.log(sc);

    let totalPlots = centerCounts[CHECKPOINTS_C[2]];
    console.log(`centerCounts: ${totalPlots}`);
    let edgeCounts = lCounts[CHECKPOINTS[0]] + dCounts[CHECKPOINTS[0]] + rCounts[CHECKPOINTS[0]] + uCounts[CHECKPOINTS[0]];
    console.log(`edgeCounts: ${edgeCounts}: ` + lCounts[CHECKPOINTS[0]] + "+" + dCounts[CHECKPOINTS[0]] + "+" + rCounts[CHECKPOINTS[0]] + "+" + uCounts[CHECKPOINTS[0]]);

    let evenCounts = lCounts[CHECKPOINTS[1]] + dCounts[CHECKPOINTS[1]] + rCounts[CHECKPOINTS[1]] + uCounts[CHECKPOINTS[1]];
    console.log(`evenCounts: ${evenCounts} times ${Math.floor((cycles - 1) / 2)}  = ${(evenCounts * Math.floor((cycles - 1) / 2))}`);
    console.log(lCounts[CHECKPOINTS[1]] + "+" + dCounts[CHECKPOINTS[1]] + "+" + rCounts[CHECKPOINTS[1]] + "+" + uCounts[CHECKPOINTS[1]]);

    let oddCounts = lCounts[CHECKPOINTS[2]] + dCounts[CHECKPOINTS[2]] + rCounts[CHECKPOINTS[2]] + uCounts[CHECKPOINTS[2]];
    console.log(`oddCounts: ${oddCounts} times ${Math.ceil((cycles - 1) / 2)} = ${(oddCounts * Math.ceil((cycles - 1) / 2))}`);
    console.log(lCounts[CHECKPOINTS[2]] + "+" + dCounts[CHECKPOINTS[2]] + "+" + rCounts[CHECKPOINTS[2]] + "+" + uCounts[CHECKPOINTS[2]]);

    totalPlots += edgeCounts + (oddCounts * Math.ceil((cycles - 1) / 2)) + (evenCounts * Math.floor((cycles - 1) / 2));

    let edgeCorners = ulCounts[CHECKPOINTS[0]] + urCounts[CHECKPOINTS[0]] + dlCounts[CHECKPOINTS[0]] + drCounts[CHECKPOINTS[0]];
    console.log(`edgeCorners: ${edgeCorners} times ${sc[0]}: ` + ulCounts[CHECKPOINTS[0]] + "+" + urCounts[CHECKPOINTS[0]] + "+" + dlCounts[CHECKPOINTS[0]] + "+" + drCounts[CHECKPOINTS[0]]);

    let evenCorners = ulCounts[CHECKPOINTS[1]] + urCounts[CHECKPOINTS[1]] + dlCounts[CHECKPOINTS[1]] + drCounts[CHECKPOINTS[1]];
    console.log(`evenCorners: ${evenCorners} times ${sc[1]}  = ${evenCorners * sc[1]}`);

    let oddCorners = ulCounts[CHECKPOINTS[2]] + urCounts[CHECKPOINTS[2]] + dlCounts[CHECKPOINTS[2]] + drCounts[CHECKPOINTS[2]];
    console.log(`oddCorners: ${oddCorners} times ${sc[2]}  = ${oddCorners * sc[2]}`);

    totalPlots += (edgeCorners * sc[0]) + (evenCorners * sc[1]) + (oddCorners * sc[2]);

    console.log(totalPlots);
    console.log(`target: ${637087163925555}`);
    console.log(`diff: ${totalPlots - 637087163925555}`);
}

//printForCycles(1);
//printForCycles(2);
//printForCycles(3);
printForCycles(cycles);
printForCycles2(cycles);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
