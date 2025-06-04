#!/usr/bin/env python3
"""
Test script to verify that the category button fix has been implemented correctly.
This script checks that the category button click handler now includes logic to 
expand the container before loading content.
"""

import os
import re

def test_category_button_fix():
    """Test that category button now checks container state and expands if needed."""
    datain_path = "/Users/dallasp/Library/Mobile Documents/com~apple~CloudDocs/Finance/Inexasli/ai/datain.js"
    
    if not os.path.exists(datain_path):
        print(f"❌ File not found: {datain_path}")
        return False
    
    with open(datain_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for the fixed category button handler
    patterns = [
        r"// Check if container is collapsed and expand it before loading content",
        r"if \(dataContainer\.dataset\.state !== 'expanded'\)",
        r"toggleDataContainer\(\);",
        r"setTimeout\(\(\) => \{\s*loadStoredContent\('/ai/categories\.html'\);",
        r"// Container is already expanded, load content immediately"
    ]
    
    print("🔍 Testing category button fix implementation...")
    
    all_patterns_found = True
    for i, pattern in enumerate(patterns, 1):
        if re.search(pattern, content):
            print(f"✅ Pattern {i}: Found container state check and expansion logic")
        else:
            print(f"❌ Pattern {i}: Missing expected fix pattern: {pattern}")
            all_patterns_found = False
    
    # Check that the old simple implementation is gone
    old_pattern = r"// Load categories\.html directly into the datain container\s*loadStoredContent\('/ai/categories\.html'\);"
    if re.search(old_pattern, content):
        print("❌ Old simple implementation still found - fix may not be complete")
        all_patterns_found = False
    else:
        print("✅ Old simple implementation removed")
    
    # Check that toggleDataContainer function exists
    if re.search(r"function toggleDataContainer\(\)", content):
        print("✅ toggleDataContainer function exists")
    else:
        print("❌ toggleDataContainer function not found")
        all_patterns_found = False
    
    return all_patterns_found

def main():
    """Main test function."""
    print("=" * 60)
    print("Category Button Fix Verification Test")
    print("=" * 60)
    
    success = test_category_button_fix()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 SUCCESS: Category button fix has been properly implemented!")
        print("✅ The category button now:")
        print("   - Checks if the container is collapsed")
        print("   - Expands the container if needed using toggleDataContainer()")
        print("   - Loads categories.html content after expansion")
        print("   - Works immediately if container is already expanded")
    else:
        print("❌ FAILED: Category button fix is incomplete or missing")
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
