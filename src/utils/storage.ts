import multer from 'multer'
import { GridFSBucket, ObjectId} from 'mongodb'



const VIDEO_MIME_TYPES=['video/mp4','video/mpeg','video/quicktime','video/x-msvideo','video/webm','video/ogg'];


export const uploadToGridFS=(
    db:any,
    file:Express.Multer.File

):Promise<string>=>{
    return new Promise((resolve,reject)=>{
        const bucket=new GridFSBucket(db,{bucketName:'videos'});
    
        console.log('file', file)
        console.log('originalname', file.originalname)
        console.log('mimetype', file.mimetype)
        
        const uploadStream=bucket.openUploadStream(file.originalname,{
            metadata:{contentType:file.mimetype}
        })
        
        console.log('uploadStream opened')
        uploadStream.end(file.buffer)
        
        uploadStream.on("finish",()=> {
            console.log('upload finished, id:', uploadStream.id.toString())
            resolve(uploadStream.id.toString())
        })
        
        uploadStream.on("error",(err)=> {
            console.log('upload error:', err)
            reject(err)
        })
        
    })
}

const fileFilter=(req:any,file:any,cb:any)=>{
    if(VIDEO_MIME_TYPES.includes(file.mimetype)){
        cb(null,true)
    }
    else{
        cb(new Error('only video files are allowed'),false)
    }
}
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "100000000")
  },
  fileFilter:fileFilter
});
export async function deleteFromGridFs(db:any,fileId:string):Promise<void>{
    const bucket = new GridFSBucket(db,{bucketName:"videos"});
    try{
        await bucket.delete(new ObjectId(fileId))
    }catch(err: any){
        if(err.code === 26 ){
            throw new Error('File not Found')
        }
        console.log(err)
    }
}
