import { Router, Request, Response } from 'express';
import {filterImageFromURL, deleteLocalFiles} from './../util/util';

const router: Router = Router();

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

    // Send the file to the server
    // TODO ************************************

    /////////////////////////////////////////////////
    //    3. send the resulting file in the response
    /////////////////////////////////////////////////
    // Failed?
    if(!filtered_image_url){
        return res.status(422)
        .send(`File could not be processed!`);      
    }

    res.status(200).sendFile(filtered_image_url, (err) => {
        if (err) {
            console.log('Response Error');
        }
        else{
            ///////////////////////////////////////////////////////////////////
            //    4. deletes any files on the server on finish of the response 
            ////////////////////////////////////////////////////////////////////           
            let files:string[] = new Array();
            files.push(filtered_image_url.toString());
            deleteLocalFiles(files);
        }
    });
} );

//! END @TODO1

export const ImagesRouter: Router = router;
