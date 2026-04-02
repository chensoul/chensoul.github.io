#!/usr/bin/env python3
"""
Batch translate ByteByteGo articles.
- Translate successful articles
- Save 404 links to failed_urls.txt
"""

import sys
import os

# Read URLs from file
with open('/tmp/chensoul-blog/docs/bytebytego-archive-urls.txt', 'r') as f:
    urls = [line.strip() for line in f if line.strip()]

print(f"Total URLs: {len(urls)}")

# Process first 20 URLs for testing
batch_size = 20
start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end_idx = min(start_idx + batch_size, len(urls))

print(f"Processing URLs {start_idx} to {end_idx}")

for i, url in enumerate(urls[start_idx:end_idx], start=start_idx):
    print(f"\n[{i+1}/{len(urls)}] Processing: {url}")
    # The actual fetching and translation will be done by the agent
    print(f"URL_INDEX={i}")
    print(f"URL={url}")

print(f"\nBatch complete. Next batch starts at index {end_idx}")
