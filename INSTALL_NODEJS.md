# 📥 Node.js Installation Guide for Windows

This guide will help you install Node.js on Windows to run the SnapTik Clone backend.

## Method 1: Download and Install (Recommended)

### Step 1: Download Node.js

1. Visit the official Node.js website: **https://nodejs.org/**
2. You'll see two download options:
   - **LTS (Long Term Support)** - Recommended for most users
   - **Current** - Latest features
3. Click on the **LTS** version to download
4. The download will be a file like: `node-v20.x.x-x64.msi`

### Step 2: Run the Installer

1. Double-click the downloaded `.msi` file
2. Click **Next** on the welcome screen
3. Accept the license agreement and click **Next**
4. Choose installation location (default is fine) and click **Next**
5. **IMPORTANT**: Make sure "Add to PATH" is checked
6. Click **Next** through the remaining screens
7. Click **Install** (may require administrator privileges)
8. Click **Finish** when installation completes

### Step 3: Verify Installation

1. Open a **NEW** PowerShell window (important - close old ones)
2. Run these commands:

```powershell
node --version
```

Should output something like: `v20.11.0`

```powershell
npm --version
```

Should output something like: `10.2.4`

If you see version numbers, Node.js is installed successfully! ✅

### Step 4: Restart VS Code

Close and reopen VS Code for it to recognize Node.js.

## Method 2: Using Chocolatey (Alternative)

If you have Chocolatey package manager installed:

```powershell
# Run PowerShell as Administrator
choco install nodejs-lts
```

## Method 3: Using Winget (Windows 10/11)

```powershell
# Run in PowerShell
winget install OpenJS.NodeJS.LTS
```

## After Installation

Once Node.js is installed, navigate back to the project and run:

```powershell
cd c:\Users\Administrator\Documents\GitHub\snaptikclone
npm install
```

This will install all project dependencies.

Then start the server:

```powershell
npm run dev
```

## Troubleshooting

### "npm is not recognized"

**Solution 1: Restart Terminal**
- Close all PowerShell/Terminal windows
- Close VS Code
- Reopen VS Code and open a new terminal

**Solution 2: Check PATH**
1. Open Start Menu and search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Check if these paths exist:
   - `C:\Program Files\nodejs\`
   - `C:\Users\<YourUsername>\AppData\Roaming\npm`

**Solution 3: Manual PATH Setup**
1. Find where Node.js is installed (usually `C:\Program Files\nodejs\`)
2. Add that path to your System PATH environment variable

### Installation Failed

- Make sure you have administrator privileges
- Disable antivirus temporarily during installation
- Download again in case file was corrupted
- Try alternative installation method

### "Cannot find module" errors after npm install

```powershell
# Clear npm cache and reinstall
npm cache clean --force
Remove-Item node_modules -Recurse -Force
npm install
```

## Verify Everything Works

After installation, run these commands in the project directory:

```powershell
# Should show Node.js version
node --version

# Should show npm version
npm --version

# Install project dependencies
npm install

# Start the development server
npm run dev
```

If the server starts successfully, you should see:

```
╔═══════════════════════════════════════╗
║   SnapTik Clone Server Started! 🚀   ║
╠═══════════════════════════════════════╣
║  Port: 3000                        
║  Environment: development
║  URL: http://localhost:3000
╚═══════════════════════════════════════╝
```

## Next Steps

1. ✅ Node.js installed
2. ✅ npm working
3. ✅ Dependencies installed
4. ✅ Server running
5. 🌐 Open browser to `http://localhost:3000`
6. 🎉 Start using the app!

## Additional Resources

- **Node.js Official Site**: https://nodejs.org/
- **npm Documentation**: https://docs.npmjs.com/
- **Node.js Tutorial**: https://nodejs.dev/learn

---

Need help? Check the main [SETUP.md](SETUP.md) for more information.
