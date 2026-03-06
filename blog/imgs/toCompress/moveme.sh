#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./move-up.sh <path/to/file_opt.ext> [others...]"
    echo "Example: ./move-up.sh subfolder/*_opt.*"
    exit 1
fi

for FILE in "$@"; do
    if [[ -f "$FILE" && "$FILE" == *"_opt"* ]]; then
        DIR_NAME=$(dirname "$FILE")
        BASE_NAME=$(basename "$FILE")
        NEW_NAME="${BASE_NAME//_opt/}"
        echo "Moving: $FILE  -->  $DIR_NAME/../$NEW_NAME"
        mv "$FILE" "$DIR_NAME/../$NEW_NAME"
    fi
done

echo -e "\nMove complete!"
