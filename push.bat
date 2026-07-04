@echo off
cd /d "C:\Users\yJB\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd"
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" add styles.css index.html
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" commit -m "Fix English pricing titles - take 2"
git.exe -C "C:\Users\yJB\Desktop\yuandaifu_sina\deploy_package" push
pause
