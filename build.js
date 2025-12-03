const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

console.log("🔨 Building Flask App with PyInstaller...");

try {
  // Build dengan python -m PyInstaller
  execSync("python -m PyInstaller build_app.spec --clean", {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("✅ Flask app built successfully");

  // Copy to resources
  const distPath = path.join(__dirname, "dist", "flask_app");
  const resourcesPath = path.join(__dirname, "resources");

  fs.ensureDirSync(resourcesPath);
  fs.copySync(distPath, path.join(resourcesPath, "flask_app"));

  console.log("✅ Flask app copied to resources");

  // Build Electron app
  console.log("🔨 Building Electron App...");
  execSync("npm run dist", {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
