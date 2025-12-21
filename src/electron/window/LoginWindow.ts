import { BrowserWindow } from "electron";

import {
  AuthRedirectData,
  parseAuthRedirect,
} from "insomnia-plugin-valorant/dist/util/auth/parse-auth-redirect";

async function openLoginWindow(
  mainWindow?: BrowserWindow,
): Promise<AuthRedirectData> {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 500,
      height: 1000,
      parent: mainWindow,
      modal: true,
      show: false,
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:valorant",
      },
    });
    authWindow.setMenuBarVisibility(false);

    const authUrl = new URL("https://auth.riotgames.com/authorize");
    authUrl.searchParams.set("redirect_uri", "https://playvalorant.com/opt_in");
    authUrl.searchParams.set("client_id", "play-valorant-web-prod");
    authUrl.searchParams.set("response_type", "token id_token");
    authUrl.searchParams.set("nonce", "1");
    authUrl.searchParams.set("scope", "account openid");

    authWindow.once("ready-to-show", async () => {
      authWindow.show();
    });

    authWindow.loadURL(authUrl.toString());

    const cleanupWebView = () => {
      authWindow.close();
    };

    authWindow.webContents.on("did-navigate-in-page", (event, url) => {
      if (
        url.startsWith("https://playvalorant.com/") &&
        url.includes("access_token")
      ) {
        try {
          cleanupWebView();
          resolve(parseAuthRedirect(url));
        } catch (e) {
          reject(e);
        }
      } else if (url.startsWith("https://authenticate.riotgames.com/")) {
        cleanupWebView();
        reject("No login data found or login data expired");
      }
    });
  });
}

export { openLoginWindow };
