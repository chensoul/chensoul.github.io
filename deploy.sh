#!/bin/bash

echo "\033[0;32mConverte jpg/jpeg/JPG to png...\033[0m"

brew install sip

cd static/raw-images

for file in *.jpg; do
    sips -s format png "$file" --out "${file%.jpg}.png"
done

for file in *.jpeg; do
    sips -s format png "$file" --out "${file%.jpeg}.png"
done

for file in *.JPG; do
    sips -s format png "$file" --out "${file%.JPG}.png"
done

rm -rf *.jpeg *.jpg *.JPG

cd ../..

echo "\033[0;32mConverte jpg/jpeg/JPG/png to webp...\033[0m"

npm run images:optimize

cp static/raw-images/*.webp static/images/

echo "\033[0;32mDeploying updates to GitHub...\033[0m"

sed -i "" "s#(/images#(../../../static/images#g" content/posts/*/*.md
sed -i "" "s#(../../../static/images#(/images#g" content/posts/*/*.md

# Build the project.
hugo # if using a theme, replace by `hugo -t <yourtheme>`

# Add changes to git.
git add -A

# Commit changes.
msg="Rebuilding site `date '+%Y-%m-%d %H:%M'`"
if [ $# -eq 1 ]
  then msg="$1"
fi
git commit -m "$msg"

# Push source and build repos.
git push origin main
