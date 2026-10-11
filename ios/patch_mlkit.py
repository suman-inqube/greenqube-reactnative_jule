#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOOL = os.path.join(SCRIPT_DIR, "bin", "arm64-to-sim")
PODS_DIR = os.path.join(SCRIPT_DIR, "Pods")

FRAMEWORKS = [
    "MLImage/Frameworks/MLImage.framework/MLImage",
    "MLKitCommon/Frameworks/MLKitCommon.framework/MLKitCommon",
    "MLKitVision/Frameworks/MLKitVision.framework/MLKitVision",
    "MLKitTextRecognition/Frameworks/MLKitTextRecognition.framework/MLKitTextRecognition",
    "MLKitTextRecognitionChinese/Frameworks/MLKitTextRecognitionChinese.framework/MLKitTextRecognitionChinese",
    "MLKitTextRecognitionDevanagari/Frameworks/MLKitTextRecognitionDevanagari.framework/MLKitTextRecognitionDevanagari",
    "MLKitTextRecognitionJapanese/Frameworks/MLKitTextRecognitionJapanese.framework/MLKitTextRecognitionJapanese",
    "MLKitTextRecognitionKorean/Frameworks/MLKitTextRecognitionKorean.framework/MLKitTextRecognitionKorean",
]

def extract_ar(archive_path, out_dir):
    with open(archive_path, 'rb') as f:
        magic = f.read(8)
        if magic != b'!<arch>\n':
            return False
        idx = 0
        while True:
            header = f.read(60)
            if not header or len(header) < 60:
                break
            name = header[:16].decode('ascii', errors='ignore').strip()
            size = int(header[48:58].strip())
            data = f.read(size)
            if size % 2 == 1:
                f.read(1)
            if name.startswith('#1/'):
                namelen = int(name[3:])
                real_name = data[:namelen].decode('ascii', errors='ignore').rstrip('\x00').strip()
                real_data = data[namelen:]
            else:
                real_name = name.rstrip('/')
                real_data = data
            if real_name in ('/', '//', '__.SYMDEF', '__.SYMDEF SORTED', '__.SYMDEF_64', '__.SYMDEF_64 SORTED'):
                continue
            idx += 1
            out_file = os.path.join(out_dir, f"{idx:04d}_{os.path.basename(real_name)}")
            with open(out_file, 'wb') as out:
                out.write(real_data)
        return True

def patch_framework(rel_path):
    fw_bin = os.path.join(PODS_DIR, rel_path)
    if not os.path.isfile(fw_bin):
        return

    # Check if there is platform 2 (iOS device) in load commands
    res = subprocess.run(["otool", "-l", fw_bin], capture_output=True, text=True)
    if "platform 2" not in res.stdout:
        return

    print(f"Patching {rel_path} for iOS Simulator arm64...")
    work_dir = f"/tmp/patch_{os.path.basename(fw_bin)}_{os.getpid()}"
    shutil.rmtree(work_dir, ignore_errors=True)
    objs_dir = os.path.join(work_dir, "objs")
    os.makedirs(objs_dir, exist_ok=True)

    arm64_a = os.path.join(work_dir, "arm64.a")
    x86_64_a = os.path.join(work_dir, "x86_64.a")

    subprocess.run(["lipo", "-thin", "arm64", fw_bin, "-output", arm64_a], check=True)
    subprocess.run(["lipo", "-thin", "x86_64", fw_bin, "-output", x86_64_a], check=True)

    is_ar = extract_ar(arm64_a, objs_dir)
    arm64_sim_a = os.path.join(work_dir, "arm64_sim.a")

    if is_ar:
        for f in sorted(os.listdir(objs_dir)):
            p = os.path.join(objs_dir, f)
            subprocess.run([TOOL, p, "12", "18"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["libtool", "-static", "-o", arm64_sim_a] + [os.path.join(objs_dir, f) for f in sorted(os.listdir(objs_dir))], check=True, stderr=subprocess.DEVNULL)
    else:
        subprocess.run([TOOL, arm64_a, "12", "18"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        arm64_sim_a = arm64_a

    fat_output = os.path.join(work_dir, "fat_sim")
    subprocess.run(["lipo", "-create", arm64_sim_a, x86_64_a, "-output", fat_output], check=True)
    shutil.copyfile(fat_output, fw_bin)
    shutil.rmtree(work_dir, ignore_errors=True)
    print(f"Successfully patched {rel_path}")

def main():
    if not os.path.isfile(TOOL):
        print(f"arm64-to-sim tool not found at {TOOL}")
        sys.exit(0)
    for rel in FRAMEWORKS:
        patch_framework(rel)

if __name__ == "__main__":
    main()
