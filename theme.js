const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

walk('./app', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Exact hex matches
    let newContent = content
        .replace(/#0c0c0e/gi, 'var(--bg)')
        .replace(/#111114/gi, 'var(--bg-subtle)')
        .replace(/#18181c/gi, 'var(--bg-raised)')
        .replace(/#1a1a2e/gi, 'var(--bg-raised)')
        .replace(/#16213e/gi, 'var(--bg)')
        .replace(/#f0f0f4/gi, 'var(--text-1)')
        .replace(/#8b8b99/gi, 'var(--text-2)')
        .replace(/#6b6b78/gi, 'var(--text-3)')
        .replace(/#52525e/gi, 'var(--text-3)')
        .replace(/#3f3f48/gi, 'var(--text-4)')
        .replace(/#7c3aed/gi, 'var(--purple)')
        .replace(/#a78bfa/gi, 'var(--purple-light)')
        .replace(/#4ade80/gi, 'var(--green-light)')
        .replace(/#16a34a/gi, 'var(--green)')
        
        // RGBA transparent layers over backgrounds
        .replace(/rgba\(12,\s*12,\s*14,/g, 'rgba(var(--bg-rgb),')
        .replace(/rgba\(255,\s*255,\s*255,/g, 'rgba(var(--invert-rgb),')
        
    // Special handling for #fff: replace with var(--text-1) EXCEPT when inside gradient or solid purple background
    // We'll just replace #fff to var(--text-1) by default, but if it breaks a colored block we'll let the user see it or fix it.
    // Actually, let's use a regex to only match #fff or #ffffff that are standard property colors like `color: "#fff"`
    // Since React uses `color: "#fff"`, we can do:
    newContent = newContent
        .replace(/color:\s*["']#fff["']/gi, 'color: "var(--text-1)"')
        .replace(/color:\s*["']#ffffff["']/gi, 'color: "var(--text-1)"')

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log("Updated", filePath);
    }
});
