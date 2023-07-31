// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const ulEle = /** @type {HTMLElement} */ (
    document.getElementById("movie-wrapper")
  );

  ulEle.addEventListener(
    "click",
    (e) => {
      const liEle = e.target.closest('li');
      const id = liEle.getAttribute('data-id');
      const title = liEle.getAttribute('data-title');
      console.log('id', id, title);
      if (!id) {
        console.log('empty id');
        return;
      }
      vscode.postMessage({
        id,
        title,
      });
    },
    false
  );
})();
