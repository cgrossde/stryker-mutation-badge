# Stryker Mutation Badge Reporter

Creates a badge in `reports/mutation/badge/` which show the resulting score and adapts it's color to it.
![Badge Example](badge-example-red.svg?raw=true) ![Badge Example](badge-example-green.svg?raw=true)

## How to use

**1. Install as a dependency:** `npm i -D stryker-mutation-badge`

**2. Add reporter in your config:**

```
{
  ...
  "reporters": [
    ...,
    "badge-reporter"
  ],
  "plugins": ["@stryker-mutator/*", "stryker-mutation-badge"],
  ...
}
```
