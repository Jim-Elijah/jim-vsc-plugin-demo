// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const ulEle = /** @type {HTMLElement} */ (
    document.getElementById("news-wrapper")
  );

  ulEle.addEventListener(
    "click",
    (e) => {
      const target = e.target;
      const id = target.getAttribute('data-id');
      console.log('target', target, id);
      if (!id) {
        console.log('empty id');
        return;
      }
      vscode.postMessage(id);
    },
    false
  );
})();
