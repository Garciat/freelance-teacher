import { redirect303 } from "@/lib/web/respond.ts";
import { ExtraParser } from "@/lib/web/types.ts";

import { AuthSession, AuthSessionData } from "@/app/session.ts";
import { UserSession } from "@/app/pages/_types.ts";

export namespace Extras {
  export namespace User {
    export function optional(): ExtraParser<UserSession | null> {
      return async (ctx) => {
        const auth = AuthSession.get(ctx);
        if (auth === null) {
          return null;
        }
        return await userFromAuth(auth);
      };
    }

    export function required(): ExtraParser<UserSession> {
      return async (ctx) => {
        const auth = AuthSession.get(ctx);
        if (auth === null) {
          return redirect303("/auth/login");
        }
        return await userFromAuth(auth);
      };
    }

    async function userFromAuth(auth: AuthSessionData): Promise<UserSession> {
      return {
        id: auth.email,
        email: auth.email,
      };
    }
  }
}
