let listLength=videoList.length
let index=0//videListのindex
let videoTag1
let videoTag2
let currentVideoTag//現在表示中のvideoタグ
let nextVideoTag//次に表示する(現在表示していない)videoタグ
let changeEventTimer
let transitionedTimer
let zIndexTimer
function setTransitionTime(aTag,aTime){
	aTag.style.transition="opacity "+aTime+"ms 0s linear"
}
function setChangeVideoEvent(initFlag){
	let videoData=videoList[index]
	changeEventTimer=setTimeout(()=>{
		renderer.send("changeVideo",{video:videoData.video,index:index})
		currentVideoTag=(currentVideoTag==videoTag1)?videoTag2:videoTag1
		nextVideoTag=(nextVideoTag==videoTag1)?videoTag2:videoTag1
		nextVideoTag.src=videoDirectoryPath+"/"+videoData.video+".mp4"
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

window.onload=()=>{
	renderer.send("loaded")
	//videoタグpreload
	videoTag1=document.getElementById("video1")
	videoTag2=document.getElementById("video2")
	currentTag=videoTag2
	nextVideoTag=videoTag1
}
renderer.on("fadeIn",(e,i)=>{
	index=i%listLength
	if(firstIndex!=null)index=firstIndex%listLength
	//壁紙再生
	setChangeVideoEvent(true)
})
renderer.on("fadeOut",(e)=>{
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
