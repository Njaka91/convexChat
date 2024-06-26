import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";


const http = httpRouter()

http.route({
    path: '/sendImage',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const blob = await request.blob()
        const storageId = await ctx.storage.store(blob)

        const user = new URL(request.url).searchParams.get('user')!
        const group_id = new URL(request.url).searchParams.get('group_id')!
        const content = new URL(request.url).searchParams.get('content')!

        await ctx.runMutation(api.messages.sendMessage, {
            content,
            user,
            group_id: group_id as Id<'groups'>,
            file: storageId
        })
        return new Response(JSON.stringify({success: true}))
    })
}) 

http.route({
    path: '/sendImageGroup',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const blob = await request.blob();
        const storageId = await ctx.storage.store(blob);

        const description = new URL(request.url).searchParams.get('description')!;
        const name = new URL(request.url).searchParams.get('name')!;
        const groupId = new URL(request.url).searchParams.get('groupId')!;

        await ctx.runMutation(api.groups.create, {
            description,
            name,
            icon_url: storageId,
        });

        return new Response(JSON.stringify({ success: true, storageId }));
    })
});


export default http;