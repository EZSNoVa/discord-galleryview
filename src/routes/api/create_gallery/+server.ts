import { gallery_exists, add_gallery } from "$lib/server/db"
import { json, type RequestHandler } from "@sveltejs/kit"

/*
    GET /api/create_gallery
    Used for creating a new gallery (used by discord bot)

    Expected parameters (in json body):
        - channel_id: string
        - channel_name: string
        - images: string[] (array of image id's)

    Optional parameters:
        - overwrite: boolean (if true, will overwrite existing gallery)
*/


type ExpectedParams = {
    channel_id?: string,
    channel_name?: string,
    images?: string[],
    overwrite?: boolean
}

export const POST: RequestHandler = async ({ request }) => {

    let data: ExpectedParams = await request.json();
    let { channel_id, channel_name, images, overwrite } = data;
    
    overwrite = overwrite || false;

    // Check if all parameters are present
    if (!channel_id || !channel_name || !images) {
        return json({
            error: "Missing parameters. Required parameters: channel_id: string, channel_name: string, images: string[]"
        }, {status: 400})
    }


    //  If gallery already exists and overwrite is false, return error
    if (await gallery_exists(channel_id) && !overwrite) {
        return json({
            error: "Gallery already exists. Use overwrite=true to overwrite existing gallery"
        }, {status: 400})

    }
   
    await add_gallery(channel_id, {channel_name, images});

    let host = request.url.split("/api")[0];

    return json({
        gallery_url: `${host}/${channel_id}/list`
    }, {status: 200})
        
};