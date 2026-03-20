@echo off
title TrazaSole - Backup Sistema
setlocal enabledelayedexpansion

:: Configuracion
set "TRAZASOLE_DIR=C:\TrazaSole"
set "BACKUP_DIR=C:\TrazaSole\backups"
set "PG_DIR=C:\Program Files\PostgreSQL\16\bin"
set "DB_NAME=trazasole"
set "DB_USER=postgres"
set "DB_PASS=1810"

:: Obtener fecha y hora
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "datetime=%%I"
set "FECHA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%"
set "HORA=%datetime:~8,2%-%datetime:~10,2%"
set "BACKUP_NAME=backup_%FECHA%_%HORA%"

echo ========================================
echo   TRAZASOLE - Backup del Sistema
echo ========================================
echo.
echo Fecha: %FECHA%
echo Hora:  %HORA%
echo.

:: Crear carpeta de backups si no existe
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Crear carpeta para este backup
set "BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%"
mkdir "%BACKUP_PATH%"
echo [1/4] Carpeta creada: %BACKUP_NAME%

:: Backup de la base de datos PostgreSQL
echo.
echo [2/4] Exportando base de datos...
set "PGPASSWORD=%DB_PASS%"
"%PG_DIR%\pg_dump.exe" -U %DB_USER% -h localhost -d %DB_NAME% -F c -f "%BACKUP_PATH%\base_datos.backup" >nul 2>&1

if exist "%BACKUP_PATH%\base_datos.backup" (
    echo      Base de datos exportada: base_datos.backup
) else (
    echo      [ADVERTENCIA] No se pudo exportar con pg_dump
    echo      Intentando backup alternativo...
    
    :: Backup alternativo: copiar archivos de datos
    if exist "%TRAZASOLE_DIR%\prisma\dev.db" (
        copy "%TRAZASOLE_DIR%\prisma\dev.db" "%BACKUP_PATH%\dev.db" >nul
        echo      Backup SQLite: dev.db
    )
)

:: Backup de archivos importantes
echo.
echo [3/4] Copiando archivos de configuracion...
copy "%TRAZASOLE_DIR%\.env" "%BACKUP_PATH%\.env" >nul 2>&1
copy "%TRAZASOLE_DIR%\package.json" "%BACKUP_PATH%\package.json" >nul 2>&1
if exist "%TRAZASOLE_DIR%\prisma\schema.prisma" (
    copy "%TRAZASOLE_DIR%\prisma\schema.prisma" "%BACKUP_PATH%\schema.prisma" >nul 2>&1
)
echo      Archivos de configuracion copiados.

:: Crear archivo de informacion
echo.
echo [4/4] Generando informe...
(
    echo BACKUP TRAZASOLE
    echo ===============
    echo Fecha: %FECHA%
    echo Hora:  %HORA%
    echo Version Sistema: 3.0.1
    echo Base de datos: %DB_NAME%
    echo.
    echo Archivos incluidos:
    echo - base_datos.backup (PostgreSQL dump)
    echo - .env (configuracion)
    echo - package.json (dependencias)
    echo - schema.prisma (modelo de datos)
) > "%BACKUP_PATH%\info.txt"

:: Calcular tamaño
for /f "tokens=3" %%a in ('dir /s "%BACKUP_PATH%" ^| find "File(s)"') do set "SIZE=%%a"

echo.
echo ========================================
echo   Backup completado!
echo ========================================
echo.
echo Carpeta: %BACKUP_PATH%
echo.
echo Contenido:
dir /b "%BACKUP_PATH%"
echo.
echo ========================================
echo.
pause
