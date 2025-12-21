import type { BrowserWindow } from "electron";

import axios from "axios";

import type { AuthRedirectData } from "insomnia-plugin-valorant/dist/util/auth/parse-auth-redirect";
import type { RiotGeoResponse } from "valorant-api-types";

import { openLoginWindow } from "@/electron/window/LoginWindow";

class RiotApi {
  private authRedirectData: AuthRedirectData;
  private riotGeo: RiotGeoResponse;

  public async loginRiot(window?: BrowserWindow) {
    this.authRedirectData = await openLoginWindow(window);
  }

  private put<T>(url: string, body: any) {
    return axios.put<T>(url, body, {
      headers: {
        Authorization: `Bearer ${this.authRedirectData.accessToken}`,
      },
    });
  }

  private async putRiotGeo() {
    const result = await this.put<RiotGeoResponse>(
      "https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant",
      {
        id_token: this.authRedirectData.idToken,
      },
    );

    return result.data;
  }

  public async getRiotGeo() {
    if (!this.riotGeo) {
      this.riotGeo = await this.putRiotGeo();
    }

    return this.riotGeo;
  }
}

export { RiotApi };
