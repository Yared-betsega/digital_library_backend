import multer from 'multer'
import path from 'path'

export const filterImage = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      cb(null, false)
      return
    }
    cb(null, true)
  }
})
export const filterBook = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== '.pdf' && ext !== '.epub') {
      cb(null, false)
      return
    }
    cb(null, true)
  }
})
