import { VercelResponse, VercelRequest } from '@vercel/node'

import Cheerio from 'cheerio'
import fetch from 'node-fetch'
import Sagiri from 'sagiri'
import { searchByUrl } from 'ascii2d'
export async function saucenao(pic: string) {
    const results = await Sagiri(process.env.SAUCENAO_API)(pic)
    let ok = false//saucenao直接根据相似度判断是否成功
    for (const result of results) {
        if (result.similarity > 0.6) {
            ok = true
            break
        }
    }
    return {
        ok, results, from: "pixiv"
    }
}
export default async function (req: VercelRequest, res: VercelResponse) {
    let ok = false
    let data = ''
    const query = req.query;
    const url: string = query.url as any
    if (url) {
        try {
            const search = query.search ? true : false
            const resp = await fetch(url)
            if (resp.ok) {
                const $ = Cheerio.load(await resp.text())
                const listName = $("#p_name_show").text()
                const listAuthor = $(".data__cont .data__singer > a").text()
                const coverImg = $('.data__cover > .data__photo').attr().src
                ok = true
                const data_obj = {
                    listName,
                    listAuthor,
                    coverImg,
                    search: []
                }
                if (search) {
                    const result = await saucenao(coverImg)
                    if (result.ok) {
                        data_obj.search.push(result)
                    } else {
                        data_obj.search.push({ ...await searchByUrl(coverImg, 'color', false), from: "ascii2d" })
                    }
                }
                res.setHeader("Cache-Control", "s-maxage=7200")
                res.setHeader("Content-Type", "application/json; charset=utf-8")
                data = JSON.stringify(data_obj)
            } else {
                data = 'fetch failed:' + resp.status
            }
        } catch (error) {
            data = JSON.stringify(error)
        }
    } else {
        data = 'argument miss: "url"'
    }
    res.send(`{"ok":${ok ? 'true' : 'false'},"data":${data}}`);
}