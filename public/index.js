let videoDirectoryPath
let listLength
let index=0//videListのindex
let videoTag1
let videoTag2
let currentVideoTag//現在表示中のvideoタグ
let nextVideoTag//次に表示する(現在表示していない)videoタグ
let changeEventTimer
let transitionedTimer
let zIndexTimer
let loadErrorFlag=false
let currentDirPath="../../../../../"
function setTransitionTime(aTag,aTime){
	aTag.style.transition="opacity "+aTime+"ms 0s linear"
}
function setChangeVideoEvent(initFlag){
	let videoData=videoList[index]
	changeEventTimer=setTimeout(()=>{
		renderer.send("changeVideo",{video:videoData.video,index:index})
		currentVideoTag=(currentVideoTag==videoTag1)?videoTag2:videoTag1
		nextVideoTag=(nextVideoTag==videoTag1)?videoTag2:videoTag1
		nextVideoTag.src=currentDirPath+videoDirectoryPath+"/"+videoData.video+".mp4"
		setTransitionTime(nextVideoTag,(initFlag)?fadeDuration:transitionDuration)
			//videoロード終了時
			//次のvideo切り替えイベントセット
			index=(index+1)%listLength
			setChangeVideoEvent()
			//video切り替えアニメーション
			nextVideoTag.style.zIndex=2
			nextVideoTag.style.opacity=1
			transitionedTimer=setTimeout(()=>{
				//video切り替え終了時
				currentVideoTag.src=""
				setTransitionTime(currentVideoTag,0)
				currentVideoTag.style.zIndex=0
				currentVideoTag.style.opacity=0
				zIndexTimer=setTimeout(()=>{
					nextVideoTag.style.zIndex=1
				},500)
			},(initFlag)?fadeDuration:transitionDuration)
	},(initFlag)?0:videoData.time)
}

function enable(){
	listLength=videoList.length
	renderer.send("loaded")
	//videoタグpreload
	videoTag1=document.getElementById("video1")
	videoTag2=document.getElementById("video2")
	currentTag=videoTag2
	nextVideoTag=videoTag1
}
window.onload=()=>{
	gDb.find({_id:"FOLDERPATH"},(e,doc)=>{
		//設定ファイル読み込み
		let tScript=document.createElement("script")
		videoDirectoryPath=doc[0].path
		tScript.type = 'text/javascript';
		tScript.src=currentDirPath+doc[0].path+"/dreampaperconfig.js"
		document.getElementsByTagName("html")[0].appendChild(tScript)
		//設定ファイル読み込み完了後にjs読み込み
		tScript.onload=()=>{
			enable()
		}
		//設定ファイル読み込み失敗
		tScript.onerror=()=>{
			let tError=document.createElement("div")
			tError.textContent="動画フォルダに設定ファイル(dreampaperconfig.js)がありません"
			tError.style.fontSize="50px"
			tError.style.background="rgba(255,255,255,0.4)"
			tError.style.margin="auto"
			tError.style.height="90px"
			tError.style.top="0"
			tError.style.bottom="0"
			tError.style.right="0"
			tError.style.left="0"
			tError.style.position="absolute"
			tError.style.textAlign="center"
			document.getElementsByTagName("html")[0].appendChild(tError)
			loadErrorFlag=true
		}
	})
}
renderer.on("fadeIn",(e,i)=>{
	index=i%listLength
	if(firstIndex!=null)index=firstIndex%listLength
	//壁紙再生
	setChangeVideoEvent(true)
})
renderer.on("fadeOut",(e)=>{
	if(loadErrorFlag){renderer.send("closed");return;}
	clearTimeout(changeEventTimer)
	clearTimeout(transitionedTimer)
	clearTimeout(zIndexTimer)
	setTransitionTime(currentVideoTag,fadeDuration)
	setTransitionTime(nextVideoTag,fadeDuration)
	currentVideoTag.style.opacity=0
	nextVideoTag.style.opacity=0
	setTimeout(()=>{
		renderer.send("closed")
	},fadeDuration)
})
