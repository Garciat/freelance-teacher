import { redirect303 } from "@/lib/web/respond.ts";
import { ExtraParser } from "@/lib/web/types.ts";

import { AuthSession } from "@/app/session.ts";
import { UserSession } from "@/app/pages/_types.ts";

export namespace Extras {
  export namespace User {
    export function optional(): ExtraParser<UserSession | null> {
      return (ctx) => {
        const auth = AuthSession.get(ctx);
        return auth;
      };
    }

    export function required(): ExtraParser<UserSession> {
      return (ctx) => {
        const auth = AuthSession.get(ctx);
        if (auth === null) {
          return redirect303("/auth/login");
        }
        return auth;
      };
    }
  }
}
