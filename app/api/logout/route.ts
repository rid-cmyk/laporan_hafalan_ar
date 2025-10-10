import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return res;
}
