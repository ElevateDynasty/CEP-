import os
from pathlib import Path

def generate_tree(dir_path, prefix="", ignore_dirs=None, max_depth=3, current_depth=0):
    if ignore_dirs is None:
        ignore_dirs = {'.git', 'node_modules', '__pycache__', 'venv', 'env', '.venv', 'staticfiles', 'dataset', 'media', '.pytest_cache'}
    
    if current_depth > max_depth:
        return ""
        
    tree_str = ""
    path = Path(dir_path)
    
    try:
        items = sorted([item for item in path.iterdir() if item.name not in ignore_dirs])
    except Exception as e:
        return f"{prefix} [Error reading directory]\n"
        
    for i, item in enumerate(items):
        is_last = i == len(items) - 1
        connector = "└── " if is_last else "├── "
        tree_str += f"{prefix}{connector}{item.name}\n"
        
        if item.is_dir():
            extension = "    " if is_last else "│   "
            tree_str += generate_tree(item, prefix + extension, ignore_dirs, max_depth, current_depth + 1)
            
    return tree_str

if __name__ == "__main__":
    root_dir = "D:/Greed_Recognition/CEP-"
    print(f"{Path(root_dir).name}/")
    print(generate_tree(root_dir, max_depth=3))
