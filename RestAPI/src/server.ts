import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

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
  app.get( "/filteredimage", async ( req, res ) => {

    let { image_url } = req.query;
    // Check first if we have the url
    if ( !image_url ) {
      return res.status(400)
                .send(`Image url required`);  
    }

    // Extract the file name
    var image_name =  "";
    const index = image_url.lastIndexOf('/');
    const len = image_url.length;

    if(len > (index+1)){
      image_name = image_url.substring(index+1);
    }

    // Filter the file
    var filtered_image_url = await filterImageFromURL(image_url);

    // Failed?
    if(!filtered_image_url){
      return res.status(422)
        .send(`File could not be processed!`);      
    }

    // Delete the file
    var files:string[] = new Array();
    files.push(filtered_image_url.toString());
    deleteLocalFiles(files);

    res.status(200)
//      .send(`Image filtering complete`)
//      .send(files)
//        .send(image_url)
        .send(`${image_name} filtered and saved`)
  } );
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();