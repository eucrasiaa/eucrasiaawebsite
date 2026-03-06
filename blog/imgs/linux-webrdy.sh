#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./web-image-opt.sh <imagefile1> [imagefile2 ...]"
    echo "Example: ./web-image-opt.sh image.png or ./web-image-opt.sh ./*"
    exit 1
fi

echo -e "\n=============================="
echo "Wills wonderful Web Image Optimizer"
echo "=============================="

echo "Choose output size:"
echo "1. Tiny (120x90)       2. Small (360x270 - Default)"
echo "3. Medium (540x405)    4. Large (720x540)"
echo "5. High-Res Small (720x540)  6. Medium (1280x960)"
echo "7. Large (1920x1080)   9. No resize - compress only"
read -p "Enter option number: " sizeChoice

case $sizeChoice in
    1) SIZE="120x90" ;;
    2) SIZE="360x270" ;;
    3) SIZE="540x405" ;;
    4) SIZE="720x540" ;;
    5) SIZE="720x540" ;;
    6) SIZE="1280x960" ;;
    7) SIZE="1920x1080" ;;
    9) SIZE="" ;;
    *) SIZE="360x270" ;; 
esac

# only once if handling multi!
echo -e "\nChoose output format:"
echo "1. WEBP (best compression) (default)"
echo "2. JPEG (small file)"
read -p "Enter option number: " fmtChoice

if [ "$fmtChoice" == "2" ]; then
    OUTEXT="jpg"
    PARAMS="-quality 85"
else
    OUTEXT="webp"
    PARAMS="-quality 75 -define webp:lossless=false"
fi

#proces
for FILE in "$@"; do
    # just safety check
    if [[ -f "$FILE" && "$FILE" =~ \.(png|jpg|jpeg|webp)$ ]]; then
        BASENAME="${FILE%.*}"
        OUTPUT="${BASENAME}_opt.${OUTEXT}"
        
        echo "Processing: $FILE -> $OUTPUT"
        
        # Exif data orient fix? 
        if [ -n "$SIZE" ]; then
            magick "$FILE" -auto-orient -resize "$SIZE>" $PARAMS "$OUTPUT"
        else
            magick "$FILE" -auto-orient $PARAMS "$OUTPUT"
        fi
    fi
done

echo -e "\nAll done!"
