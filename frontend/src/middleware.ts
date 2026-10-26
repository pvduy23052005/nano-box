import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const privatePath = ["/chat", "/users", "/room"];
const publicPath = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  const isPrivatePath =
    pathname === "/" || privatePath.some((path) => pathname.startsWith(path));
  const isPublicPath = publicPath.some((path) => pathname.startsWith(path));

  if (isPrivatePath) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const keySecrete = new TextEncoder().encode(
        process.env.JWT_SECRET as string,
      );
      await jwtVerify(accessToken, keySecrete);

      if (pathname === "/") {
        return NextResponse.redirect(new URL("/chat", request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  if (isPublicPath && accessToken) {
    try {
      const secretKey = new TextEncoder().encode(
        process.env.JWT_SECRET as string,
      );
      await jwtVerify(accessToken, secretKey);

      return NextResponse.redirect(new URL("/chat", request.url));
    } catch {
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/users/:path*",
    "/room/:path*",
    "/login/:path*",
    "/register/:path*",
  ],
};
