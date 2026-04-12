import base64
import os

files = [
    r"C:\Users\User\.gemini\antigravity\brain\79767060-8308-42b2-bed3-9fd06557adf5\media__1776031264171.jpg",
    r"C:\Users\User\.gemini\antigravity\brain\79767060-8308-42b2-bed3-9fd06557adf5\media__1776031264175.jpg",
    r"C:\Users\User\.gemini\antigravity\brain\79767060-8308-42b2-bed3-9fd06557adf5\media__1776031267993.jpg",
    r"C:\Users\User\.gemini\antigravity\brain\79767060-8308-42b2-bed3-9fd06557adf5\media__1776031268108.jpg",
    r"C:\Users\User\.gemini\antigravity\brain\79767060-8308-42b2-bed3-9fd06557adf5\media__1776031268415.png"
]

names = ["room", "city", "art", "culture", "profile"]

for i, f in enumerate(files):
    if os.path.exists(f):
        with open(f, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            ext = f.split('.')[-1]
            mime = "image/png" if ext == "png" else "image/jpeg"
            print(f"{names[i]}: data:{mime};base64,{encoded_string[:50]}...{encoded_string[-50:]} (LEN: {len(encoded_string)})")
            # For the actual update, I'll need the full string, but I can't print it all at once easily without hitting output limits if it's huge.
            # I'll write the full content to a temp file or just process one by one.
            with open(f"tmp_{names[i]}.txt", "w") as out:
                out.write(f"data:{mime};base64,{encoded_string}")
    else:
        print(f"File not found: {f}")
