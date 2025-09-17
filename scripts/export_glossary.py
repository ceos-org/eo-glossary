import glob
import pandas as pd 
import os
import json
from collections import defaultdict

os.makedirs("exports/parquet/", exist_ok=True)
os.makedirs("exports/xlsx/", exist_ok=True)
os.makedirs("exports/json/", exist_ok=True)

# store everything for the consolidated JSON
consolidated = defaultdict(lambda: {
    "tags": "",
    "synonyms": "",
    "definitions": []
})

for definition_no in list(range(1,6)):

    all_files = []
    for file in glob.glob("docs/terms/*.md"):

        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        #---
        try: 
            title = content.split("title: ")[1].strip().split("\n")[0].strip()
        except:
            print(file)
            continue
        #---
        tags = ""
        header = content.split("---")[1]
        try: 
            tags = header.split("tags:")[1].strip().split("---")[0].strip()
        except IndexError:
            pass
        #---
        synonyms = ""
        relevant_passage = content.split("## 1 Definition")[0]
        try: 
            synonyms = relevant_passage.split(f"**Synonyms**:")[1].strip().split("## 1 Definition")[0].strip()
        except IndexError:
            pass
        #---
        try:
            relevant_content = content.split(f"## {definition_no} Definition")[1].strip().split("___")[0].strip()
        except IndexError:
            continue
        #---
        definition = relevant_content.split("### Notes")[0].strip()
        #---
        try:
            notes = relevant_content.split("### Notes")[1].strip().split("### Examples")[0].strip()
        except:
            notes = ""
        #---
        try:
            examples = relevant_content.split("### Examples")[1].strip().split("### Sources")[0].strip()
        except:
            examples = ""
        #---
        try:
            sources = relevant_content.split("### Sources")[1].strip().split("___")[0].strip()
        except:
            sources = ""
        #---

        all_cols = [title,tags,synonyms,definition,notes,examples,sources]
        all_files.append(all_cols)

        # add to consolidated structure
        if not consolidated[title]["tags"]:
            consolidated[title]["tags"] = tags
        if not consolidated[title]["synonyms"]:
            consolidated[title]["synonyms"] = synonyms
        consolidated[title]["definitions"].append({
            "definition_no": definition_no,
            "definition": definition,
            "notes": notes,
            "examples": examples,
            "sources": sources
        })

    df = pd.DataFrame(all_files, columns=["term","tags","synonyms","definition","notes","examples","sources"])

    df.to_parquet(f"exports/parquet/terms_definition_{definition_no}.parquet",index=False)
    df.to_excel(f"exports/xlsx/terms_definition_{definition_no}.xlsx",index=False)
    df.to_json(f"exports/json/terms_definition_{definition_no}.json", orient="records", force_ascii=False)

# --- Write consolidated JSON ---
consolidated_list = []
for term, data in consolidated.items():
    consolidated_list.append({
        "term": term,
        "tags": data["tags"],
        "synonyms": data["synonyms"],
        "definitions": data["definitions"]
    })

with open("exports/json/terms_consolidated.json", "w", encoding="utf-8") as f:
    json.dump(consolidated_list, f, ensure_ascii=False, indent=2)
