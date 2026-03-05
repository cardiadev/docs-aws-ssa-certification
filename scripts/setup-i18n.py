#!/usr/bin/env python3
"""
Sets up i18n file structure for all fumadocs MDX and meta.json files.
- For each .mdx: creates a .en.mdx stub if it doesn't already exist.
- For each meta.json: creates a meta.en.json if it doesn't already exist.
"""
import os, re, json

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'docs')

def read_frontmatter(content):
    """Extract frontmatter dict from mdx content."""
    m = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        kv = re.match(r'^(\w+):\s*"?(.*?)"?\s*$', line)
        if kv:
            fm[kv.group(1)] = kv.group(2)
    return fm

created_mdx = 0
created_meta = 0
skipped = 0

for root, dirs, files in os.walk(DOCS_DIR):
    # Skip already-processed lang files
    dirs.sort()
    for filename in sorted(files):
        filepath = os.path.join(root, filename)

        # --- Handle .mdx files → create .en.mdx stubs ---
        if filename.endswith('.mdx') and not re.search(r'\.(en|es)\.mdx$', filename):
            en_filename = filename.replace('.mdx', '.en.mdx')
            en_filepath = os.path.join(root, en_filename)

            if os.path.exists(en_filepath):
                skipped += 1
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            fm = read_frontmatter(content)
            title = fm.get('title', filename.replace('.mdx', '').replace('-', ' ').title())
            # Strip emoji flags from title if present
            title = re.sub(r'[\U0001F1E0-\U0001F1FF]{2}', '', title).strip()

            en_content = f'''---
title: "{title}"
description: "Content coming soon."
---

> 🚧 Content under construction.
'''
            with open(en_filepath, 'w', encoding='utf-8') as f:
                f.write(en_content)
            created_mdx += 1
            print(f'  [MDX] Created: {os.path.relpath(en_filepath, DOCS_DIR)}')

        # --- Handle meta.json files → create meta.en.json ---
        if filename == 'meta.json':
            en_meta_path = os.path.join(root, 'meta.en.json')
            if os.path.exists(en_meta_path):
                skipped += 1
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                meta = json.load(f)

            # Use same structure; title stays (it's already English-friendly)
            with open(en_meta_path, 'w', encoding='utf-8') as f:
                json.dump(meta, f, indent=2, ensure_ascii=False)
                f.write('\n')
            created_meta += 1
            print(f'  [META] Created: {os.path.relpath(en_meta_path, DOCS_DIR)}')

print(f'\nDone! Created {created_mdx} .en.mdx stubs, {created_meta} meta.en.json files. Skipped {skipped} already existing.')
