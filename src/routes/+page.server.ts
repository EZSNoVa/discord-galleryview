
import type { Actions } from './$types';
import { add_gallery, gallery_exists, get_db, write_db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import get_channel from '$lib/server/scrap_messages';


export const actions: Actions = {
    // Join a gallery
    join: async (ctx) => {
        let form = await ctx.request.formData();
        let channel_id = form.get('channel_id')?.toString();

        if (!channel_id) {
            return {
                error: 'No channel id provided',
            };
        }
        // check if a gallery with this id exists
        const db = await get_db();

        if (await gallery_exists(channel_id)) {
            return {
                error: 'No gallery with this id exists',
            }
        } else {
            throw redirect(302, `/${channel_id}/list`);
        }
    },

    // Create a galler (by scraping)
    create: async (ctx) => {
        let form = await ctx.request.formData();

        let token = form.get('token')?.toString();
        let channel_id = form.get('channel_id')?.toString();
        let amount = form.get('amount')?.toString();

        if (!token) {
            return {
                error: 'No token provided',
            };
        } else if (!channel_id) {
            return {
                error: 'No channel id provided',
            };
        } else if (!amount) {
            return {
                error: 'No amount provided',
            };
        }

        // check if a gallery with this id exists
        const db = await get_db();

        if (await gallery_exists(channel_id)) {
            return {
                error: 'A gallery with this id already exists. To overwrite it, use bot commands.',
            }
        }

        // Get the images and channel name
        let result = await get_channel(token, channel_id, parseInt(amount));

        if (result.error) {
            return {
                error: result.error,
            }
        }
        if (!result.images || !result.channel_name) {
            return {
                error: 'Failed to get images or channel name',
            }
        }

        // Save the images and channel name
        await add_gallery({
            channel_id,
            channel_name: result.channel_name,
            images: result.images,
        }); 
        // redirect to the gallery /<id>/list
        throw redirect(302, `/${channel_id}/list`);
    }
};
