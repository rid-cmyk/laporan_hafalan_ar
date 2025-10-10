import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "mysecretkey");

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.split("auth_token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ loggedIn: true, user: payload });
  } catch (err) {
    console.error("Token verification failed:", err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
