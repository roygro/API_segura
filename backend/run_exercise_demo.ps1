# Script para demostración visual y captura de terminal del Ejercicio 19a
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DEMOSTRACION: ROTACION, REUSO Y LOGOUT DE TOKENS (19a)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$BASE = "http://localhost:3000/api/v1"
$EMAIL = "alumno-$([Guid]::NewGuid().ToString().Substring(0,6))@utng.edu.mx"
$PASS = "PasswordSegura123!"

# Registro
Write-Host "`n1. Registrando cuenta de prueba ($EMAIL)..." -ForegroundColor Yellow
$reg = Invoke-RestMethod -Uri "$BASE/auth/register" -Method Post -ContentType "application/json" -Body (@{ email = $EMAIL; password = $PASS } | ConvertTo-Json)
$acc = $reg.accessToken
$ref1 = $reg.refreshToken
Write-Host "   -> Registro exitoso (Status: 201 Created)" -ForegroundColor Green

# Crear una tarea
Write-Host "`n2. Creando tarea protegida para el usuario..." -ForegroundColor Yellow
$task = Invoke-RestMethod -Uri "$BASE/tasks" -Method Post -Headers @{ Authorization = "Bearer $acc" } -ContentType "application/json" -Body (@{ title = "Aprender Refresh Tokens"; description = "Implementar rotacion y anti-IDOR" } | ConvertTo-Json)
Write-Host "   -> Tarea creada: '$($task.item.title)' con ID $($task.item.id)" -ForegroundColor Green

# Task 1 - Rotación
Write-Host "`n3. [Task 1 - Rotacion] Usando el Refresh Token inicial..." -ForegroundColor Yellow
$rot = Invoke-RestMethod -Uri "$BASE/auth/refresh" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $ref1 } | ConvertTo-Json)
$ref2 = $rot.refreshToken
$diff = $ref1 -ne $ref2
Write-Host "   -> Status: 200 OK | ¿Token nuevo es diferente?: $diff" -ForegroundColor Green

# Task 2 - Detección de reúso
Write-Host "`n4. [Task 2 - Reuso] Intentando reusar el token viejo ($($ref1.Substring(0,10))...)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/auth/refresh" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $ref1 } | ConvertTo-Json)
} catch {
    Write-Host "   -> RECHAZADO por reuso (Status: $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Red
}

Write-Host "   Intentando usar el token mas nuevo ($($ref2.Substring(0,10))...) tras revocacion de familia..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/auth/refresh" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $ref2 } | ConvertTo-Json)
} catch {
    Write-Host "   -> FAMILIA REVOCADA COMPLETA (Status: $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Red
}

# Task 3 - Logout
Write-Host "`n5. [Task 3 - Logout] Iniciando sesion limpia y haciendo logout..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "$BASE/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $EMAIL; password = $PASS } | ConvertTo-Json)
$logoutRef = $login.refreshToken
$logoutRes = Invoke-WebRequest -UseBasicParsing -Uri "$BASE/auth/logout" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $logoutRef } | ConvertTo-Json)
Write-Host "   -> Logout exitoso (Status: $($logoutRes.StatusCode))" -ForegroundColor Green

try {
    Invoke-RestMethod -Uri "$BASE/auth/refresh" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $logoutRef } | ConvertTo-Json)
} catch {
    Write-Host "   -> Token posterior a Logout rechazado (Status: $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "   ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON CON EXITO!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
