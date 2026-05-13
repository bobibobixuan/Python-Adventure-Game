@echo off
echo === Python Adventure Game - Build Script ===
echo.

pip install pyinstaller
pip install -r requirements.txt

echo.
echo === Building... ===
pyinstaller --clean pyinstaller.spec

echo.
echo === Build complete ===
echo Output: dist\game\
echo Run: dist\game\game.exe
pause
