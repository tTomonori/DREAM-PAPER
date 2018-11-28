electron-packager ./ DREAM@PAPER --platform=darwin --icon=icon/icon.icns
rm -r DREAM@PAPER-darwin-x64/DREAM@PAPER.app/Contents/Resources/app/node_modules
cp -r node_modules DREAM@PAPER-darwin-x64/DREAM@PAPER.app/Contents/Resources/app/node_modules
