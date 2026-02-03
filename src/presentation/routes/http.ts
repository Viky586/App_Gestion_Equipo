import { NextResponse } from "next/server";
import { AppError } from "@/domain/errors/AppError";
import { ZodError } from "zod";

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const issuePath = firstIssue?.path?.length
      ? firstIssue.path.join(".")
      : null;
    const message = issuePath
      ? `${issuePath}: ${firstIssue?.message ?? "Invalid request data."}`
      : firstIssue?.message ?? "Invalid request data.";
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message,
          details: error.flatten(),
        },
      },
      { status: 422 }
    );
  }
  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Unexpected error." } },
    { status: 500 }
  );
}
