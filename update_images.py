import os

names = ["profile", "room", "city", "art", "culture"]
output_file = "src/images.ts"

with open(output_file, "w", encoding='utf-8') as f:
    f.write("export const IMAGES = {\n")
    for name in names:
        tmp_file = f"tmp_{name}.txt"
        if os.path.exists(tmp_file):
            with open(tmp_file, "r") as t:
                content = t.read()
                f.write(f'  {name}: "{content}",\n')
        else:
            f.write(f'  {name}: "",\n')
    f.write("};\n")

print(f"Updated {output_file}")
