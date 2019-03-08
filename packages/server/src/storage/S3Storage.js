import aws from 'aws-sdk'
import multerS3 from 'multer-s3'
import { Storage } from './Storage'

export class S3Storage extends Storage {
  static type = 's3'

  constructor(config) {
    super(config)
    const {
      name,
      s3,
      bucket,
      contentType,
      ...options
    } = config
    this.s3 = new aws.S3(s3)
    this.bucket = bucket

    this.setStorage(multerS3({
      s3: this.s3,
      bucket,
      contentType: contentType || multerS3.AUTO_CONTENT_TYPE,
      ...options,

      key: (req, file, cb) => {
        cb(null, this.getFilename(file))
      },

      metadata: (req, file, cb) => {
        // Store the determined width and height as meta-data on the s3 object
        // as well. You never know, it may become useful :)
        const { width, height } = file
        if (width != null || height != null) {
          cb(null, {
            width: `${width}`,
            height: `${height}`
          })
        } else {
          cb(null, {})
        }
      }
    }))
  }

  getFileIdentifiers(file) {
    return {
      name: file.key,
      url: file.location
    }
  }

  async removeFile(file) {
    await this.execute('deleteObject', {
      Bucket: this.bucket,
      Key: file.name
    })
  }

  execute(method, params) {
    return new Promise((resolve, reject) => {
      this.s3[method](params, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}