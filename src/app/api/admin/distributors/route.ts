import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  distributorCreateSchema,
  distributorInputSchema,
  idSchema,
  parseOneOrMany,
  validationMessage,
} from "@/lib/validation";
import {
  createDistributors,
  deleteAllDistributors,
  deleteDistributor,
  listAllDistributors,
  updateDistributor,
} from "@/lib/distributors-store";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const failed = (err: unknown, status = 500) =>
  NextResponse.json({ error: (err as Error)?.message || "Server error" }, { status });

// GET: every point of sale (active or not)
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ data: await listAllDistributors() });
  } catch (err) {
    return failed(err);
  }
}

// POST: one point of sale, or an array (Excel import / sample data)
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = parseOneOrMany(distributorCreateSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const items = (Array.isArray(parsed.data) ? parsed.data : [parsed.data]) as Parameters<typeof createDistributors>[0];
    return NextResponse.json({ data: await createDistributors(items) });
  } catch (err) {
    return failed(err, 400);
  }
}

// PUT: update one point of sale
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = distributorInputSchema.extend({ id: idSchema }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const { id, ...updates } = parsed.data;
    const updated = await updateDistributor(id, updates as Parameters<typeof updateDistributor>[1]);
    if (!updated) return NextResponse.json({ error: "Point of sale not found" }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return failed(err, 400);
  }
}

// DELETE: ?id=<id> or ?id=all
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const parsedId = idSchema.safeParse(new URL(req.url).searchParams.get("id"));
  if (!parsedId.success) return NextResponse.json({ error: "Missing distributor ID" }, { status: 400 });
  const id = parsedId.data;
  try {
    if (id === "all") {
      const count = await deleteAllDistributors();
      return NextResponse.json({ success: true, deleted: count });
    }
    if (!(await deleteDistributor(id))) {
      return NextResponse.json({ error: "Point of sale not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return failed(err);
  }
}
