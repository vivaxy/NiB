/**
 * @since 20180816 16:36
 * @author vivaxy
 */
(function () {
  window.node = { init, require, global: {} };

  window.node.global.process = {};

  require.base = '.';
  require.nodeBuiltInBase = 'https://unpkg.com/@vivaxy/nib';
  require.nodeModulesBase = 'https://unpkg.com';
  require.cache = {};
  const builtInModules = ['fs', 'path', 'url', 'util'];

  function init({
    base = require.base,
    nodeBuiltInBase = require.nodeBuiltInBase,
    nodeModulesBase = require.nodeModulesBase,
  } = {}) {
    require.base = base;
    require.nodeBuiltInBase = nodeBuiltInBase;
    require.nodeModulesBase = nodeModulesBase;
    builtInModules.forEach(loadBuiltInModules);
  }

  function loadBuiltInModules(moduleName) {
    const fileContent = loadFileSync(
      require.nodeBuiltInBase + '/node-built-in/' + moduleName + '.js'
    );
    const moduleFunction = new Function(
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

    moduleFunction(
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
      actualFilename = joinURI(fromDirName, filename);
    } else {
      // require from 'node_modules'
      actualFilename = joinURI(require.nodeModulesBase, filename);
      if (
        path.extname(actualFilename) !== '.js' &&
        fs.fileExistsSync(actualFilename + '/package.json')
      ) {
        const jsonFilename = actualFilename + '/package.json';
        const jsonContent = fs.readFileSync(jsonFilename);
        const json = handleJSONFile(jsonFilename, jsonContent);
        /**
         * browser > main > files[0]
         * @see https://github.com/defunctzombie/package-browser-field-spec
         */
        const entry =
          (typeof json.browser === 'string' && json.browser) ||
          json.main ||
          (json.files && json.files[0]) ||
          // supports lodash.throttle
          'index.js';
        actualFilename = joinURI(actualFilename, entry);
      }
    }

    // self > .js > /index.js > .json
    actualFilename = tryAppendExtension(actualFilename);

    if (require.cache[actualFilename]) {
      return require.cache[actualFilename].exports;
    }

    /**
     * implement package.json browser field
     * @see https://github.com/defunctzombie/package-browser-field-spec
     */
    const requireNodeModuleFromNodeModules =
      !filename.startsWith('.') && fromDirName.includes('/node_modules/');
    if (
      actualFilename.includes('/node_modules/') ||
      requireNodeModuleFromNodeModules
    ) {
      let searchPackagePath = null;
      if (requireNodeModuleFromNodeModules) {
        searchPackagePath = fromDirName;
      } else {
        searchPackagePath = actualFilename;
      }
      const filenameSplitted = searchPackagePath.split('/');
      const nodeModulesIndex = filenameSplitted.indexOf('node_modules');
      let index = nodeModulesIndex + 1;
      let packageName = filenameSplitted[index];
      if (packageName.startsWith('@')) {
        index++;
        packageName += '/' + filenameSplitted[index];
      }
      const relativeFilePath =
        './' + filenameSplitted.slice(index + 1).join('/');
      const packageRootPath = filenameSplitted.slice(0, index + 1).join('/');
      const jsonFilename = packageRootPath + '/package.json';
      const jsonContent = fs.readFileSync(jsonFilename);
      const json = handleJSONFile(jsonFilename, jsonContent);
      if (typeof json.browser === 'object') {
        const relativeFilePathExt = path.extname(relativeFilePath);
        const relativeFilePathWithoutExt = relativeFilePath.slice(
          0,
          -relativeFilePathExt.length
        );
        if (
          typeof json.browser[relativeFilePath] === 'string' ||
          typeof json.browser[relativeFilePathWithoutExt] === 'string'
        ) {
          /**
           * "browser": {
           *   "./test": "./test-shim"
           * }
           */
          actualFilename = joinURI(
            packageRootPath,
            json.browser[relativeFilePath]
          );
          actualFilename = tryAppendExtension(actualFilename);
          // continue
        } else if (
          requireNodeModuleFromNodeModules &&
          json.browser[filename] === false
        ) {
          /**
           * "browser": {
           *   "fs": false
           * }
           */
          return {}; // do not cache, maybe conflict
        } else if (
          json.browser[relativeFilePath] === false ||
          json.browser[relativeFilePathWithoutExt] === false
        ) {
          /**
           * "browser": {
           *   "./test": false
           * }
           */
          return handleJSONFile(actualFilename, '{}');
        }
      }
    }

    const fileContent = fs.readFileSync(actualFilename);
    const extname = path.extname(actualFilename);
    if (extname === '.js') {
      return handleJSFile(actualFilename, fileContent);
    } else if (extname === '.json') {
      return handleJSONFile(actualFilename, fileContent);
    }

    function tryAppendExtension(filePath) {
      const filePathExtName = path.extname(filePath);
      // self > .js > /index.js > .json
      if (
        filePathExtName === '.js' ||
        filePathExtName === '.json' ||
        filePathExtName === '.cjs'
      ) {
        // ok
        return filePath;
      }
      if (fs.fileExistsSync(filePath + '.js')) {
        return filePath + '.js';
      }
      if (fs.fileExistsSync(filePath + '.json')) {
        return filePath + '.json';
      }
      if (fs.fileExistsSync(filePath + '/index.js')) {
        return filePath + '/index.js';
      }
      throw new Error('Resolve file error: ' + filePath);
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
      fileContent + '\n//# sourceURL=NiB:///' + filename
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
    } else if (xhr.readyState === 4 && xhr.status !== 200) {
      // debugger;
    }
    throw new Error(xhr.statusText);
  }

  function joinURI(base, ...args) {
    const path = require.cache.path.exports;
    if (
      base.startsWith('http://') ||
      base.startsWith('https://') ||
      base.startsWith('//')
    ) {
      const url = new URL(base, location.href);
      return url.origin + path.join(url.pathname, ...args);
    } else {
      return path.join(base, ...args);
    }
  }
})();
