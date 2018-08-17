/**
 * @since 20180817 09:57
 * @author vivaxy
 */

module.exports = function assert(condition, message) {
  if (!condition) {
    alert(message);
    throw new Error(message);
  } else {
    console.log('✅ ' + message);
  }
};
