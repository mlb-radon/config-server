console.log('Hello version !!!!')

// const fs = require('fs-extra')
// const path = require('path')
// const { execSync } = require('child_process')

// const projectRoot = path.resolve(__dirname, '..')

// async function checkIfRunFromWorkspace() {
//   // Check if this is a redirected call (environment variable set by workspace scripts)
//   if (process.env.NPM_VERSION_REDIRECTED === 'true') {
//     return null // Allow execution when redirected
//   }

//   // Check if we're being run from a workspace directory
//   const cwd = process.cwd()
//   const workspaceDirs = ['backend', 'frontend', 'shared']

//   for (const workspace of workspaceDirs) {
//     const workspacePath = path.resolve(projectRoot, workspace)
//     if (cwd === workspacePath || cwd.startsWith(workspacePath + path.sep)) {
//       return workspace
//     }
//   }
//   return null
// }

// async function syncVersionToWorkspaces() {
//   try {
//     // Safety check: ensure we're not accidentally running from a workspace
//     const runningFromWorkspace = await checkIfRunFromWorkspace()
//     if (runningFromWorkspace) {
//       console.error('⚠️  WARNING: Version command detected from workspace directory!')
//       console.error(`   Currently in: ${runningFromWorkspace}/`)
//       console.error('   Versions should be managed from the root directory only.')
//       console.error('')
//       console.error('💡 To fix this, run the version command from the project root:')
//       console.error(
//         `   cd ${path.relative(process.cwd(), projectRoot)} && npm version <patch|minor|major>`,
//       )
//       console.error('')
//       process.exit(1)
//     }

//     // Read the current version from root package.json
//     const rootPackagePath = path.resolve(projectRoot, 'package.json')
//     const rootPackage = await fs.readJson(rootPackagePath)
//     const currentVersion = rootPackage.version

//     console.log(`📦 Syncing version ${currentVersion} to all workspaces...`)

//     // Update each workspace package.json
//     for (const workspace of ['backend', 'frontend', 'shared']) {
//       const packageJsonPath = path.resolve(projectRoot, workspace, 'package.json')

//       if (await fs.pathExists(packageJsonPath)) {
//         const packageJson = await fs.readJson(packageJsonPath)
//         packageJson.version = currentVersion

//         // Update any internal workspace dependencies
//         for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
//           if (packageJson[depType]) {
//             for (const [dep, version] of Object.entries(packageJson[depType])) {
//               // Check if it's an internal workspace dependency
//               if (dep.startsWith('@config-server/')) {
//                 packageJson[depType][dep] = currentVersion
//               }
//             }
//           }
//         }

//         await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
//         console.log(`✅ Updated ${workspace} to version ${currentVersion}`)
//       }
//     }

//     // Stage the workspace package.json files and amend to the commit npm just made
//     try {
//       execSync('git add */package.json', { stdio: 'inherit', cwd: projectRoot })
//       execSync('git commit --amend --no-edit', { stdio: 'inherit', cwd: projectRoot })
//       console.log('✅ Added workspace package.json files to version commit')
//     } catch (gitError) {
//       console.warn('⚠️  Could not amend git commit (this is ok if not in a git repo)')
//     }

//     console.log(`✨ Successfully synced version ${currentVersion} to all workspaces`)
//   } catch (error) {
//     console.error('❌ Error syncing versions:', error.message)
//     process.exit(1)
//   }
// }

// syncVersionToWorkspaces()
