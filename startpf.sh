#!/bin/sh

hugo
# --bundle-dir 的路径是相对于 --source 指定的路径
npm_config_yes=true npx pagefind --source "public/posts" --bundle-dir ../../static/_pagefind
hugo server