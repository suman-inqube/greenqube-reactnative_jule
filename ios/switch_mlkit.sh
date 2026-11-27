#!/bin/bash
set -e

# Pods root directory
PODS_DIR="${PODS_ROOT:-$SRCROOT/Pods}"

# Determine target platform: "iphoneos" (device) or "iphonesimulator" (simulator)
TARGET_PLAT="${PLATFORM_NAME:-iphoneos}"

if [ "$TARGET_PLAT" = "iphonesimulator" ]; then
  SUFFIX="simulator"
else
  SUFFIX="device"
fi

LIBS=(
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

for REL in "${LIBS[@]}"; do
  TARGET="$PODS_DIR/$REL"
  DIR=$(dirname "$TARGET")
  BASE=$(basename "$TARGET")

  if [ -f "$DIR/$BASE.$SUFFIX" ]; then
    rm -f "$TARGET"
    ln -s "$BASE.$SUFFIX" "$TARGET"
  fi
done
