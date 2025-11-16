@echo off
setlocal enabledelayedexpansion

REM ----------------------------------------
REM Input handling (drag-and-drop supported)
REM ----------------------------------------
if "%~1"=="" (
    echo Usage:
    echo   web-image-opt.bat ^<imagefile^>
    echo Or drag-and-drop an image onto this script.
    pause
    exit /b
)

set INPUT=%~1
set BASENAME=%~n1
set EXT=%~x1

echo.
echo ==============================
echo  Web Image Optimizer
echo ==============================
echo Input file: %INPUT%
echo.

@REM  determine file size, and pick default (either 2 or 6 depending on size)

REM ----------------------------------------
REM  Choose resize option
@REM options should be 4 for tiny images (120x90-720x540), and 4 for larger images (720x540-1920x1080)
REM ----------------------------------------
echo Choose output size:
echo  -- For smaller images (e.g. thumbnails):
echo   1. Tiny   (max 120 x 90)
echo   2. Small   (max 360 x 270) (default)
echo   3. Medium  (max 540 x 405)
echo   4. Large   (max 720 x 540)
echo[
echo  -- For larger images (e.g. full-size):
echo   5. Small (max 720 x 540)
echo   6. Medium (max 1280 x 960)
echo   7. Large (max 1920 x 1080)
echo[
echo  -- 
echo   9. No resize - compress only
echo.

set /p sizeChoice="Enter option number: "

if "%sizeChoice%"=="1" set SIZE=200x170
if "%sizeChoice%"=="2" set SIZE=360x270
if "%sizeChoice%"=="3" set SIZE=540x405
if "%sizeChoice%"=="4" set SIZE=720x540
if "%sizeChoice%"=="5" set SIZE=720x540
if "%sizeChoice%"=="6" set SIZE=1280x960
if "%sizeChoice%"=="7" set SIZE=1920x1080
if "%sizeChoice%"=="9" set SIZE=

@REM no value = default to option 1
if not defined SIZE set SIZE=360x270
@REM if not defined SIZE goto skipResize

echo.
echo Output will be resized to fit within %SIZE% (aspect ratio preserved).

:chooseFormat
echo.
echo Choose output format:
echo   1. WEBP (best compression) (default)
echo   2. JPEG (small file, slightly more loss)
set /p fmt="Enter option number: "

if "%fmt%"=="1" set OUTEXT=webp
if "%fmt%"=="2" set OUTEXT=jpg
if not defined OUTEXT set OUTEXT=webp
@REM if not defined OUTEXT (
@REM     echo Invalid selection.
@REM     goto chooseFormat
@REM )

echo.
echo Processing...

if defined SIZE (
    magick "%INPUT%" -resize %SIZE% -quality 80 "%BASENAME%_compressed.%OUTEXT%"
    echo Done! Created: %BASENAME%_compressed.%OUTEXT%
    goto finished
)

:skipResize
echo.
echo No resize selected - compress only.
echo Choose compressed output format:
echo   1. WEBP
echo   2. JPEG
set /p compFmt="Enter option number: "

if "%compFmt%"=="1" (
    magick "%INPUT%" -quality 80 "%BASENAME%_compressed.webp"
    echo Done! Created: %BASENAME%_compressed.webp
    goto finished
)

if "%compFmt%"=="2" (
    magick "%INPUT%" -quality 80 "%BASENAME%_compressed.jpg"
    echo Done! Created: %BASENAME%_compressed.jpg
    goto finished
)

echo Invalid choice.
goto skipResize

:finished
echo.
echo All done!
exit /b
