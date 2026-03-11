@echo off
start powershell -Command "$env:OLLAMA_ORIGINS='http://localhost:3000'; ollama serve"
timeout /t 5
start cmd /k "cd backend && node server.js"
start cmd /k "npm start"