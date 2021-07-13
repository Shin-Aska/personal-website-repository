import os
import json

def scan(folder, mode=1):
    results = []
    for i in os.scandir(folder):
        if mode == 1:
            if i.is_file():
                results.append(i)
        if mode == 2:
            if i.is_dir():
                results.append(i)
    return results

if __name__ == "__main__":
    result = {}
    folders = scan("gallery", 2)
    for folder in folders:
        result[folder.name] = {
            "path": folder.path,
            "files": []
        }
        files = scan(folder.path)
        for file in files:
            if file.name == ".directory":
                continue
            result[folder.name]["files"].append({
                "name": file.name,
                "path": file.path
            })
    f = open("gallery.js", "w")
    f.write("var pictures = " + json.dumps(result))
    f.close()
    