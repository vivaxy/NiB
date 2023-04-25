/**
 * @since 20180816 16:40
 * @author vivaxy
 */
const assert = require('./assert.js');

const _ = require('lodash');
assert(
  _.isEqual(_.chunk(['a', 'b', 'c', 'd'], 2), [
    ['a', 'b'],
    ['c', 'd'],
  ]),
  'Load node modules.'
);

const withoutExt = require('./without-ext');
assert(withoutExt === 1, 'Load local js files without extension.');

const Observable = require('core-js/features/observable/index.js');
assert(typeof Observable === 'function', 'Load node modules js files.');

const streamToObservable = require('@samverschueren/stream-to-observable');
assert(typeof streamToObservable === 'function', 'Load scoped node modules.');

const Observable2 = require('core-js/features/observable/index');
assert(
  typeof Observable2 === 'function',
  'Load node modules js files without extension.'
);

const json = require('./json');
assert(json === 1, 'Load local json files without extension.');

const coreJS = require('core-js/package');
assert(
  coreJS.name === 'core-js',
  'Load node modules json files without extension.'
);

const dirIndex = require('./dirname');
assert(dirIndex.a === 1, 'Load local dirname');

const packageJSONMainWithoutExt = require('xtend');
assert(
  typeof packageJSONMainWithoutExt === 'function',
  'Load node modules with package.json main field but without extension'
);

const packageJSONBrowserObject = require('any-observable');
assert(
  packageJSONBrowserObject,
  'Load node modules with package.json browser field'
);

const throttle = require('lodash.throttle');
assert(
  typeof throttle === 'function',
  'Load node modules without package.json fields'
);
