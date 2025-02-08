import os
import json
pages = []
for file in os.listdir("public/wiki"):
    if file.endswith(".md"):
        pages.append({
          'name': file[: -3].replace('-', ' '),
          'link': file[: -3],
        })
pages.sort(key=lambda x: (x['name'] != 'Home', x['name']))

with open("src/components/wiki_sidebar.json", "w") as f:
    json.dump(pages, f)
  