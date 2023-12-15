Part 1 - oh-kay... Path finding.  Not too difficult.  Except we need to make sure that each of our adjacent coordinates not only can we go to, but have to also make sure we can go from our current position.  Adds a little wrinkle.  So from our current spot, use our geometry library to get the adjSet, shiftPoint to get that new coord, get that value, and check if the relative direction (from adjSet) is something we can arrive at from our current position.  Add valid next directions into a processing queue, starting from the coords of 'S', and do a breadth-first search to ensure the furthest point is met by multiple directions at the same time.