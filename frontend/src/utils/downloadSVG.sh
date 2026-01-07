#!/usr/bin/env bash
set -euo pipefail

# Download SVGs from Line-MD repository
# Usage: ./downloadSVG.sh <icon-name> [more-icon-names]
# Example: ./downloadSVG.sh github map-marker

# Resolve the directory this script lives in so it can be run from any cwd
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
icons_dir="$script_dir/../assets/icons"

mkdir -p "$icons_dir"
cd "$icons_dir" || exit 1

if [ "$#" -lt 1 ]; then
	echo "Usage: $0 <icon-name> [icon-name...]" >&2
	exit 2
fi

for iconName in "$@"; do
	echo "Downloading ${iconName}..."
	curl -fL -o "./${iconName}-animated.svg" "https://raw.githubusercontent.com/cyberalien/line-md/main/svg-style/${iconName}.svg"
	curl -fL -o "./${iconName}-static.svg" "https://raw.githubusercontent.com/cyberalien/line-md/main/svg/${iconName}.svg"
done

echo "Icons saved to: $icons_dir"