import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Tiptap v3 ships TypeScript source only (no dist/).
// We alias each @tiptap/* package to its src/index.ts
// and handle sub-path exports (like @tiptap/pm/model, @tiptap/core/jsx-runtime).
function tiptapAliases(): Record<string, string> {
  const tiptapDir = path.join(process.cwd(), "node_modules", "@tiptap");
  const aliases: Record<string, string> = {};

  if (!fs.existsSync(tiptapDir)) return aliases;

  for (const pkg of fs.readdirSync(tiptapDir)) {
    const pkgDir = path.join(tiptapDir, pkg);
    if (!fs.statSync(pkgDir).isDirectory()) continue;

    // Main entry: @tiptap/pkg → src/index.ts
    const srcIndex = path.join(pkgDir, "src", "index.ts");
    if (fs.existsSync(srcIndex)) {
      aliases[`@tiptap/${pkg}`] = srcIndex;
    }

    // Sub-path source files for core
    if (pkg === "core") {
      const jsr = path.join(pkgDir, "src", "jsx-runtime.ts");
      if (fs.existsSync(jsr)) {
        aliases[`@tiptap/core/jsx-runtime`] = jsr;
        aliases[`@tiptap/core/jsx-dev-runtime`] = jsr;
      }
    }

    // Sub-path entries for pm: @tiptap/pm/model → model/index.ts
    if (pkg === "pm") {
      for (const sub of fs.readdirSync(pkgDir)) {
        const subIndex = path.join(pkgDir, sub, "index.ts");
        if (fs.existsSync(subIndex)) {
          aliases[`@tiptap/pm/${sub}`] = subIndex;
        }
      }
    }
  }

  return aliases;
}

const aliases = tiptapAliases();

// Webpack needs $ suffix for exact match; Turbopack does not.
const webpackAliases: Record<string, string> = {};
for (const [key, value] of Object.entries(aliases)) {
  webpackAliases[`${key}$`] = value;
}

// For transpilePackages, use bare package names
const transpilePackages = [
  ...new Set(
    Object.keys(aliases).map((k) => {
      const parts = k.split("/");
      return `${parts[0]}/${parts[1]}`;
    })
  ),
];

const nextConfig: NextConfig = {
  basePath: "/life-after-6pm",
  output: "export",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages,
  webpack(config) {
    Object.assign(config.resolve.alias, webpackAliases);
    // Tiptap source uses .js/.jsx extensions to import .ts/.tsx files
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
  turbopack: {
    resolveAlias: aliases,
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
};

export default nextConfig;
