# npm-install-security-check

Warn users when they are running npm install with scripts enabled.

[![NPM][npm-img]][npm-url]

# Installation

```bash
npm install --save npm-install-security-check
```

# Usage

By adding this package to your projects dependencies whenever a consumer
installs your project via `npm install` they will get a big warning in the
console if they don't have scripts turned off on npm install.

[npm-img]: https://img.shields.io/npm/v/npm-install-security-check.svg "NPM Version"
[npm-url]: https://www.npmjs.com/package/npm-install-security-check

## Silence warning

If you want to silence the warning that this package prints to the console
simply add the following file to the directory in which you run `npm install`
from or any of it's parent directories.

*npm-install-security-check.json *

```json
{
  "silent": true
}
```
