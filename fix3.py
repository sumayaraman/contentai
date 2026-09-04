with open("components/image/image-generator.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
print(f"Line 31: {repr(lines[30])}")
print(f"Line 200: {repr(lines[199])}")
print(f"Line 201: {repr(lines[200])}")
