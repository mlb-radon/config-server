const fs = require("fs-extra");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sharedSrcPath = path.resolve(projectRoot, "shared/src");
const backendSharedPath = path.resolve(projectRoot, "backend/src/shared");
const frontendSharedPath = path.resolve(projectRoot, "frontend/src/shared");

async function createSymlinks() {
  try {
    // Check if shared/src exists
    if (!(await fs.pathExists(sharedSrcPath))) {
      console.log(
        "⚠️  shared/src folder doesn't exist yet. Skipping symlink creation."
      );
      return;
    }

    // Ensure target directories exist
    await fs.ensureDir(path.dirname(backendSharedPath));
    await fs.ensureDir(path.dirname(frontendSharedPath));

    // Remove existing symlinks or directories if they exist
    await fs.remove(backendSharedPath);
    await fs.remove(frontendSharedPath);

    // Create symlinks
    if (process.platform === "win32") {
      // On Windows, use junction for directory symlinks (works without admin rights)
      await fs.symlink(sharedSrcPath, backendSharedPath, "junction");
      await fs.symlink(sharedSrcPath, frontendSharedPath, "junction");
    } else {
      // On Unix-like systems, use regular symlinks
      await fs.symlink(sharedSrcPath, backendSharedPath);
      await fs.symlink(sharedSrcPath, frontendSharedPath);
    }

    console.log("✅ Symlinks created successfully!");
    console.log(
      `📁 Shared source linked to:\n   - ${backendSharedPath}\n   - ${frontendSharedPath}`
    );
  } catch (error) {
    console.error("❌ Error creating symlinks:", error);
    process.exit(1);
  }
}

createSymlinks();
