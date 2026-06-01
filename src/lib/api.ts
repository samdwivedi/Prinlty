import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "./auth";

export type ApiHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export function withAuth(
  handler: (
    req: NextRequest,
    user: { userId: string; email: string; role: string; name: string },
    context?: { params: Record<string, string> }
  ) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    const user = await getUserFromRequest(req);
    if (!user) {
      return apiError("Unauthorized", 401);
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return apiError("Forbidden", 403);
    }
    return handler(req, user, context);
  };
}
