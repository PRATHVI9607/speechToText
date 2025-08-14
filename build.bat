@echo off
echo Building Speech To Text Application...

rem Create executable
pyinstaller SpeechToText.spec

echo Build completed!
echo Executable can be found in the dist/SpeechToText folder

rem Check if Inno Setup is installed
if exist "%PROGRAMFILES(X86)%\Inno Setup 6\ISCC.exe" (
    echo Creating installer...
    "%PROGRAMFILES(X86)%\Inno Setup 6\ISCC.exe" installer_script.iss
    echo Installer created successfully! Check the installer folder.
) else (
    echo Inno Setup 6 not found. Please install it to create the installer.
    echo You can download it from: https://jrsoftware.org/isdl.php
)
