#!/bin/bash
# Update NHP STORE LLC contact information across all files

echo "📧 Updating NHP STORE LLC contact information..."

# Function to update email in files
update_emails() {
    local old_email="contact@snaptikks.com"
    local new_email="nhp@snaptikks.com"
    
    # Files to update
    files=(
        "*.html"
        "blog/*.html"
        "README.md"
        "*.md"
    )
    
    for pattern in "${files[@]}"; do
        for file in $pattern; do
            if [ -f "$file" ]; then
                # Skip files that already have the new email
                if grep -q "$new_email" "$file"; then
                    continue
                fi
                
                # Update old email to new email
                if grep -q "$old_email" "$file"; then
                    echo "   📝 Updating emails in: $file"
                    sed -i.bak "s/$old_email/$new_email/g" "$file"
                    rm -f "$file.bak" 2>/dev/null
                fi
            fi
        done
    done
}

# Update contact emails
update_emails

echo ""
echo "📍 Contact Information Summary:"
echo "================================"
echo "🏢 Company: NHP STORE LLC"
echo "📍 Address: 1795 Alysheba Way 7203a, Lexington, KY 40509, US"
echo "📧 Primary: nhp@snaptikks.com"
echo "🆘 Support: support@snaptikks.com"
echo "💼 Business: business@snaptikks.com"
echo ""

echo "🔍 Files containing new email address:"
grep -l "nhp@snaptikks.com" *.html blog/*.html *.md 2>/dev/null

echo ""
echo "✅ Email update completed!"