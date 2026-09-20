@echo off
cd /d %~dp0starter
python -m http.server 8080
