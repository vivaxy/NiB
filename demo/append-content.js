/**
 * @since 2019-08-02 00:22:51
 * @author vivaxy
 */
module.exports = function appendContent(content) {
  const div = document.createElement('div');
  div.textContent = content;
  document.body.appendChild(div);
};
