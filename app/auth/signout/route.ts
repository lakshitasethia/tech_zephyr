import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign out endpoint.
 *
 * Deliberately a plain route handler posted to by a real HTML form rather than
 * a Server Action. As a <form action={signOut}> React rendered an empty action
 * attribute and the click did nothing at all, with no request ever reaching the
 * server. This version has no client side dependency, so it also works with
 * JavaScript disabled.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // "local" clears this device's session without a network round trip to
  // revoke the refresh token. A global sign out that cannot reach Supabase
  // leaves the cookies in place and the user apparently still signed in.
  await supabase.auth.signOut({ scope: "local" });

  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });

  // Belt and braces: clear every Supabase auth cookie on the response itself.
  const store = await cookies();
  for (const cookie of store.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
  }

  return response;
}
