# TradeLink - Manual Push to GitHub Script
# Run this script when you want to push changes to GitHub (which triggers Netlify deployment)

Write-Host "🚀 Pushing TradeLink changes to GitHub..." -ForegroundColor Green

# Check if there are any changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changes detected. Committing and pushing..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Update TradeLink app - $timestamp"
    
    # Push to GitHub
    git push
    
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Netlify will automatically redeploy your site" -ForegroundColor Cyan
    Write-Host "📊 Check your Netlify dashboard for deployment status" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  No changes detected. Nothing to push." -ForegroundColor Blue
}

Write-Host "`n💡 To test changes locally first, run: pnpm dev" -ForegroundColor Magenta
Write-Host "🌐 Local development server: http://localhost:8080/" -ForegroundColor Cyan
