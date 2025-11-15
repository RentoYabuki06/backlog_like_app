import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
    select: {
      id: true,
      provider: true,
      providerAccountId: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
    },
  })

  if (!account) {
    return NextResponse.json({
      error: "Google account not found",
      userId: session.user.id,
      message: "No Google account linked. Please log out and log in again.",
    })
  }

  return NextResponse.json({
    accountExists: true,
    hasAccessToken: !!account.access_token,
    hasRefreshToken: !!account.refresh_token,
    accessTokenLength: account.access_token?.length || 0,
    refreshTokenLength: account.refresh_token?.length || 0,
    expiresAt: account.expires_at,
    scope: account.scope,
    provider: account.provider,
    // セキュリティのため、トークンの実際の値は返さない
  })
}

