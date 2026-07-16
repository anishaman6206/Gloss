// Injected by the Median Android/iOS wrapper into the webview's global scope.
// Undefined in a regular browser — always guard on isMedianApp() before use.
interface Window {
  median?: {
    socialLogin: {
      google: {
        login(opts: { redirectUri: string; state?: string }): void;
      };
    };
  };
}
