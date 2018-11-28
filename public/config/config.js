let gDb
function init(){
	gDb=new nedb({
		filename: __dirname+"/../../database/database.db",
		autoload:true
	})
	gDb.find({_id:"FOLDERPATH"},(e,doc)=>{
		document.getElementById("movieFolderPath").textContent=doc[0].path
	})
}
function setPath(){
	let tPath=document.getElementById("inputPath").value
	gDb.update({_id:"FOLDERPATH"},{path:tPath},()=>{
		document.getElementById("movieFolderPath").textContent=tPath
	})
}

init()
