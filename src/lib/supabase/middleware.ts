import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { MOCK_SESSION_COOKIE, getMockProfileById } from "@/lib/mock/session";

const SELLER_ONLY_PREFIXES = ["/vendedor"];
const PICKING_ONLY_PREFIXES = ["/preparacion"];
const ADMIN_ONLY_PREFIXES = ["/admin"];

function routeAllowedForRole(pathname: string, role: string | undefined) {
  const wantsSeller = SELLER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const wantsPicking = PICKING_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const wantsAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    role === "admin" ||
    (wantsSeller && role === "seller") ||
    (wantsPicking && role === "picking_packing") ||
    (wantsAdmin && role === "admin") ||
    (!wantsSeller && !wantsPicking && !wantsAdmin)
  );
}

function updateSessionMock(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/ingresar");
  const profile = getMockProfileById(request.cookies.get(MOCK_SESSION_COOKIE)?.value);

  if (!profile && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    return NextResponse.redirect(url);
  }

  if (profile && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (profile && !routeAllowedForRole(pathname, profile.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest) {
  if (MOCK_MODE) return updateSessionMock(request);

  let response = NextResponse.next({ request });

  // Not parameterized with Database — see the note in ./client.ts.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/ingresar");

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role;
    if (!routeAllowedForRole(pathname, role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
