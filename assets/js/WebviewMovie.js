// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    console.log("movie webview", message);
    if (message) {
      vscode.setState(message);
    }
  });
})();
