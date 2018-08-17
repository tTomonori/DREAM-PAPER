const electron = require('electron')
const app = electron.app
const Tray = electron.Tray
const image = electron.nativeImage
const Menu = electron.Menu
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const path = require('path')
const url = require('url')

//デバッグ用
// const nedb = require("nedb")
//パッケージ用
const nedb = require(__dirname+"/node_modules/nedb")

app.dock.hide()

let gQuitFlag=false
let gDb
let gTray,gTrayMenu
let gMainWindow

function createWindow () {
  // Create the browser window.
  let tSize=electron.screen.getPrimaryDisplay().size
  gMainWindow = new BrowserWindow({
    left:10,top:-10,
    width: tSize.width, minWidth: tSize.width+10,
    height: tSize.height, minHeight: tSize.height,
    type:"desktop",
    frame: false,
    hasShadow: false,
    transparent: true,
    // titleBarStyle: "hidden"
  })
  gMainWindow.center()

  // and load the index.html of the app.
  gMainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // gMainWindow.webContents.openDevTools()

  gMainWindow.on('closed', function () {
    electron.session.defaultSession.clearCache(() => {})
    gMainWindow = null;
  })
}
//メニューバーにアイコン追加
function createTray(){
  gTray = new Tray(image.createFromPath(__dirname+"/icon/tray_icon.png").resize({width:20,height:20}));
  setTrayMenu()
}
//Trayのメニュー設定
function setTrayMenu(aReplace){
  if(aReplace!=null){
    for(tItem of aReplace){
      gTrayMenu[tItem.index]=tItem.item
    }
  }
  gTray.setContextMenu(Menu.buildFromTemplate(gTrayMenu));
}

//表示
function show(){
  createWindow()
  gMainWindow.center()
  setTrayMenu([{index:2,item:
    { label: "非表示", click: hide }
  }])
  gDb.update({_id:"DISPLAY"},{display:true})
}
//非表示
function hide(){
  setTrayMenu([
    {index:2,item:{ label: "非表示", enabled: false}},
    {index:0,item:{ label: "DREAM@PAPER", enabled: false}}
  ])
  gMainWindow.send("fadeOut")
  gDb.update({_id:"DISPLAY"},{display:false})
}

app.on('ready', ()=>{
  gTrayMenu=[
    { label: "DREAM@PAPER", enabled: false},
    { type: "separator"},
    { label: "表示", click: show },
    { label: "終了", click: quit}
  ]
  gDb=new nedb({
    filename: __dirname+"/database/database.db",
    autoload:true
  })
  createTray()
  gDb.find({_id:"DISPLAY"},(e,doc)=>{
    if(doc.length==0){
      gDb.insert({display:true,_id:"DISPLAY"})
      show()
    }else{
      if(doc[0].display)
        show()
    }
  })
})
function quit(){
  if(gMainWindow==null){
    app.quit()
    return;
  }
  setTrayMenu([
    {index:0,item:{ label: "DREAM@PAPER", enabled: false}},
    {index:2,item:{ label: "表示", enabled: false}},
    {index:3,item:{ label: "終了", enabled: false}}
  ])
  gQuitFlag=true
  gMainWindow.send("fadeOut")
}
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (gMainWindow === null) {
    createWindow()
  }
})

//ページ全体の読み込み完了
ipcMain.on("loaded",(e)=>{
  gDb.find({_id:"LASTINDEX"},(e,doc)=>{
    if(doc.length==0){
      gMainWindow.send("fadeIn",0)
      gDb.insert({index:0,_id:"LASTINDEX"})
    }else{
      gMainWindow.send("fadeIn",doc[0].index)
    }
  })
})
//fadeOut終了
ipcMain.on("closed",(e)=>{
  if(gQuitFlag){
    app.quit()
    return;
  }
  gMainWindow.close()
  setTrayMenu([{index:2,item:
    { label: "表示", click: show }
  }])
})
//映像切り替え開始
ipcMain.on("changeVideo",(e,a)=>{
  gDb.update({_id:"LASTINDEX"},{index:a.index})
  setTrayMenu([{index:0,item:
    {label: a.index+" : "+a.video, enabled: false}
  }])
})
