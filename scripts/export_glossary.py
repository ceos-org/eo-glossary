# /// script
# dependencies = [
#     "pandas",
#     "pyarrow",
#     "openpyxl"
# ]
# ///

import glob
import pandas as pd
import os
import json
import re

# --- Configuration ---
INPUT_DIR = "docs/terms"
EXPORT_DIRS = {
    "parquet": "exports/parquet",
    "xlsx": "exports/xlsx",
    "json": "exports/json"
}

# Ensure directories exist
for path in EXPORT_DIRS.values():
    os.makedirs(path, exist_ok=True)

# --- Helper Functions ---

def parse_markdown_file(filepath):
    """
    Parses a single markdown file to extract term metadata and definitions.
    Returns a dictionary with the term data.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract Title (Term)
    # Looking for 'title: TermName' in front matter
    title_match = re.search(r'^title:\s*(.+)$', content, re.MULTILINE)
    if not title_match:
        print(f"Warning: No title found in {filepath}. Skipping.")
        return None
    term = title_match.group(1).strip().strip('"').strip("'")

    # Extract Tags
    tags = ""
    tags_match = re.search(r'tags:\s*(.*?)\n---', content, re.DOTALL)
    if tags_match:
        tags = tags_match.group(1).strip()

    # Extract Synonyms
    # Logic: Look for text between '**Synonyms**:' and '## 1 Definition'
    synonyms = ""
    syn_match = re.search(r'\*\*Synonyms\*\*:(.*?)(?=## 1 Definition)', content, re.DOTALL | re.IGNORECASE)
    if syn_match:
        synonyms = syn_match.group(1).strip()

    # Extract Definitions
    definitions = []
    
    # Loop through potential definition numbers (1 to 5)
    for def_no in range(1, 6):
        # Regex to find specific definition block
        # Matches: ## X Definition ...content... (until next definition or end of file)
        # We use lookahead (?=...) to stop at the next definition header or EOF
        pattern = rf"## {def_no} Definition(.*?)(?=## \d+ Definition|$)"
        def_block_match = re.search(pattern, content, re.DOTALL)
        
        if not def_block_match:
            continue

        block_content = def_block_match.group(1).strip()
        
        # Split block into Definition, Notes, Examples, Sources
        # We use a strategy of splitting by headers. 
        # Note: The order in MD files usually is Def -> Notes -> Examples -> Sources
        
        # 1. Sources (usually at the end)
        sources = ""
        if "### Sources" in block_content:
            parts = block_content.split("### Sources")
            block_content = parts[0].strip() # Remove source part from main block
            sources = parts[1].strip().replace("___", "").strip()

        # 2. Examples
        examples = ""
        if "### Examples" in block_content:
            parts = block_content.split("### Examples")
            block_content = parts[0].strip()
            examples = parts[1].strip()

        # 3. Notes
        notes = ""
        if "### Notes" in block_content:
            parts = block_content.split("### Notes")
            block_content = parts[0].strip()
            notes = parts[1].strip()

        # 4. What remains is the Definition text
        definition_text = block_content.strip()

        definitions.append({
            "definition_no": def_no,
            "definition": definition_text,
            "notes": notes,
            "examples": examples,
            "sources": sources
        })

    return {
        "term": term,
        "tags": tags,
        "synonyms": synonyms,
        "definitions": definitions
    }

# --- Main Processing ---

all_terms_data = []
markdown_files = glob.glob(os.path.join(INPUT_DIR, "*.md"))

print(f"Processing {len(markdown_files)} files...")

for file in markdown_files:
    data = parse_markdown_file(file)
    if data:
        all_terms_data.append(data)

# --- 1. Export Consolidated JSON ---
# Structure: [ {term, tags, definitions: []}, ... ]
json_path = os.path.join(EXPORT_DIRS['json'], "terms.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(all_terms_data, f, ensure_ascii=False, indent=2)
print(f"Exported: {json_path}")


# --- 2. Prepare Data for Tabular Formats (Parquet/Excel) ---

# We need a flattened list where columns represent definition_1, notes_1, definition_2, etc.
flattened_rows = []

for item in all_terms_data:
    row = {
        "term": item["term"],
        "tags": item["tags"],
        "synonyms": item["synonyms"]
    }
    
    # Map definitions by number for easy access
    defs_map = {d["definition_no"]: d for d in item["definitions"]}
    
    # Flatten up to 5 definitions
    for i in range(1, 6):
        d = defs_map.get(i, {})
        row[f"definition_{i}"] = d.get("definition", "")
        row[f"notes_{i}"] = d.get("notes", "")
        row[f"examples_{i}"] = d.get("examples", "")
        row[f"sources_{i}"] = d.get("sources", "")
    
    flattened_rows.append(row)

df_consolidated = pd.DataFrame(flattened_rows)

# Define column order for neatness
cols_order = ["term", "tags", "synonyms"]
for i in range(1, 6):
    cols_order.extend([f"definition_{i}", f"notes_{i}", f"examples_{i}", f"sources_{i}"])

# Reorder and handle missing columns if any (though loop above handles it)
df_consolidated = df_consolidated.reindex(columns=cols_order, fill_value="")

# Export Consolidated Parquet
parquet_path = os.path.join(EXPORT_DIRS['parquet'], "terms.parquet")
df_consolidated.to_parquet(parquet_path, index=False)
print(f"Exported: {parquet_path}")

# Export Consolidated Excel
xlsx_path = os.path.join(EXPORT_DIRS['xlsx'], "terms.xlsx")
df_consolidated.to_excel(xlsx_path, index=False)
print(f"Exported: {xlsx_path}")


# --- 3. Export Per-Definition Files ---
for i in range(1, 6):
    # Filter rows that actually have a definition at this number
    # We reconstruct a specific DataFrame for this definition number
    
    rows_def_i = []
    for item in all_terms_data:
        # Find the specific definition
        target_def = next((d for d in item["definitions"] if d["definition_no"] == i), None)
        
        if target_def:
            rows_def_i.append({
                "term": item["term"],
                "tags": item["tags"],
                "synonyms": item["synonyms"],
                "definition": target_def["definition"],
                "notes": target_def["notes"],
                "examples": target_def["examples"],
                "sources": target_def["sources"]
            })
            
    if not rows_def_i:
        continue
        
    df_def_i = pd.DataFrame(rows_def_i)
    
    # Export Individual Parquet
    df_def_i.to_parquet(os.path.join(EXPORT_DIRS['parquet'], f"terms_definition_{i}.parquet"), index=False)
    
    # Export Individual Excel
    df_def_i.to_excel(os.path.join(EXPORT_DIRS['xlsx'], f"terms_definition_{i}.xlsx"), index=False)
    
    # Export Individual JSON
    df_def_i.to_json(os.path.join(EXPORT_DIRS['json'], f"terms_definition_{i}.json"), orient="records", force_ascii=False)

print("Individual definition exports completed.")