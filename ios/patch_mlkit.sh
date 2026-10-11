#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="$SCRIPT_DIR/bin/arm64-to-sim"
PODS_DIR="$SCRIPT_DIR/Pods"

if [ ! -f "$TOOL" ]; then
    echo "arm64-to-sim not found at $TOOL"
    exit 0
fi

FRAMEWORKS=(
  "MLImage/Frameworks/MLImage.framework/MLImage"
  "MLKitCommon/Frameworks/MLKitCommon.framework/MLKitCommon"
  "MLKitVision/Frameworks/MLKitVision.framework/MLKitVision"
  "MLKitTextRecognition/Frameworks/MLKitTextRecognition.framework/MLKitTextRecognition"
  "MLKitTextRecognitionCommon/Frameworks/MLKitTextRecognitionCommon.framework/MLKitTextRecognitionCommon"
  "MLKitTextRecognitionChinese/Frameworks/MLKitTextRecognitionChinese.framework/MLKitTextRecognitionChinese"
  "MLKitTextRecognitionDevanagari/Frameworks/MLKitTextRecognitionDevanagari.framework/MLKitTextRecognitionDevanagari"
  "MLKitTextRecognitionJapanese/Frameworks/MLKitTextRecognitionJapanese.framework/MLKitTextRecognitionJapanese"
  "MLKitTextRecognitionKorean/Frameworks/MLKitTextRecognitionKorean.framework/MLKitTextRecognitionKorean"
)

for rel in "${FRAMEWORKS[@]}"; do
    FW_BIN="$PODS_DIR/$rel"
    if [ ! -f "$FW_BIN" ]; then
        continue
    fi
    
    IS_DEVICE=$(otool -l "$FW_BIN" | grep -A 3 "LC_BUILD_VERSION" | grep "platform 2" || true)
    if [ -z "$IS_DEVICE" ]; then
        continue
    fi

    echo "Patching $rel for arm64 iOS Simulator..."
    WORK_DIR="/tmp/patch_work_$$"
    rm -rf "$WORK_DIR"
    mkdir -p "$WORK_DIR/objs"

    lipo -thin arm64 "$FW_BIN" -output "$WORK_DIR/arm64.a"
    lipo -thin x86_64 "$FW_BIN" -output "$WORK_DIR/x86_64.a"

    cd "$WORK_DIR/objs"
    ar -x "$WORK_DIR/arm64.a"

    for obj in *.o; do
        if [ -f "$obj" ]; then
            "$TOOL" "$obj" 12 18 >/dev/null 2>&1 || true
        fi
    done

    libtool -static -o "$WORK_DIR/arm64_sim.a" *.o 2>/dev/null
    lipo -create "$WORK_DIR/arm64_sim.a" "$WORK_DIR/x86_64.a" -output "$WORK_DIR/sim_fat"
    cp "$WORK_DIR/sim_fat" "$FW_BIN"
    rm -rf "$WORK_DIR"
done
