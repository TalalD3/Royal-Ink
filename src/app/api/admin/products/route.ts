import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  idSchema,
  parseOneOrMany,
  productCreateSchema,
  productInputSchema,
  validationMessage,
} from "@/lib/validation";
import {
  createProducts,
  deleteAllProducts,
  deleteProduct,
  listAllProducts,
  updateProduct,
} from "@/lib/products";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const failed = (err: unknown, status = 500) =>
  NextResponse.json({ error: (err as Error)?.message || "Server error" }, { status });

// GET: every product (active or not)
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    return NextResponse.json({ data: await listAllProducts() });
  } catch (err) {
    return failed(err);
  }
}

// POST: one product, or an array (Excel import)
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = parseOneOrMany(productCreateSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const items = (Array.isArray(parsed.data) ? parsed.data : [parsed.data]) as Parameters<typeof createProducts>[0];
    return NextResponse.json({ data: await createProducts(items) });
  } catch (err) {
    return failed(err, 400);
  }
}

// PUT: update one product
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  try {
    const parsed = productInputSchema.extend({ id: idSchema }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
    const { id, ...updates } = parsed.data;
    const updated = await updateProduct(id, updates as Parameters<typeof updateProduct>[1]);
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return failed(err, 400);
  }
}

// DELETE: ?id=<id> or ?id=all
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const parsedId = idSchema.safeParse(new URL(req.url).searchParams.get("id"));
  if (!parsedId.success) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
  const id = parsedId.data;
  try {
    if (id === "all") {
      const { count } = await deleteAllProducts();
      return NextResponse.json({ success: true, deleted: count });
    }
    const { deleted } = await deleteProduct(id);
    if (!deleted) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return failed(err);
  }
}
