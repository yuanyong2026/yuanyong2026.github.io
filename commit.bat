@echo off
cd /d "C:\Users\yJB\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd"
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" add .
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" commit -m "Fix pricing"
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" push
pause
