import { Router, Request, Response } from 'express';
import {filterImageFromURL, deleteLocalFiles} from './../util/util';
import * as AWS from '../../../../aws';

const router: Router = Router();

  // Root Endpoint
  // Displays a simple message to the user
  router.get( "/", async ( req, res ) => {
    res.send("try GET /api/v0/filteredimage?image_url={{}}")
  } );


// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */
router.get( "/filteredimage", async ( req, res ) => {

    //////////////////////////////////////
    //    1. validate the image_url query 
    //////////////////////////////////////   
    let { image_url } = req.query;
    // Check first if we have the url
    if ( !image_url ) {
        return res.status(400)
                .send(`Image url required`);  
    }   

    ////////////////////////////////////////////////////////////////
    //    2. call filterImageFromURL(image_url) to filter the image
    ////////////////////////////////////////////////////////////////
    let filtered_image_url = await filterImageFromURL(image_url);

    /////////////////////////////////////////////////
    //    3. send the resulting file in the response
    /////////////////////////////////////////////////
    // Failed?
    if(!filtered_image_url){
        return res.status(422)
        .send(`File could not be processed!`);      
    }

    //////////////////////////////////////
    // Experimenting some aws-sdk options
    // Note: for testing only, should not give a s3 direct access to the user
    // Note2: for now works only with tje local server
    /////////
    // Sending the filtered file to the s3 bucket
    /////////////////////////////////////////////
/*    
    AWS.s3UploadFile(filtered_image_url).then(function(fromResolve: any){
        console.log(`Filtered image upload complete!\nurl: ${fromResolve}`)
    }).catch(function(fromReject){
        console.log('The filtered image could not be uploaded to the server'); 
    })        
*/

    res.status(200).sendFile(filtered_image_url, (err: Error) => {
        ///////////////////////////////////////////////////////////////////
        //    4. deletes any files on the server on finish of the response 
        ////////////////////////////////////////////////////////////////////          
        let files:string[] = new Array();
        files.push(filtered_image_url.toString());        
        if (err) {
            console.log('Response Error');
            deleteLocalFiles(files);            
        }
        else{
            deleteLocalFiles(files);
        }
    });
} );
//! END @TODO1

//////////////////////////////////////
// Experimenting some aws-sdk options
// Note: for testing only, should not give a s3 direct access to the user
/////////
// List the images contained in the s3 bucket
/////////////////////////////////////////////
router.get( "/list", async ( req, res ) => {

    // metadata structure for the objects stored in s3 bucket
    class s3Info {
        Key: String;
        LastModified: Date;
        ETag: String;
        Size: Number;
        StorageClass: String;
        Owner: object;      
        constructor() {
        }  
    }      
    
    let strFilterPrefix = "";       // File name filter    
    AWS.s3Object_list(strFilterPrefix).then(function(fromResolve: any){

        let respArray: Array<String> = [];      // Arrey of strings that will be returned                
        var imgExtensions = ["jpeg", "jpg", "png", "bmp", "tiff", "gif"]; 

        // Extract the list of file names
        let s3info = new s3Info();        
        let imagesCount = 0;
        fromResolve.forEach((element: any) => {
            s3info = element;
            respArray.push(s3info.Key);
            
            // Check if it is an image file
            let ext = s3info.Key.split('.');
            if(ext.length > 0){
                if(imgExtensions.includes(ext.pop()))
                    imagesCount++;
            }       
        });        
//        console.log(respArray);
        respArray.push(`Total count: ${fromResolve.length}`);
        respArray.push(`Images count: ${imagesCount}`);    
        return res.send(respArray);
    }).catch(function(fromReject){
        console.log(fromReject);
        return res.send('FAIL');                
    });
});    

//////////////////////////////////////
// Experimenting some aws-sdk options
// Note: for testing only, should not give a s3 direct access to the user
/////////
// Upload a file to the s3 bucket
//////////////////////////////////
router.put( "/upload", async ( req, res ) => {

    let { file_path } = req.query;

    // Check first if we have the url
    if ( !file_path ) {
        return res.status(400)
                .send(`a file path is required`);  
    }

    // Check if file exists
    const fs = require('fs');    
    if ( !fs.existsSync(file_path) ) {
        return res.status(400)
                .send(`the file is not valid`);  
    }    
  
    AWS.s3UploadFile(file_path).then(function(fromResolve: any){
        return res.status(200)
            .send(`File upload complete!\nurl: ${fromResolve}`);
    }).catch(function(fromReject){
        return res.status(422)
            .send('The file could not be uploaded'); 
    });  
});

//////////////////////////////////////
// Experimenting some aws-sdk options
// Note: for testing only, should not give a s3 direct access to the user
////////
// List the images contained in the s3 bucket
//////////////////////////////////////////////
router.delete( "/all", async ( req, res ) => {

    // metadata structure for the objects stored in s3 bucket
    class s3Info {
        Key: string;
        LastModified: Date;
        ETag: string;
        Size: number;
        StorageClass: string;
        Owner: object;      
        constructor() {
        }  
    }      
    
    let strFilterPrefix = "";       // File name filter    
    AWS.s3Object_list(strFilterPrefix).then(function(fromResolve: any){

        var imgExtensions = ["jpeg", "jpg", "png", "bmp", "tiff", "gif"]; 

        // Extract the list of file names
        let s3info = new s3Info();        
        let imagesCount = 0;
        fromResolve.forEach((element: any) => {
            s3info = element;
            
            // Check if it is an image file
            let ext = s3info.Key.split('.');
//            console.log(s3info.Key);            
            if(ext.length > 0){
                if(imgExtensions.includes(ext.pop())){
                    AWS.s3Object_delete(s3info.Key).then(function(fromResolve: any){       
                        console.log(s3info.Key + ' deleted');
                    }).catch(function(fromReject){
                        console.log('Could not delete ' + s3info.Key);
                    })                        
                }
            }       
        });        
//        console.log(respArray);
        return res.send('Detete complete!');
    }).catch(function(fromReject){
        console.log(fromReject);
        return res.send('FAIL');                
    });
});    

export const ImagesRouter: Router = router;
