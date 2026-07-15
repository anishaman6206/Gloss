import { NextResponse } from "next/server";
import { deleteWord } from "@/lib/actions";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const result = await deleteWord(params.id);

  if (!result.ok) {
    const status = result.error === "unauthorized" ? 401 : 404;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
