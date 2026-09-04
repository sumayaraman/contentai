with open("components/image/image-generator.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix line 31 - the setNotice line with backtick template literal
content = content.replace(
    "setNotice(result.demo ? \"Generated in Demo Mode.\" : `Generated with ${img?.provider ?? \"unknown\"}.`);",
    'setNotice(result.demo ? "Generated in Demo Mode." : "Generated with " + (img?.provider ?? "unknown") + ".");'
)

# Fix line 201 - the badge span with backtick template literal  
content = content.replace(
    '`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${image.provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`',
    '{"inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " + (image.provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}'
)

with open("components/image/image-generator.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed! Lines corrected.")
