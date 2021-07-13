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
    print(result)
    for gallery in result:
        f = open("gallery_%s.html" % (gallery), "w")
        images = ""
        for file in result[gallery]["files"]:
            images += "<a href='%s' target='_blank'><img src='%s' /></a>" % (file["path"], file["path"])
        css = """
            img {
              width: 150px;
              height: 300px;
              object-fit: cover;
            }

            h1 {
              text-transform: capitalize;
            }
        """
        doc = f"""
        <html>
        <head>
            <style>
                {css}
            </style>
        </head>
            <body>
                <center>
                    <h1>{gallery}</h1>
                    <br>
                    {images}
                </center>
            </body>
        </html>
        """
        f.write(doc)
        f.close()
    #f = open("gallery.js", "w")
    #f.write("var pictures = " + json.dumps(result))
    #f.close()
    