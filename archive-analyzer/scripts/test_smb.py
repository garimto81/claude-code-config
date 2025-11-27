#!/usr/bin/env python
"""SMB 연결 테스트 스크립트"""

from smbclient import listdir, stat
import os

BASE_PATH = r"\\10.10.100.122\docker\GGPNAs\ARCHIVE"

def main():
    print("=== SMB Connection Test ===")
    print(f"Target: {BASE_PATH}")
    print()

    print("=== ARCHIVE 하위 폴더 ===")
    total_items = 0

    for folder in listdir(BASE_PATH):
        if folder.startswith('.'):
            continue
        folder_path = os.path.join(BASE_PATH, folder)
        try:
            s = stat(folder_path)
            if s.st_file_attributes & 0x10:  # Directory
                items = listdir(folder_path)
                print(f"[DIR] {folder}: {len(items)} items")
                total_items += len(items)
        except Exception as e:
            print(f"{folder}: Error - {e}")

    print()
    print(f"Total items in subfolders: {total_items}")

if __name__ == "__main__":
    main()
