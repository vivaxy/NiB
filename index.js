/**
 * @since 20180816 16:36
 * @author vivaxy
 */

(function() {
  window.node = { init, require };

  let baseDir = '';
  let moduleCache = {};
  let path = null;

  function init({ baseDir: _baseDir }) {
    baseDir = _baseDir;

    const fileContent = syncLoadFile(baseDir + '/lib/path.js');
    path = handleCMDFile(baseDir + '/lib/path.js', fileContent);
  }

  function require(filePath) {
    if (moduleCache[filePath]) {
      return moduleCache[filePath];
    }

    if (filePath.indexOf('.') === 0) {
      // relative path
    } else {
      // require from 'node_modules'
      if (path.extname(filePath) === '.js') {
        // just require that file
        filePath = path.join(baseDir, 'node_modules', filePath);
      } else {
        const jsonPath = path.join(
          baseDir,
          'node_modules',
          filePath,
          'package.json'
        );
        const jsonContent = syncLoadFile(jsonPath);
        const { main } = JSON.parse(jsonContent);
        filePath = path.join(baseDir, 'node_modules', filePath, main);
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
    const moduleFn = new Function('module', 'exports', 'require', fileContent);
    moduleCache[filePath] = { exports: {} };
    moduleFn(moduleCache[filePath], moduleCache[filePath].exports, require);
    return moduleCache[filePath].exports;
  }
})();
