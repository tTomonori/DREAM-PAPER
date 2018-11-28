//背景ウィンドウのフィードイン・フェードアウトにかかる時間ms
let fadeDuration=1000
//映像切り替えにかける時間ms
let transitionDuration=4000
//実行直後に再生する動画のindex(nullなら一番最後に表示していた動画のindex)
let firstIndex=null
//再生する動画(video="動画のファイル名 拡張子不要",time="動画を生成する時間ms")
let videoList=[
	{video:"sampleMovie_whiteSnow",time:20000},
	{video:"sampleMovie_blueSnow",time:20000},
]
