const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('1️⃣ Building Next.js App...');
try {
    execSync('npm run build', { stdio: 'inherit', shell: true });
} catch (error) {
    console.error('Build failed!', error);
    process.exit(1);
}

console.log('\n2️⃣ Assembling standalone app for RedServerHost...');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const publicDir = path.join(__dirname, 'public');
const standalonePublicDir = path.join(standaloneDir, 'public');

const staticDir = path.join(__dirname, '.next', 'static');
const standaloneNextStaticDir = path.join(standaloneDir, '.next', 'static');

// Copy public directory
if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, standalonePublicDir, { recursive: true });
    console.log('✅ Copied public directory');
}

// Copy .next/static directory
if (fs.existsSync(staticDir)) {
    fs.cpSync(staticDir, standaloneNextStaticDir, { recursive: true });
    console.log('✅ Copied .next/static directory');
}

// Rename server.js to app.js (commonly required by cPanel Node.js passenger setup)
const serverJsPath = path.join(standaloneDir, 'server.js');
const appJsPath = path.join(standaloneDir, 'app.js');
if (fs.existsSync(serverJsPath)) {
    fs.renameSync(serverJsPath, appJsPath);
    console.log('✅ Renamed server.js to app.js (for cPanel compatibility)');
}

// Zip the final standalone application using archiver for cross-platform compatibility
const archiver = require('archiver');
const zipFilePath = path.join(__dirname, 'fabel-web-ready-for-cpanel.zip');
const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', { zlib: { level: 9 } });

console.log('\n3️⃣ Zipping application for cPanel (Using UNIX format paths & permissions)...');

output.on('close', function () {
    console.log(`✅ Zipped successfully! Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n🎉 PACKAGING COMPLETE! 🎉');
    console.log(`A new file named "fabel-web-ready-for-cpanel.zip" has been created in your fabel-web folder.`);
    console.log('\nTo host on RedServerHost, follow these steps:');
    console.log('1. Go to cPanel File Manager first.');
    console.log('2. **IMPORTANT**: DELETE the existing ".next" and "node_modules" folders inside your app folder! (They have corrupted permissions from the last failure)');
    console.log('3. Upload "fabel-web-ready-for-cpanel.zip" to the application folder and Extract it.');
    console.log('4. In RedServerHost cPanel, go to "Setup Node.js App".');
    console.log('5. Define your environment variables in the variables section (.env).');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('6. Restart the App in cPanel. Done!');
});

archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        console.warn(err);
    } else {
        throw err;
    }
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// Append the standalone directory and ENFORCE Linux/UNIX permissions
// Windows permissions often translate to 000 on Linux, causing 'Permission denied'
archive.directory(standaloneDir, false, data => {
    // Set 0755 for directories
    // Set 0755 for app.js so Phusion Passenger can execute it
    // Set 0644 for all other files
    if (data.stats.isDirectory()) {
        data.mode = 0o755;
    } else if (data.name === 'app.js') {
        data.mode = 0o755; // MUST be executable for Passenger to start the app
    } else {
        data.mode = 0o644;
    }
    return data;
});
archive.finalize();
