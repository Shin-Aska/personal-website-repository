import os
import json
import re

def natural_sort_key(s):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", s)]

def scan(folder, mode=1):
    results = []
    for i in os.scandir(folder):
        if mode == 1:
            if i.is_file():
                results.append(i)
        if mode == 2:
            if i.is_dir():
                results.append(i)
    results.sort(key=lambda e: natural_sort_key(e.name))
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
        slides = ""
        thumbnails = ""
        total = len(result[gallery]["files"])
        for idx, file in enumerate(result[gallery]["files"]):
            n = idx + 1
            slides += (
                '<div class="mySlides">'
                '  <div class="numbertext">%d / %d</div>'
                '  <a href="%s" target="_blank">'
                '    <img src="%s" class="imageSlide">'
                '  </a>'
                '</div>'
            ) % (n, total, file["path"], file["path"])

            thumbnails += (
                '<div class="column"><img class="demo cursor" src="%s" id="slideImage_%d"></div>'
            ) % (file["path"], n)

        css = """
            html, body {
              margin: 0;
              padding: 0;
              background: transparent;
            }

            body {
              overflow: hidden;
            }

            .mySlides {
              display: none;
            }

            .numbertext {
              background: black;
            }

            .imageSlide {
              width: 100%;
              height: 416px;
              object-fit: cover;
              display: block;
            }

            .column {
              display: inline;
            }

            .column > .demo {
              width: 148px;
              height: 120px;
              object-fit: cover;
            }

            #thumbnailContainer {
              white-space: nowrap;
              overflow: auto;
            }
        """
        doc = f"""
        <html>
        <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
            <meta name="color-scheme" content="light only">
            <meta name="darkreader-lock">
            <link href=\"css/slideshow.css\" rel=\"stylesheet\" type=\"text/css\">
            <style>
                {css}
            </style>
        </head>
            <body>
                <div class=\"container\">
                    <div id=\"slideContainer\">{slides}</div>
                    <a id=\"prevBtn\" class=\"prev\">&#10094;</a>
                    <a id=\"nextBtn\" class=\"next\">&#10095;</a>
                    <div class=\"caption-container\"><p id=\"caption\"></p></div>
                    <div class=\"row\" id=\"thumbnailContainer\">{thumbnails}</div>
                </div>
                <script>
                    var slideIndex = 1;

                    function resizeIframeToContent() {{
                        try {{
                            var iframe = window.frameElement;
                            if (!iframe) {{
                                return;
                            }}
                            var h = Math.max(
                                document.body ? document.body.scrollHeight : 0,
                                document.documentElement ? document.documentElement.scrollHeight : 0
                            );
                            if (h > 0) {{
                                iframe.style.height = h + "px";
                            }}
                        }} catch (e) {{
                        }}
                    }}

                    function plusSlides(n) {{
                        showSlides(slideIndex += n);
                    }}

                    function currentSlide(n) {{
                        showSlides(slideIndex = n);
                    }}

                    function showSlides(n) {{
                        var i;
                        var slides = document.getElementsByClassName("mySlides");
                        var dots = document.getElementsByClassName("demo");
                        if (slides.length === 0) {{
                            return;
                        }}
                        if (n > slides.length) {{ slideIndex = 1 }}
                        if (n < 1) {{ slideIndex = slides.length }}
                        for (i = 0; i < slides.length; i++) {{
                            slides[i].style.display = "none";
                        }}
                        for (i = 0; i < dots.length; i++) {{
                            dots[i].className = dots[i].className.replace(" active", "");
                        }}
                        slides[slideIndex - 1].style.display = "block";
                        if (dots[slideIndex - 1]) {{
                            dots[slideIndex - 1].className += " active";
                            dots[slideIndex - 1].scrollIntoView({{behavior: "smooth", block: "nearest", inline: "nearest"}});
                        }}
                    }}

                    for (var i = 0; i < {total}; i++) {{
                        var el = document.getElementById("slideImage_" + (i + 1));
                        if (!el) continue;
                        el.onclick = function(elem) {{
                            var chosenId = elem.target.id.split("_")[1];
                            currentSlide(parseInt(chosenId));
                        }}
                    }}

                    var nextBtn = document.getElementById("nextBtn");
                    if (nextBtn) {{
                        nextBtn.onclick = function() {{ plusSlides(1); }}
                    }}
                    var prevBtn = document.getElementById("prevBtn");
                    if (prevBtn) {{
                        prevBtn.onclick = function() {{ plusSlides(-1); }}
                    }}

                    showSlides(slideIndex);
                    window.addEventListener("load", resizeIframeToContent);
                </script>
            </body>
        </html>
        """
        f.write(doc)
        f.close()
    #f = open("gallery.js", "w")
    #f.write("var pictures = " + json.dumps(result))
    #f.close()