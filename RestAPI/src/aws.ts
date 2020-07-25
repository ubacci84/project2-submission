import AWS = require('aws-sdk');
import { config } from './config/config';

const c = config.dev;

//Configure AWS, check for deployed first
if(c.aws_profile !== "DEPLOYED"){
  var credentials = new AWS.SharedIniFileCredentials({profile: c.aws_profile});
}
else{
  // TODO: 
  // Double check this
  var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});  
}
AWS.config.credentials = credentials;  

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: c.aws_region,
  params: {Bucket: c.aws_media_bucket}});


/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getGetSignedUrl( key: string ): string{

  const signedUrlExpireSeconds = 60 * 5

    const url = s3.getSignedUrl('getObject', {                
        Bucket: c.aws_media_bucket,
        Key: key,
        Expires: signedUrlExpireSeconds
      });

    return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl( key: string ){

    const signedUrlExpireSeconds = 60 * 5

    const url = s3.getSignedUrl('putObject', {
      Bucket: c.aws_media_bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });

    return url;
}

/* 
 * s3Object_list gets objects information from a specified s3 bucket
 * @Params
 *    strPrefix: string - optional filter for the filenames listed in the s3 bucket
 * @Returns:
 *    metadata list of the s3 bucket content
 */
export let s3Object_list = function(strPrefix: string){
  return new Promise(function(resolve, reject){

    // Prepare the parameters
    var bucketParams = {
      Bucket: c.aws_media_bucket,
      Prefix: strPrefix
    };

    // Call S3 to obtain a list of the objects in the bucket 
    s3.listObjectsV2(bucketParams, (err: Error, data: any) => {
      if (err) {
//        console.log("Error", err);
        reject(`Error ${err}`);
      } else {
//        console.log("Success", data);
        resolve(data.Contents);
      }
    });
  });
}

/* 
 * uploadFile - upload a file to the specified s3 bucket
 * @Params
 *    fileURL: string - the file url
 * @Returns:
 *    a url as a string
 */
export let s3UploadFile = function(fileURL: string){
  return new Promise(function(resolve, reject){

    // Prepare the parameters
    let bucketParams = {
      Bucket: c.aws_media_bucket,
      Key: '', 
      Body: ''
    };

    // Configure the file stream 
    // and get the file upload parameters
    let fs = require('fs');
    let fileStream = fs.createReadStream(fileURL);
    fileStream.on('error', function(err: Error) {
      reject(`File URL Error: ${err}`);
    });

    // Update the bucket upload parameters  
    bucketParams.Body = fileStream;
    var path = require('path');
    bucketParams.Key = path.basename(fileURL);

    // call S3 to upload the file to specified bucket
    let retval:string;
    s3.upload (bucketParams, function (err: Error, data: any) {
      if (err) {
        reject(`s3 File Upload Error: ${err}`);
      } if (data) {        
        resolve(data.Location);
      }
    });    
  });
}

/* 
 * s3Object_delete - delete a file in the specified s3 bucket
 * @Params
 *    Key: string
 * @Returns:
 *    reslut as a string
 */
export let s3Object_delete = function(strKey: string){
  return new Promise(function(resolve, reject){
    // Prepare the parameters
    var bucketParams = {
      Bucket: c.aws_media_bucket,
      Key: strKey
    };

    // Call S3 to obtain a list of the objects in the bucket 
    s3.deleteObject(bucketParams, (err: Error, data: any) => {
      if (err) {
        console.log("Error ", err);
        reject(`Error ${err}`);
      } else {
//        console.log("Success", data);
        resolve('Delete complete');
      }
    });
  });
}
