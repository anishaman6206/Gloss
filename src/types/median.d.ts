// Injected by the Median Android/iOS wrapper into the webview's global scope.
// Undefined in a regular browser — always guard on isMedianApp() before use.
type MedianGoogleLoginResponse =
  | { idToken: string; type: "google" }
  | { error: string; type: "google" };

interface Window {
  median?: {
    socialLogin: {
      google: {
        login(opts: { callback: (response: MedianGoogleLoginResponse) => void }): void;
      };
    };
  };
}
