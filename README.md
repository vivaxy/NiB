# NiB

Run Node.js modules in browser environment.

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Standard Version][standard-version-image]][standard-version-url]

# Install

`yarn add @vivaxy/nib` or `npm i @vivaxy/nib`

# Usage

```html
<html>
<body>
<script src="./node_modules/@vivaxy/nib/index.js"></script>
<script>
window.node.init({ nodeBuiltInBase: './node_modules/@vivaxy/nib', base: '.' });
window.node.require('./index.js');
</script>
</body>
</html>
```

In your `./index.js` you can now use `require` and `module.exports`!

[npm-version-image]: https://img.shields.io/npm/v/@vivaxy/nib.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@vivaxy/nib
[npm-downloads-image]: https://img.shields.io/npm/dt/@vivaxy/nib.svg?style=flat-square
[license-image]: https://img.shields.io/npm/l/@vivaxy/nib.svg?style=flat-square
[license-url]: LICENSE
[standard-version-image]: https://img.shields.io/badge/release-standard%20version-brightgreen.svg?style=flat-square
[standard-version-url]: https://github.com/conventional-changelog/standard-version
