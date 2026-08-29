#!/usr/bin/env bash
set -euo pipefail

asset_dir="assets/figma"
mkdir -p "$asset_dir"

curl -fsSL "https://www.figma.com/api/mcp/asset/b8f7d6cd-b05c-41ab-945c-3df86f452cbc.svg" -o "$asset_dir/auth-background.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/c67258c6-8dbd-46f3-b74a-1270110014dc.svg" -o "$asset_dir/auth-illustration-background.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/51f3204f-4c9b-491e-89ee-a46a1df1ca60.svg" -o "$asset_dir/auth-illustration-shape.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/86cfe962-45c8-4ca1-9dba-9111fa1fa364.svg" -o "$asset_dir/auth-illustration-window.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/94fd83e0-7f53-4fc6-bbed-8f5ad1fb2aaa.svg" -o "$asset_dir/auth-illustration-character.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/bb0b61dd-348c-4c24-91de-77fb2a9f5901.svg" -o "$asset_dir/auth-illustration-speech.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/b84162d0-8ac7-4459-a3ff-f95d29018e02.svg" -o "$asset_dir/google.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/9a7bc727-7f0d-45d8-96ac-b31a3e948431.svg" -o "$asset_dir/apple.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/787dee29-fe3b-4406-b463-0200db1e7d95.png" -o "$asset_dir/friendly-triangles.png"
curl -fsSL "https://www.figma.com/api/mcp/asset/57ea2cad-d99d-4a40-89f8-307141ef5341.svg" -o "$asset_dir/chat-illustration-background.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/f179e700-8c75-4969-a78c-842b79d4a733.svg" -o "$asset_dir/chat-illustration-plants.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/e715cfe4-c45f-487b-b021-00701d55d470.svg" -o "$asset_dir/chat-question-marks.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/7e40b511-363b-412c-8bd5-d2b583b719ae.svg" -o "$asset_dir/chat-question-mark.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/7644fbb5-0ed4-441a-af0f-c077a65e4862.png" -o "$asset_dir/avatar-default.png"
curl -fsSL "https://www.figma.com/api/mcp/asset/66522243-968a-4960-87b4-94cfcb5f0e9c.svg" -o "$asset_dir/avatar-eyes-cry.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/b5ba9371-7c16-446a-8fb3-af021a284515.svg" -o "$asset_dir/avatar-eyes-happy.svg"
curl -fsSL "https://www.figma.com/api/mcp/asset/502a0680-adb1-46d7-ba2f-08ca4afa6fb4.svg" -o "$asset_dir/avatar-hoodie.svg"

echo "Downloaded Moodify Figma assets to $asset_dir"
