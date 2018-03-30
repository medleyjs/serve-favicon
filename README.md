# @medley/serve-favicon

[![npm Version](https://img.shields.io/npm/v/@medley/serve-favicon.svg)](https://www.npmjs.com/package/@medley/serve-favicon)
[![Build Status](https://travis-ci.org/medleyjs/serve-favicon.svg?branch=master)](https://travis-ci.org/medleyjs/serve-favicon)
[![Coverage Status](https://coveralls.io/repos/github/medleyjs/serve-favicon/badge.svg?branch=master)](https://coveralls.io/github/medleyjs/serve-favicon?branch=master)
[![dependencies Status](https://img.shields.io/david/medleyjs/serve-favicon.svg)](https://david-dm.org/medleyjs/serve-favicon)

[Medley](https://www.npmjs.com/package/@medley/medley) plugin for serving the default favicon.


## Installation

```sh
# npm
npm install @medley/serve-favicon --save

# yarn
yarn add @medley/serve-favicon
```


## Usage

```js
const medley = require('@medley/medley');
const path = require('path');

const app = medley();

app.registerPlugin(require('@medley/serve-favicon'), {
  favicon: path.join(__dirname, 'public', 'favicon.ico')
});
```

### Plugin Options

#### `favicon` (required)

Type: *string | Buffer*

Either a path string pointing to the favicon file, or a Buffer containing the favicon file.

```js
// Using a Buffer
app.registerPlugin(require('@medley/serve-favicon'), {
  favicon: fs.readFileSync('./public/favicon.ico')
});
```

#### `maxAge`

Type: *number*
Default: `31536000` (1 year)

A number **in seconds** indicating how long browsers should cache the favicon.

```js
app.registerPlugin(require('@medley/serve-favicon'), {
  favicon: path.join(__dirname, 'public', 'favicon.ico'),
  maxAge: 60 * 60 * 24 * 7 // 1 week
});
```
