/**
 * @since 20180816 16:36
 * @author vivaxy
 */

(function() {
  window.node = { init, require, global: {} };

  require.base = '.';
  require.cache = {};

  function init({ base }) {
    require.base = base;

    const fileContent = syncLoadFile(base + '/lib/path.js');
    handleCMDFile(base + '/lib/path.js', fileContent);
  }

  function require(filePath) {
    if (require.cache[filePath]) {
      return require.cache[filePath].exports;
    }

    const path = require.cache[require.base + '/lib/path.js'].exports;
    if (filePath.indexOf('.') === 0) {
      // relative path
    } else {
      // require from 'node_modules'
      if (path.extname(filePath) === '.js') {
        // just require that file
        filePath = path.join(require.base, 'node_modules', filePath);
      } else {
        const jsonPath = path.join(
          require.base,
          'node_modules',
          filePath,
          'package.json'
        );
        const jsonContent = syncLoadFile(jsonPath);
        const { main } = handleJSONFile(jsonPath, jsonContent);
        filePath = path.join(require.base, 'node_modules', filePath, main);
      }
    }

    const fileContent = syncLoadFile(filePath);
    return handleCMDFile(filePath, fileContent);
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

  function handleCMDFile(filePath, fileContent) {
    const moduleFn = new Function(
      'module',
      'exports',
      'require',
      '__dirname',
      '__filename',
      'process',
      'global',
      fileContent
    );
    require.cache[filePath] = { exports: {} };

    const path = require.cache[require.base + '/lib/path.js'].exports;

    moduleFn(
      require.cache[filePath],
      require.cache[filePath].exports,
      require,
      path.dirname(filePath),
      filePath,
      {},
      window.node.global
    );
    return require.cache[filePath].exports;
  }

  function handleJSONFile(filePath, fileContent) {
    const json = JSON.parse(fileContent);
    require.cache[filePath] = { exports: json };
    return json;
  }
})();
