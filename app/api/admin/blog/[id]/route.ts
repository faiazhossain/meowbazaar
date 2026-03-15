import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
    }

    const blogPost = await db.blogPost.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!blogPost) {
      return NextResponse.json({ success: false, error: "ব্লগ পোস্ট পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blogPost });
  } catch (error) {
    console.error("Get blog post error:", error);
    return NextResponse.json({ success: false, error: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
