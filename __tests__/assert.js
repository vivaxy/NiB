/**
 * @since 20180817 09:57
 * @author vivaxy
 */

const $console = document.querySelector('.console');
module.exports = function assert(condition, message) {
  let log = '';
  if (!condition) {
    log = '❌ ' + message;
  } else {
    log = '✅ ' + message;
  }
  const $log = document.createElement('div');
  $log.textContent = log;
  $console.appendChild($log);
  console.log(log);
};
