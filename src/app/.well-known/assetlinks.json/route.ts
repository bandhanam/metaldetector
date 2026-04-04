import { NextResponse } from "next/server";

export async function GET() {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.vercel.metaldetector_digger.twa",
        sha256_cert_fingerprints: [
          // Replace with your signing key SHA-256 fingerprint after generating the APK
          // You can get this from PWABuilder or by running:
          // keytool -list -v -keystore your-keystore.jks
          "PLACEHOLDER:REPLACE_WITH_YOUR_SHA256_FINGERPRINT"
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
