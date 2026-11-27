# Rolling back: shopping-list prices

The supermarket before prices were added is kept exactly, at these commits:

| What | Branch | Commit |
|---|---|---|
| Code (app + functions) | `main` | `4a69d38562eab7d177736ea2997124fa6f7e37f2` (PR #246) |
| Live site | `gh-pages` | `6a3ae400074c613213cee914757ef0fea307d4d1` (PR #247) |

## 1. Instant: turn the switch off (no deploy)

Prices only appear when the **💰 מחירים ברשימת הקניות** feature switch is on (admin → feature
switches; it starts off). Turning it off hides everything prices added, for every family, within
seconds: the supermarket renders exactly as before. Each family can also turn prices off for
itself from the ⚙️ on the price card.

## 2. Full: put the old code back

Revert the prices PR on `main` (GitHub's "Revert" button on the merged PR), then ship `main` to
`gh-pages` as usual. Or restore the exact files from the commit above:

```
git checkout 4a69d38 -- app.js index.html styles.css functions/
```

## The data is safe either way

Prices only add fields; nothing existing is changed or removed:

- pool items: `barcode`, `productName`, `barcodeSkip`, `lastPrice`, `unitGrams`
- shopping history entries: `price` on bought items
- family document: `groceryPrices` (`on`, `store`, `storeLabel`, `chainName`, `chain`, `dismissed`)

The old version ignores these fields and keeps them when it saves, so going back and forth loses
nothing: an item's own name, category, quantity and history are untouched.
