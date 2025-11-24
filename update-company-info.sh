#!/bin/bash
# Update all HTML files with NHP STORE LLC information

echo "🏢 Adding NHP STORE LLC information to all HTML files..."

# List of files to update
files=(
    "privacy.html"
    "terms.html"
    "contact.html" 
    "bulk-download.html"
    "roadmap.html"
    "blog/snaptik-best-no-watermark-tiktok-downloader.html"
    "blog/cach-tai-video-tiktok-khong-logo.html"
)

# Company info line to add
company_line='                <p class="company-info">Operated by <strong>NHP STORE LLC</strong> | Professional Video Download Solutions</p>'

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Check if company info already exists
        if grep -q "NHP STORE LLC" "$file"; then
            echo "   ✅ $file already has company info"
        else
            # Add company info after copyright line
            sed -i.bak '/© 2019 - 2025 SnapTik/a\
'"$company_line"'' "$file"
            
            if [ $? -eq 0 ]; then
                echo "   ✅ Added company info to $file"
                rm "$file.bak" 2>/dev/null
            else
                echo "   ❌ Failed to update $file"
            fi
        fi
    else
        echo "   ⚠️  File not found: $file"
    fi
done

echo ""
echo "📊 Verification - Files with NHP STORE LLC:"
grep -l "NHP STORE LLC" *.html blog/*.html 2>/dev/null || echo "None found"

echo ""
echo "✅ Update completed!"