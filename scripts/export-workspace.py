#!/usr/bin/env python3
import os
import shutil
import zipfile

root = "/agent"
name = "project-export.zip"
skip = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".next",
    ".cache",
    ".turbo",
    "artifacts",
    "agent-tools",
}
skip_files = {
    ".export-workspace.sh",
    "export-workspace.sh",
    "project-export.zip",
    "project-snapshot.zip",
    "project-snapshot.status",
}


def usable(d):
    try:
        return os.path.isdir(d) and os.access(d, os.W_OK)
    except OSError:
        return False


def pick_dir(cands):
    for d in cands:
        if usable(d):
            return d
    for d in cands:
        try:
            os.makedirs(d, exist_ok=True)
        except OSError:
            continue
        if usable(d):
            return d
    return ""


prefer = ["/opt/BrainDaemon/artifacts", "/opt/cursor/artifacts"]
dest = pick_dir(prefer)
if not dest:
    print("EXPORT_NO_DIR")
else:
    out = os.path.join(dest, name)
    n = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, dn, fn in os.walk(root):
            dn[:] = [d for d in dn if d not in skip]
            for f in fn:
                if f in skip_files:
                    continue
                p = os.path.join(dp, f)
                if os.path.abspath(dp) == os.path.abspath(root):
                    continue
                z.write(p, os.path.relpath(p, root))
                n += 1
    for d in prefer:
        alt = os.path.join(d, name)
        if os.path.abspath(alt) == os.path.abspath(out):
            continue
        if not usable(d):
            try:
                os.makedirs(d, exist_ok=True)
            except OSError:
                continue
        if usable(d):
            try:
                shutil.copy2(out, alt)
            except OSError:
                pass
    print(f"EXPORT_OK files={n} bytes={os.path.getsize(out)}")
