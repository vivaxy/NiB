/**
 * @since 20180816 16:36
 * @author vivaxy
 */

(function() {
  window.node = { init, require, global: {} };

  window.node.global.process = {};

  require.base = '.';
  require.cache = {};
  const builtInModules = ['path'];

  function init({ base }) {
    require.base = base;
    builtInModules.forEach(loadBuiltInModules);
  }

  function loadBuiltInModules(moduleName) {
    const fileContent = syncLoadFile(
      require.base + '/node-built-in/' + moduleName + '.js'
    );
    const moduleFn = new Function('exports', 'require', 'module', fileContent);
    require.cache[moduleName] = { exports: {} };

    moduleFn(
      require.cache[moduleName].exports,
      require,
      require.cache[moduleName]
    );
  }

  function require(filename) {
    if (builtInModules.includes(filename)) {
      return require.cache[filename].exports;
    }

    if (require.cache[filename]) {
      return require.cache[filename].exports;
    }

    const path = require.cache.path.exports;
    if (filename.indexOf('.') === 0) {
      // relative path
    } else {
      // require from 'node_modules'
      if (path.extname(filename) === '.js') {
        // just require that file
        filename = path.join(require.base, 'node_modules', filename);
      } else {
        const jsonFilename = path.join(
          require.base,
          'node_modules',
          filename,
          'package.json'
        );
        const jsonContent = syncLoadFile(jsonFilename);
        const { main } = handleJSONFile(jsonFilename, jsonContent);
        filename = path.join(require.base, 'node_modules', filename, main);
      }
    }

    const fileContent = syncLoadFile(filename);
    return handleCMDFile(filename, fileContent);
  }

  function syncLoadFile(filePath) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, false);
    xhr.setRequestHeader('Content-Type', 'application/text');
    xhr.setRequestHeader('Accept', 'text/plain');
    xhr.send();
    if (xhr.readyState === 4 && xhr.status === 200) {
      return xhr.responseText;
    }
    throw new Error('Load file error: ' + filePath);
  }

  function handleCMDFile(filename, fileContent) {
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
    require.cache[filename] = { exports: {} };

    const path = require.cache.path.exports;

    moduleFn(
      require.cache[filename].exports,
      require,
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
})();
