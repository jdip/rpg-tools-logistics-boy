import './style.css'

// only required for dev
// in prod, foundry loads index.js, which is compiled by vite/rollup
// in dev, foundry loads index.js, this file, which loads lancer.ts

import './logistics-boy.ts';

if (import.meta.hot)
    import.meta.hot.accept(() => import.meta.hot?.invalidate())