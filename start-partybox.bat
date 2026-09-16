@echo off
setlocal EnableDelayedExpansion
title PartyBox
cd /d "%~dp0"

set PORT=42069
if not "%~1"=="" set PORT=%~1

echo.
echo  ==============================================
echo   PartyBox  -  starting on port %PORT%
echo  ==============================================
echo.

rem --- 1. Node + pnpm -------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo  [!] Node.js was not found. Install Node 24+ from https://nodejs.org and run this again.
  pause
  exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo  [i] pnpm not found - enabling it through corepack...
  call corepack enable
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo  [!] Could not enable pnpm. Run "corepack enable" in an elevated prompt, then retry.
    pause
    exit /b 1
  )
)

rem --- 2. Windows Firewall rule (one UAC prompt, only the first time) --------------
if "%PARTYBOX_NO_FIREWALL%"=="1" goto deps
netsh advfirewall firewall show rule name="PartyBox" >nul 2>nul
if errorlevel 1 (
  echo  [i] Allowing phones to reach port %PORT% - accept the Windows prompt...
  powershell -NoProfile -Command "Start-Process netsh -Verb RunAs -Wait -ArgumentList 'advfirewall firewall add rule name=\"PartyBox\" dir=in action=allow protocol=TCP localport=%PORT%'"
  netsh advfirewall firewall show rule name="PartyBox" >nul 2>nul
  if errorlevel 1 echo  [!] Firewall rule not added - phones on other devices may not connect.
)

:deps
rem --- 3. Dependencies + build ----------------------------------------------------
if not exist "node_modules\" (
  echo  [i] First run: installing dependencies...
  call pnpm install
  if errorlevel 1 ( echo  [!] pnpm install failed. & pause & exit /b 1 )
)
echo  [i] Building the client...
call pnpm build >nul
if errorlevel 1 (
  echo  [!] Build failed - running it again with output:
  call pnpm build
  pause
  exit /b 1
)
rem Background music for the TV (Kevin MacLeod, CC BY 4.0): fetched once into
rem packages\client\public\music; a failed download only means a silent lobby.
echo  [i] Checking background music...
call pnpm fetch-music

rem --- 4. Open the TV page once the server is up, then run the server here ----------
rem --dev-api powers the TV's Home button (start over). It is an unauthenticated LAN control API,
rem fine for a living room; set PARTYBOX_NO_DEV_API=1 to run without it.
set DEVAPI=--dev-api
if "%PARTYBOX_NO_DEV_API%"=="1" set DEVAPI=
rem (full path: a Unix "timeout" on PATH would shadow the Windows one)
start "" /b cmd /c "%SystemRoot%\System32\timeout.exe /t 4 /nobreak >nul & start "" http://localhost:%PORT%/tv"
echo.
echo  The TV page opens in your browser in a moment (F11 for full screen, or cast the tab).
echo  Phones scan the QR on the TV, or open the http://LAN-IP:%PORT% address printed below.
echo  The house icon top-left on the TV (click it twice) starts over with a fresh lobby.
echo  Close this window (or press Ctrl+C) to stop the party.
echo.
call pnpm start --port %PORT% %DEVAPI%
echo.
echo  PartyBox stopped.
pause
