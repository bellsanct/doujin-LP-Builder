#!/usr/bin/env python3
"""
テンプレート結合スクリプト
template.json + style.css → {template-id}.dlpt

Usage:
    python combine.py
"""

import json
import os
import sys

def main():
    print('📦 Combining template files...\n')

    try:
        # 固定ファイル名から読み込み
        template_path = 'template.json'
        css_path = 'style.css'

        if not os.path.exists(template_path):
            print('❌ Error: template.json not found')
            sys.exit(1)

        if not os.path.exists(css_path):
            print('❌ Error: style.css not found')
            sys.exit(1)

        with open(template_path, 'r', encoding='utf-8') as f:
            template = json.load(f)

        with open(css_path, 'r', encoding='utf-8') as f:
            css = f.read()

        # バリデーション
        if 'template' not in template:
            print('❌ Error: "template" field not found in template.json')
            sys.exit(1)

        if 'version' not in template:
            print('❌ Error: "version" field not found in template.json')
            sys.exit(1)

        # CSSを埋め込み
        template['templateCSS'] = css

        # テンプレートIDから出力ファイル名を決定
        output_file = f"{template['template']}.dlpt"

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)

        # 結果表示
        file_size = os.path.getsize(output_file)
        file_size_kb = file_size / 1024

        print('✅ Template combined successfully!\n')
        print(f"   Template ID: {template['template']}")
        print(f"   Version: {template['version']}")
        print(f"   Output file: {output_file}")
        print(f"   File size: {file_size_kb:.2f} KB")
        print(f"   CSS length: {len(css):,} characters")
        print(f"   Blocks: {len(template.get('blocks', []))}\n")

    except Exception as error:
        print(f'❌ Error: {error}')
        sys.exit(1)

if __name__ == '__main__':
    main()
