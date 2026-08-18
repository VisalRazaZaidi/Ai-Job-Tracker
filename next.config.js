/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) and mammoth break when webpack bundles them —
  // keep them as runtime Node requires. Fixes the import/route.ts 500 on upload.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

module.exports = nextConfig;
