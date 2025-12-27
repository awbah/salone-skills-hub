import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.regionSL.findMany({
      include: {
        districts: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`Fetched ${regions.length} regions from database`);

    return NextResponse.json({
      regions: regions.map((region) => ({
        id: region.id,
        name: region.name,
        districts: region.districts.map((district) => ({
          id: district.id,
          name: district.name,
        })),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching regions:", error);
    const errorMessage = error?.message || "Failed to fetch regions";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

