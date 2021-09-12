#!/bin/bash

# If a command fails then the deploy stops
set -e

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

#git submodule add -b master git@github.com:javachen/javachen.github.io.git public

# Build the project.
hugo # if using a theme, replace by `hugo -t <yourtheme>`

# Commit changes.
msg="rebuilding site `date`"
if [ $# -eq 1 ]
  then msg="$1"
fi


git pull
git add .
git commit -am "$msg"
git push origin hugo
