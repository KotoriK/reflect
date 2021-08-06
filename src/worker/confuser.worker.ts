export interface FlipWorkerData {
    img: Blob,
    rotate: number,
    rps: number
}
import registerPromiseWorker from 'promise-worker/register'

registerPromiseWorker(async function (data) {
    const { img, rotate, rps } = data as FlipWorkerData
    const bitmap = await createImageBitmap(img)
    const { width, height } = bitmap
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    //doRotate(ctx, rotate)
    ctx.drawImage(bitmap, 0, 0)
    ctx.rotate(rotate / 180 * Math.PI)
    rnd_pixel(ctx, width, height, rps);
    const result = canvas.transferToImageBitmap()
    return result
});

function doRotate(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, θ: number) {
    const rad = θ / 180 * Math.PI
    const cosθ = Math.cos(rad)
    const sinθ = Math.sin(rad)
    ctx.transform(cosθ, sinθ, -sinθ, cosθ, 0, 0)
}
function rnd_pixel(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, pixelNumber: number) {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
    for (let i = 0; i < pixelNumber; i++) {
        const x = Math.floor(Math.random() * canvasWidth)
        const y = Math.floor(Math.random() * canvasHeight)
        const pixel_offset = (y * canvasWidth + x) * 4
        const pixel = imageData.slice(pixel_offset, pixel_offset + 4)
        const pixel_next = pixel.map(rndChannel)

        ctx.fillStyle = `rgba(${pixel_next.slice(0, 3).join(',')},${pixel_next[3] / 255})`
        ctx.fillRect(x, y, 1, 1)
    }
}
const rndChannel = (value: number) => {
    const rnd = (Math.random() * 6 - 3) | 0
    const next = value + rnd
    //防止出界
    if (next < 0) return 0
    if (next > 255) return 255
    return next
}

