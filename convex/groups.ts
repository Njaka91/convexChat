import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {},
    handler: async ({ db, storage }) => {
        const groups = await db.query('groups').collect(); 
        return Promise.all(
            groups.map(async (group) => {
                if (group.icon_url.length>0) {
                    // Supposons que group.icon_url est l'identifiant dans le stockage, pas l'URL
                    const url = await storage.getUrl(group.icon_url);
                    if (url) {
                        return {...group, icon_url: url};
                    }
                }
                return group;
            })
        );
    }
});

export const getGroup = query({
    args: { id: v.id('groups') },
    handler: async (ctx, { id }) => {
        return await ctx.db.query('groups')
            .filter((q) => q.eq(q.field('_id'), id))
            .unique();
    }
});

export const create = mutation({
    args: {
        description: v.string(),
        icon_url: v.string(),
        name: v.string(),
    },
    handler: async ({db}, { description, icon_url, name }) => {
        const groupId = await db.insert('groups', { description, icon_url, name });
        return groupId;  
    }
});


