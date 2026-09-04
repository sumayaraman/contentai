content = open("components/image/image-generator.tsx", "r", encoding="utf-8").read()

old = 'export function ImageGenerator({ posts = [] }: { posts?: Pick<Post, "id" | "title" | "platform">[] }) {\n  const [prompt, setPrompt] = useState("");'

new = 'export function ImageGenerator({ posts = [], initialPrompt = "" }: { posts?: Pick<Post, "id" | "title" | "platform">[], initialPrompt?: string }) {\n  const [prompt, setPrompt] = useState(initialPrompt);'

if old in content:
    open("components/image/image-generator.tsx", "w", encoding="utf-8").write(content.replace(old, new))
    print("SUCCESS! initialPrompt added.")
else:
    print("ERROR - trying alternate...")
    old2 = "export function ImageGenerator({ posts = [] }: { posts?: Pick<Post, \"id\" | \"title\" | \"platform\">[] }) {"
    if old2 in content:
        print("Found alternate version")
    else:
        print("Not found - check file manually")