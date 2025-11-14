#!/bin/bash
cd /home/kavia/workspace/code-generation/music-streamer-190205-190217/spotify_clone_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

