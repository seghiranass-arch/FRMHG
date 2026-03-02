import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import puppeteer from "puppeteer";
import { getServerUser } from "../../../../../lib/server-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerUser();

    // Check if user is authenticated and has permission (admin or owner of the license)
    // For now, let's restrict to authenticated users, and maybe add specific checks if needed
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Determine base URL from request headers
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const targetUrl = `${baseUrl}/print/license/${id}`;

    // Get auth cookie to pass to Puppeteer
    const cookieStore = await cookies();
    const token = cookieStore.get("frmhg_token");

    // Launch Puppeteer
    // Note: In production (docker), you might need to configure executablePath
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set cookie
    if (token) {
      await page.setCookie({
        name: "frmhg_token",
        value: token.value,
        domain: host.split(":")[0], // Remove port if present
        path: "/",
      });
    }

    // Set viewport to match the card size + high DPI factor if needed
    await page.setViewport({
      width: 800,
      height: 600,
      deviceScaleFactor: 2, // Improve raster image quality
    });

    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Generate PDF
    // Standard credit card size: 85.60 × 53.98 mm
    const pdf = await page.pdf({
      width: "85.6mm",
      height: "53.98mm",
      printBackground: true,
      pageRanges: "1",
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();

    // Return PDF
    const filename = `licence-${id}.pdf`;
    
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
