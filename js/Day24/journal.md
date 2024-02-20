Part 1 - fun with line intersections.  My first run came out low, so I did some debugging.  Somewhere in putting some log messages in and making some adjustments to make the numbers readable I started getting a different number, which was correct.
https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection

Part 2 - first thought, balistic trajectory research time.  Let's start with aiming for whatever hailstone is at the lowest z at time 1.  Fortunately we already calculated that with our initial input, just need to sort the hailstones.  Then for each time cycle find the next lowest z, calculate the trajectory as manhattan distance, and see if that holds for the next hailstone with a forecast.  If the forecast fails, go back to the hailstones that was last fixed, and wait another time cycle.  This brute force works for the small case, but the scale of distances and movements of the hailstones make this seriously impractical at scale without some additional maths.