# Genera og.png 1200x630 para el configurador Impacar.
# Identidad: fondo #F5F5F0, verde campo #2D5016, cobre #8B6914, texto #1A1A1A.
# Motivo central: plano en planta simplificado del N4 (6,6m) con zonas de color y 2 cuchetas.
Add-Type -AssemblyName System.Drawing

$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Colores
$fondo   = [System.Drawing.ColorTranslator]::FromHtml('#F5F5F0')
$campo   = [System.Drawing.ColorTranslator]::FromHtml('#2D5016')
$cobre   = [System.Drawing.ColorTranslator]::FromHtml('#8B6914')
$texto   = [System.Drawing.ColorTranslator]::FromHtml('#1A1A1A')
$cBaul   = [System.Drawing.ColorTranslator]::FromHtml('#ECECE4')
$cBano   = [System.Drawing.ColorTranslator]::FromHtml('#BFE3EE')
$cDorm   = [System.Drawing.ColorTranslator]::FromHtml('#C9A66B')
$cEstar  = [System.Drawing.ColorTranslator]::FromHtml('#ECECE4')
$cCocina = [System.Drawing.ColorTranslator]::FromHtml('#A7C796')
$cCama   = [System.Drawing.ColorTranslator]::FromHtml('#B5915A')

$g.Clear($fondo)

# --- Encabezado ---
$fLogo = New-Object System.Drawing.Font('Arial', 58, [System.Drawing.FontStyle]::Bold)
$fSub  = New-Object System.Drawing.Font('Arial', 26, [System.Drawing.FontStyle]::Regular)
$bCampo = New-Object System.Drawing.SolidBrush($campo)
$bTexto = New-Object System.Drawing.SolidBrush($texto)
$bCobre = New-Object System.Drawing.SolidBrush($cobre)
$g.DrawString('IMPACAR', $fLogo, $bCampo, 76, 48)
$g.DrawString('Configurador de casillas rurales', $fSub, $bTexto, 82, 140)

# Línea divisoria cobre bajo el encabezado
$pCobreFina = New-Object System.Drawing.Pen($cobre, 3)
$g.DrawLine($pCobreFina, 82, 196, 620, 196)

# --- Plano en planta N4 (6,60 x 2,60 m) ---
$s = 110.0                     # px por metro
$planW = [int](6.6 * $s)       # 726
$planH = [int](2.6 * $s)       # 286
$x0 = [int](($W - $planW) / 2) # centrado
$y0 = 240

# Zonas (bordes acumulados en metros): baulera|bano|dormitorio|estar|cocina
$bordes = @(0.0, 0.6, 1.788, 4.218, 6.0, 6.6)
$fills  = @($cBaul, $cBano, $cDorm, $cEstar, $cCocina)
for ($i = 0; $i -lt 5; $i++) {
  $zx = $x0 + [int]($bordes[$i] * $s)
  $zw = [int](($bordes[$i+1] - $bordes[$i]) * $s)
  $b = New-Object System.Drawing.SolidBrush($fills[$i])
  $g.FillRectangle($b, $zx, $y0, $zw, $planH)
  $b.Dispose()
}

# Divisores entre zonas
$pDiv = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 26, 26, 26), 2)
for ($i = 1; $i -lt 5; $i++) {
  $zx = $x0 + [int]($bordes[$i] * $s)
  $g.DrawLine($pDiv, $zx, $y0, $zx, $y0 + $planH)
}

# Camas: 2 cuchetas en dormitorio (2,0 x 0,8 m), fila superior e inferior
$fCama = New-Object System.Drawing.Font('Arial', 20, [System.Drawing.FontStyle]::Bold)
$pared = [int](0.06 * $s)
$bedW = [int](2.0 * $s); $bedH = [int](0.8 * $s)
$bedX = $x0 + [int](1.788 * $s) + [int](0.2 * $s)
$bBed = New-Object System.Drawing.SolidBrush($cCama)
$pBed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 26, 26, 26), 2)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
foreach ($by in @(($y0 + $pared), ($y0 + $planH - $pared - $bedH))) {
  $g.FillRectangle($bBed, $bedX, $by, $bedW, $bedH)
  $g.DrawRectangle($pBed, $bedX, $by, $bedW, $bedH)
  $rect = New-Object System.Drawing.RectangleF($bedX, $by, $bedW, $bedH)
  $g.DrawString('C', $fCama, $bTexto, $rect, $sf)
}

# Etiquetas de zona (horizontales en las anchas, verticales en las angostas)
$fZona  = New-Object System.Drawing.Font('Arial', 17, [System.Drawing.FontStyle]::Bold)
$fZonaV = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)
$labels = @('BAULERA', ("BA" + [char]0xD1 + "O"), 'DORMITORIO', 'ESTAR', 'COCINA')
# indices: 0 baulera (vertical), 1 bano (horiz), 2 dormitorio (horiz, arriba de las camas no: centrado), 3 estar (horiz), 4 cocina (vertical)
for ($i = 0; $i -lt 5; $i++) {
  $zx = $x0 + [int]($bordes[$i] * $s)
  $zw = [int](($bordes[$i+1] - $bordes[$i]) * $s)
  $cx = $zx + $zw / 2.0
  $cy = $y0 + $planH / 2.0
  if ($i -eq 0 -or $i -eq 4) {
    # vertical
    $st = $g.Save()
    $g.TranslateTransform($cx, $cy)
    $g.RotateTransform(-90)
    $r = New-Object System.Drawing.RectangleF(-70, -12, 140, 24)
    $g.DrawString($labels[$i], $fZonaV, $bTexto, $r, $sf)
    $g.Restore($st)
  } elseif ($i -eq 2) {
    # dormitorio: la etiqueta va en la franja del pasillo central (entre camas)
    $r = New-Object System.Drawing.RectangleF($zx, ($cy - 14), $zw, 28)
    $g.DrawString($labels[$i], $fZona, $bTexto, $r, $sf)
  } else {
    $r = New-Object System.Drawing.RectangleF($zx, ($cy - 14), $zw, 28)
    $g.DrawString($labels[$i], $fZona, $bTexto, $r, $sf)
  }
}

# Pared exterior (trazo grueso, por encima de todo)
$pPared = New-Object System.Drawing.Pen($texto, 6)
$g.DrawRectangle($pPared, $x0, $y0, $planW, $planH)

# --- Cota inferior en cobre: 6,60 m ---
$pCota = New-Object System.Drawing.Pen($cobre, 2)
$cy2 = $y0 + $planH + 26
$g.DrawLine($pCota, $x0, $cy2, $x0 + $planW, $cy2)
$g.DrawLine($pCota, $x0, $cy2 - 7, $x0, $cy2 + 7)
$g.DrawLine($pCota, $x0 + $planW, $cy2 - 7, $x0 + $planW, $cy2 + 7)
$fCota = New-Object System.Drawing.Font('Arial', 18, [System.Drawing.FontStyle]::Regular)
$rCota = New-Object System.Drawing.RectangleF($x0, ($cy2 + 6), $planW, 24)
$g.DrawString('6,60 m', $fCota, $bCobre, $rCota, $sf)

# --- Pie: propuesta de valor ---
$fPie = New-Object System.Drawing.Font('Arial', 20, [System.Drawing.FontStyle]::Regular)
$rPie = New-Object System.Drawing.RectangleF(0, ($H - 40), $W, 30)
$g.DrawString(('Arme su casilla a medida ' + [char]0xB7 + ' Plano en vivo ' + [char]0xB7 + ' Presupuesto al instante'), $fPie, $bTexto, $rPie, $sf)

$out = "C:\Users\Usuario\AppData\Local\Temp\claude\C--Users-Usuario-OneDrive-Desktop-Proyectos-Impacar\8d55dc34-2795-49c2-abae-bee74b9890de\scratchpad\og-nuevo.png"
$g.Dispose()
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "OK -> $out"
