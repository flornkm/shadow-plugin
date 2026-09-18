## [2.1.1](https://github.com/flornkm/shadow-plugin/compare/v2.1.0...v2.1.1) (2026-09-18)

### Bug Fixes

* **demo:** centre the playground row labels on their controls ([#8](https://github.com/flornkm/shadow-plugin/issues/8)) ([a935101](https://github.com/flornkm/shadow-plugin/commit/a9351014b8ef3387c7669880feaea90bc518d515))

## [2.1.0](https://github.com/flornkm/shadow-plugin/compare/v2.0.0...v2.1.0) (2026-08-04)

### Features

* follow the project's Tailwind ring width for the hairline ([6984841](https://github.com/flornkm/shadow-plugin/commit/69848410cc6d663f12b89cee6e8902df3266a72d))

## [2.0.0](https://github.com/flornkm/shadow-plugin/compare/v1.2.7...v2.0.0) (2026-08-03)

### ⚠ BREAKING CHANGES

* smooth-shadow-* utilities no longer emit !important.
A smooth shadow that previously won against unlayered CSS (component
library styles, plain stylesheets) may now lose to it. Add the
important modifier on those elements — class="smooth-shadow-md!" — to
restore the old behavior where it is actually needed.

### Features

* drop !important and add unprefixed entrypoint ([#4](https://github.com/flornkm/shadow-plugin/issues/4)) ([4fe0d6b](https://github.com/flornkm/shadow-plugin/commit/4fe0d6b909c15dda2c61b6a50253a446c0004765))

## [1.2.7](https://github.com/flornkm/shadow-plugin/compare/v1.2.6...v1.2.7) (2026-08-02)

### Bug Fixes

* resolve dark ring from the page's color-scheme, not the visitor's OS preference ([bf2e590](https://github.com/flornkm/shadow-plugin/commit/bf2e590d6ed3a7acbad44047a7d3a4ba83539517))

## [1.2.6](https://github.com/flornkm/shadow-plugin/compare/v1.2.5...v1.2.6) (2026-07-31)

### Bug Fixes

* publish built dist file instead of src ([f6eeb94](https://github.com/flornkm/shadow-plugin/commit/f6eeb94d90cc28c3ee89844f29015b3c453f8858))

## [1.2.5](https://github.com/flornkm/shadow-plugin/compare/v1.2.4...v1.2.5) (2026-07-31)

### Bug Fixes

* leading ([7d69136](https://github.com/flornkm/shadow-plugin/commit/7d69136e791c04dd9ce6bdd20e3af50e670ea790))

## [1.2.4](https://github.com/flornkm/shadow-plugin/compare/v1.2.3...v1.2.4) (2026-07-30)

### Bug Fixes

* ease the dark ring alpha back to 0.18 ([609d076](https://github.com/flornkm/shadow-plugin/commit/609d0761d04960723925fefb2de86a37dffdd9f1))

## [1.2.3](https://github.com/flornkm/shadow-plugin/compare/v1.2.2...v1.2.3) (2026-07-30)

### Bug Fixes

* readable dark ring and a 2xl that belongs on the ramp ([0e03ead](https://github.com/flornkm/shadow-plugin/commit/0e03ead16b7af6e21cf9819cc166d9e092e12d8f))

## [1.2.2](https://github.com/flornkm/shadow-plugin/compare/v1.2.1...v1.2.2) (2026-07-29)

### Bug Fixes

* white hairline ring in dark mode by default (media query, .dark, data-theme) ([77c5ec2](https://github.com/flornkm/shadow-plugin/commit/77c5ec2562ed82c91e79aa6d015ab824d5c9641a))

## [1.2.1](https://github.com/flornkm/shadow-plugin/compare/v1.2.0...v1.2.1) (2026-07-14)

### Bug Fixes

* switch around ring default setting ([593ad83](https://github.com/flornkm/shadow-plugin/commit/593ad83f5ca5f6c17142e6663bf6a193cd20a5e6))

## [1.2.0](https://github.com/flornkm/shadow-plugin/compare/v1.1.3...v1.2.0) (2026-07-14)

### Features

* add rings to shadow plugin ([3e4cdbf](https://github.com/flornkm/shadow-plugin/commit/3e4cdbf301e526f8ed159bde3d44404ea9daaac6))

## [1.1.3](https://github.com/flornkm/shadow-plugin/compare/v1.1.2...v1.1.3) (2026-04-13)

### Bug Fixes

- font weight + padding ([cbb2ba1](https://github.com/flornkm/shadow-plugin/commit/cbb2ba1d06f7a3723a87805e50d71b3671e5c53a))

## [1.1.2](https://github.com/flornkm/shadow-plugin/compare/v1.1.1...v1.1.2) (2026-04-13)

### Bug Fixes

- simplify example ([64f5f15](https://github.com/flornkm/shadow-plugin/commit/64f5f15f75b64ba5849d9c99d5a5ed8475ab5d33))

## [1.1.1](https://github.com/flornkm/shadow-plugin/compare/v1.1.0...v1.1.1) (2026-04-11)

### Bug Fixes

- custom export ([3386d0e](https://github.com/flornkm/shadow-plugin/commit/3386d0ea0a141b91c5bed62fc9e4504786b6153e))
- pin tailwind version ([048e8c2](https://github.com/flornkm/shadow-plugin/commit/048e8c20e4d997f5cf2874d6b042f7952aae2edb))

## [1.1.0](https://github.com/flornkm/shadow-plugin/compare/v1.0.0...v1.1.0) (2026-04-11)

### Features

- SEO + readme ([3b6c262](https://github.com/flornkm/shadow-plugin/commit/3b6c262af791991788fea145c03df29947928d61))

## 1.0.0 (2026-04-11)

### Features

- implement new website ([47c6f88](https://github.com/flornkm/shadow-plugin/commit/47c6f88782558bbfa94612caf6e00b317839f33e))
- implement smooth shadows ([1032f06](https://github.com/flornkm/shadow-plugin/commit/1032f06cfa3f14278060ea942763162a4ce4110b))
- package.json ([665b371](https://github.com/flornkm/shadow-plugin/commit/665b37138b8cce77e80e9bea56932bb690c5a05a))

### Bug Fixes

- color ([82dac21](https://github.com/flornkm/shadow-plugin/commit/82dac2195fad1dccfd948d0365f7066905ddc920))
- preselect Default size in demo app ([6d68ec5](https://github.com/flornkm/shadow-plugin/commit/6d68ec5125e5e3285133e1d1e7dc44bf6631e60d))
