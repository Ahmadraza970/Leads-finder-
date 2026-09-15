import { ImageResponse } from "next/og";
import { HOTEL } from "@/lib/data";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Grand Orion Hotel — Hotel on Faizabad Road, Lucknow";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #4E342E 0%, #2A1F18 60%, #8B6B4A 130%)",
          color: "#FAF9F6",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(239,222,205,0.5)",
            borderRadius: 48,
            padding: "48px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              letterSpacing: "0.08em",
              fontStyle: "italic",
            }}
          >
            Grand Orion
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              opacity: 0.85,
              marginTop: 28,
              letterSpacing: "0.18em",
            }}
          >
            HOTEL - FAIZABAD ROAD - LUCKNOW
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            opacity: 0.7,
            marginTop: 40,
            letterSpacing: "0.06em",
          }}
        >
          {HOTEL.rating} / 5 rating - {HOTEL.reviewCount}+ reviews - {HOTEL.phone}
        </div>
      </div>
    ),
    size,
  );
}