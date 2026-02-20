Add-Type -AssemblyName System.Drawing
$img1 = [System.Drawing.Image]::FromFile("C:\Users\muham\Desktop\FitTakip\public\pwa-192x192.jpg")
$img1.Save("C:\Users\muham\Desktop\FitTakip\public\pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img1.Dispose()

$img2 = [System.Drawing.Image]::FromFile("C:\Users\muham\Desktop\FitTakip\public\pwa-512x512.jpg")
$img2.Save("C:\Users\muham\Desktop\FitTakip\public\pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img2.Dispose()
