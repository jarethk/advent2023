/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let bricks = [];

for await (const line of file.readLines()) {
    let parts = line.split("~").map(p => p.split(",").map(c => Number.parseInt(c)));
    // remap bricks into a tree-like structure of x:y0..y1
    let brick = {
        id: bricks.length,
        xy: new Array(parts[1][0] + 1),
        z: [],
        above: [],
        below: [],
        o: parts
    };
    for (let x = parts[0][0]; x <= parts[1][0]; x++) {
        if (!brick.xy[x]) brick.xy[x] = [];
        for (let y = parts[0][1]; y <= parts[1][1]; y++) brick.xy[x].push(y);
    }
    for (let z = parts[0][2]; z <= parts[1][2]; z++) brick.z.push(z);
    bricks.push(brick);
}

function bricksOverlap(brick, brick2) {
    let blocked = 0;
    dl(`Checking for overlap:\n\t${JSON.stringify(brick)}\n\t${JSON.stringify(brick2)}`)
    brick.xy.some((xy, idx) => {
        if (brick2.xy[idx]) {
            blocked = brick.xy[idx].filter(ys => brick2.xy[idx].includes(ys)).length;
        }
        return (blocked > 0);
    });
    dl(`== overlap: ${blocked}`)
    return (blocked > 0);
}

// sort on first aspect of z dimension, so when checking in the next phase we only have to deal with ones before
bricks.sort((a, b) => a.z[0] - b.z[0])
dl(JSON.stringify(bricks));

// settle the bricks
let changed = true;
let changes = 0;
while (changed) {
    changed = false;
    console.log(`Settling bricks`);
    for (let b = 0; b < bricks.length; b++) {
        dl(`Checking to settle ${b}`);
        let zFloor = 0;
        for (let b2 = b - 1; b2 >= 0; b2--) {
            let b2z = bricks[b2].z[bricks[b2].z.length - 1];
            if (bricksOverlap(bricks[b2], bricks[b]) && zFloor < b2z) {
                zFloor = b2z;
                dl(`== new zfloor ${zFloor}`);
            }
        }
        let zdiff = bricks[b].z[0] - (zFloor + 1);
        dl(`== zdiff ${bricks[b].z[0]} - ${(zFloor + 1)}`)
        if (zdiff > 0) {
            changes++;
            bricks[b].z = bricks[b].z.map(z => z - zdiff);
        }
    }
}

console.log(`Changes: ${changes}`);

// find what bricks are blocking each other
for (let b = 0; b < bricks.length; b++) {
    let brick1 = bricks[b];
    for (let b2 = b + 1; b2 < bricks.length; b2++) {
        let brick2 = bricks[b2];
        if (bricksOverlap(brick1, bricks[b2]) && brick1.z[brick1.z.length - 1] + 1 == brick2.z[0]) {
            brick1.above.push(b2);
            brick2.below.push(b);
        }
    }
}

function canRemove(brick) {
    if (brick.above.length == 0) return true;
    if (brick.above.map(a => bricks[a].below.length).filter(b => b < 2).length == 0) return true;
}

function getCollapseCount(brick) {
    if (brick.above.length == 0) return 0;
    let collapseCount = 0;
    let collapseId = new Set();
    let toCollapse = [...brick.above];
    while (toCollapse.length > 0) {
        let cid = toCollapse.shift();
        if (collapseId.has(cid)) continue;
        let stillThere = bricks[cid].below.filter(b => !collapseId.has(b));
        if (bricks[cid].below.length == 1 || stillThere.length == 0) {
            collapseCount++;
            collapseId.add(cid);
            toCollapse.push(...bricks[cid].above);
        }
    }
    console.log(`Disintegrating brick ${brick.id} gives length ${collapseId.size}: ${collapseId}`);
    return collapseId.size;
}

console.log(`Bricks safe to remove: ${bricks.filter(brick => canRemove(brick)).length}`);
dl(`Bricks safe to remove: ${bricks.filter(brick => canRemove(brick)).map(b => b.id)}`);

let disintegration = bricks.filter(brick => !canRemove(brick)).map(b => getCollapseCount(b));
dl(JSON.stringify(disintegration));
console.log(`Bricks disintegration: ${disintegration.reduce((a, b) => a + b)}`);


const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
