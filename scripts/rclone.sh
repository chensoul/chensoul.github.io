#!/usr/bin/env bash

rclone sync public/images r2:cos/images -P
rclone sync public/favicons r2:cos/favicons -P
rclone sync public/feeds r2:cos/feeds -P


