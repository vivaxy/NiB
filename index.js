/**
 * @since 20180816 16:36
 * @author vivaxy
 */

(function() {
  window.node = { init, require, global: {} };

  window.node.global.process = {};

  require.base = '.';
  require.cache = {};
  const builtInModules = ['fs', 'path'];

  function init({ base }) {
    require.base = base;
    builtInModules.forEach(loadBuiltInModules);
  }

  function loadBuiltInModules(moduleName) {
    const fileContent = loadFileSync('../node-built-in/' + moduleName + '.js');
    const moduleFn = new Function(
      'exports',
      'require',
      'module',
      'loadFileSync',
      fileContent
    );
    if (require.cache[moduleName]) {
      throw new Error('loadBuiltInModules again');
    }
    require.cache[moduleName] = { exports: {} };

    moduleFn(
      require.cache[moduleName].exports,
      require,
      require.cache[moduleName],
      loadFileSync
    );
  }

  function require(filename, fromDirName = require.base) {
    if (builtInModules.includes(filename)) {
      return require.cache[filename].exports;
    }

    const path = require.cache.path.exports;
    const fs = require.cache.fs.exports;
    let actualFilename = filename;

    if (filename.startsWith('.')) {
      // relative path
      actualFilename = path.join(fromDirName, filename);
    } else {
      // require from 'node_modules'
      actualFilename = path.join(require.base, 'node_modules', filename);
      if (
        path.extname(actualFilename) !== '.js' &&
        fs.fileExistsSync(actualFilename + '/package.json')
      ) {
        const jsonFilename = actualFilename + '/package.json';
        const jsonContent = fs.readFileSync(jsonFilename);
        const json = handleJSONFile(jsonFilename, jsonContent);
        // browser > main > files[0]
        let entry = json.browser || json.main || (json.files && json.files[0]);
        actualFilename = path.join(actualFilename, entry);
      }
    }

    // self > .js > /index.js > .json
    if (
      path.extname(actualFilename) === '.js' ||
      path.extname(actualFilename) === '.json'
    ) {
      // ok
    } else if (fs.fileExistsSync(actualFilename + '.js')) {
      actualFilename = actualFilename + '.js';
    } else if (fs.fileExistsSync(actualFilename + '.json')) {
      actualFilename = actualFilename + '.json';
    } else if (fs.fileExistsSync(actualFilename + '/index.js')) {
      actualFilename = actualFilename + '/index.js';
    } else {
      throw new Error(
        'Resolve file error: ' + filename + ' as ' + actualFilename
      );
    }

    if (require.cache[actualFilename]) {
      return require.cache[actualFilename].exports;
    }

    const fileContent = fs.readFileSync(actualFilename);
    const extname = path.extname(actualFilename);
    if (extname === '.js') {
      return handleJSFile(actualFilename, fileContent);
    } else if (extname === '.json') {
      return handleJSONFile(actualFilename, fileContent);
    }
  }

  function handleJSFile(filename, fileContent) {
    const moduleFn = new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      'global',
      'process',
      fileContent
    );

    if (require.cache[filename]) {
      throw new Error('Load file again');
    }
    require.cache[filename] = { exports: {} };

    const path = require.cache.path.exports;

    function moduleRequire(requireFilename) {
      return require(requireFilename, path.dirname(filename));
    }

    moduleRequire.cache = require.cache;

    moduleFn(
      require.cache[filename].exports,
      moduleRequire,
      require.cache[filename],
      filename,
      path.dirname(filename),
      window.node.global,
      window.node.global.process
    );
    return require.cache[filename].exports;
  }

  function handleJSONFile(filePath, fileContent) {
    const json = JSON.parse(fileContent);
    require.cache[filePath] = { exports: json };
    return json;
  }

  function loadFileSync(filename) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filename, false);
    xhr.setRequestHeader('Content-Type', 'application/text');
    xhr.setRequestHeader('Accept', 'text/plain');
    xhr.send();
    if (xhr.readyState === 4 && xhr.status === 200) {
      return xhr.responseText;
    }
    throw new Error(xhr.statusText);
  }
})();
