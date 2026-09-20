@echo off
cd /d %~dp0reference-final
python -m http.server 8080
