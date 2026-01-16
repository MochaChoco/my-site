import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware executed for:", request.nextUrl.pathname);
  // if (request.nextUrl.pathname === "/") {
  //   return NextResponse.redirect(new URL("/my-site/", request.url));
  // }
}

export const config = {
  // _next, api 호출, favicon.ico, svg, png 파일은 제외
  matcher: ["/((?!_next/|api/|favicon\\.ico$|.*\\.svg$|.*\\.png$).*)"],
};
