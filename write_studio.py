content = open("components/ai/ai-studio.tsx", "r", encoding="utf-8").read()

old = '''          <OutputField label="Image Prompt" value={content.imagePrompt} textarea onChange={(value) => updateField("imagePrompt", value)} onCopy={() => copyText(content.imagePrompt, "Image prompt")} />
          <Field label="Schedule Date & Time">'''

new = '''          <OutputField label="Image Prompt" value={content.imagePrompt} textarea onChange={(value) => updateField("imagePrompt", value)} onCopy={() => copyText(content.imagePrompt, "Image prompt")} />
          
          {content.imagePrompt && (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-600">AI Image + Video Studio</p>
                  <p className="text-xs text-violet-500">Generate an image or video from this prompt</p>
                </div>
              </div>
              <a href={"/image-studio?prompt=" + encodeURIComponent(content.imagePrompt)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                Open Image and Video Studio with this prompt
              </a>
            </div>
          )}

          <Field label="Schedule Date & Time">'''

if old in content:
    open("components/ai/ai-studio.tsx", "w", encoding="utf-8").write(content.replace(old, new))
    print("SUCCESS! Button added.")
else:
    print("ERROR - text not found")
    print("Has Image Prompt:", "Image Prompt" in content)
    print("Has Schedule Date:", "Schedule Date" in content)