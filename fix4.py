with open("components/image/image-generator.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Fix line 31 (index 30) - replace backtick template with string concatenation
line31 = lines[30]
print("Before:", repr(line31))
lines[30] = '      setNotice(result.demo ? "Generated in Demo Mode." : "Generated with " + (img?.provider ?? "unknown") + ".");\n'
print("After:", repr(lines[30]))

# Fix the badge className line - find it and fix it
for i, line in enumerate(lines):
    if "inline-flex w-fit items-center" in line and "\\`" in line:
        print(f"Found badge at line {i+1}: {repr(line)}")
        lines[i] = '            className={"inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " + (image.provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}\n'

with open("components/image/image-generator.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done!")
