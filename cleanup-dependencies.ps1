$frontendPath = "d:\Project\DevConnect\frontend"
$backendPath = "d:\Project\DevConnect\backend"

# Clean up frontend dependencies
Set-Location $frontendPath

# Remove duplicate Tailwind CSS plugins
npm uninstall @tailwindcss/forms @tailwindcss/aspect-ratio @tailwindcss/container-queries
npm install @tailwindcss/forms @tailwindcss/aspect-ratio @tailwindcss/container-queries

# Clean up backend dependencies
Set-Location $backendPath

# Remove unused backend dependencies
npm uninstall @prisma/client
npm install @prisma/client

Write-Host "Dependencies cleaned up successfully!"
