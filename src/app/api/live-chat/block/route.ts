import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface BlockRequestBody {
  ip_address: string;
  reason?: string;
  action: "block" | "unblock";
}

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated (admin)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: BlockRequestBody = await request.json();
    const { ip_address, reason, action } = body;

    if (!ip_address) {
      return NextResponse.json(
        { error: "ip_address is required" },
        { status: 400 }
      );
    }

    if (!action || !["block", "unblock"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'block' or 'unblock'" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    if (action === "block") {
      // Block the IP
      const { error } = await serviceClient
        .from("sws2026_blocked_ips")
        .upsert({
          ip_address,
          reason: reason || null,
          blocked_by: user.email || user.id,
        }, {
          onConflict: "ip_address",
        });

      if (error) {
        console.error("Error blocking IP:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "blocked" });
    } else {
      // Unblock the IP
      const { error } = await serviceClient
        .from("sws2026_blocked_ips")
        .delete()
        .eq("ip_address", ip_address);

      if (error) {
        console.error("Error unblocking IP:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "unblocked" });
    }
  } catch (error) {
    console.error("Block IP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if an IP is blocked or list all blocked IPs
export async function GET(request: Request) {
  try {
    // Verify the user is authenticated (admin)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    const serviceClient = createServiceClient();

    if (ip) {
      // Check if specific IP is blocked
      const { data: blockedIP, error } = await serviceClient
        .from("sws2026_blocked_ips")
        .select("*")
        .eq("ip_address", ip)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected
        console.error("Error checking blocked IP:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        blocked: !!blockedIP,
        data: blockedIP || null,
      });
    } else {
      // List all blocked IPs
      const { data: blockedIPs, error } = await serviceClient
        .from("sws2026_blocked_ips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error listing blocked IPs:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ blockedIPs });
    }
  } catch (error) {
    console.error("Get blocked IPs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
