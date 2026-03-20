@echo off
title TrazaSole - Actualizar y Reiniciar
echo ========================================
echo   TRAZASOLE - Actualizar y Reiniciar
echo ========================================
echo.
cd /d "C:\TrazaSole"

echo [1/5] Deteniendo servidor actual...
taskkill /F /IM bun.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo      Servidor detenido.

echo.
echo [2/5] Descargando actualizaciones de GitHub...
git pull origin master
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ALERTA] No se pudieron descargar actualizaciones
    echo         Continuando con version actual...
) else (
    echo      Actualizaciones descargadas.
)

echo.
echo [3/5] Instalando dependencias...
bun install >nul 2>&1
echo      Dependencias instaladas.

echo.
echo [4/5] Sincronizando base de datos...
bun run db:push >nul 2>&1
bun run db:generate >nul 2>&1
echo      Base de datos sincronizada.

echo.
echo [5/5] Iniciando servidor...
echo.
echo ========================================
echo   Sistema actualizado y listo!
echo   Servidor: http://localhost:3000
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
timeout /t 3 /nobreak >nul
bun run dev
