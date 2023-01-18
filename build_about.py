import httpx
import pathlib
import re
import sys

root = pathlib.Path(__file__).parent.resolve()

def replace_chunk(content, marker, chunk, inline=False):
    r = re.compile(
        r"<!\-\- {} starts \-\->.*<!\-\- {} ends \-\->".format(marker, marker),
        re.DOTALL,
    )
    if not inline:
        chunk = "\n{}\n".format(chunk)
    chunk = "<!-- {} starts -->{}<!-- {} ends -->".format(marker, chunk, marker)
    return r.sub(chunk, content)

def fetch_github_readme():
     return httpx.get(
         "https://raw.githubusercontent.com/chensoul/chensoul/main/README.md"
     )

if __name__ == "__main__":
    file = root.joinpath(sys.argv[1])
    readme_text = "\n"+fetch_github_readme().text

    readme_contents = file.open().read()
    rewritten = replace_chunk(readme_contents, "readme", readme_text)

    file.open("w").write(rewritten)
