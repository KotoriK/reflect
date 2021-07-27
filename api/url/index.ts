import { VercelRequest, VercelResponse } from '@vercel/node'
import { APIResult } from '../../src/api'
import urlencode from 'urlencode'


export default function (req: VercelRequest, res: VercelResponse) {
    const { charset = 'utf8', s } = req.query
    let isOK = false
    let data
    if (s) {
        if (charset instanceof Array) {
            data = "charset should not be an array."
        } else {
            try {
                data = (s instanceof Array ? s : [s]).map(item => urlencode.decode(item, charset))
                isOK = true
            } catch (e) {
                data = e
            }
        }
    } else {
        data = "data undefined"
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.setHeader("Cache-Control", "s-maxage=60")
    res.send(JSON.stringify({
        ok: isOK, data
    } as APIResult<any>))
}