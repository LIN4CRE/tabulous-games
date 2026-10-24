# Browser game discovery report

No live scan has run yet in this checkout.

* Run `node scripts/discover-games.mjs` locally, or
* trigger **Actions → Discover new browser games → Run workflow**.

The scan crawls [PortedGames](https://portedgames.com/) and the public
[Spawn](https://www.spawn.co/) feed, filters out games already in
`games.json`, verifies that every new link responds, and re-checks the
existing catalogue for dead or hijacked domains. Results land here and in
`data/discoveries.json`; the workflow opens a GitHub issue when there is
something to review.
