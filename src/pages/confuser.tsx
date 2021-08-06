import { Container, Grid, Card, Input, Button, Typography, Divider, Fade, CircularProgress, Slider, Portal } from "@material-ui/core";
import { SnackbarProvider, useSnackbar } from "notistack";
import PromiseWorker from "promise-worker";
import React, { useState, useCallback, useEffect, useRef } from "react";
import useControlledValue from "../compo/controlledValue";
import { Dropzone, useDropzone } from "../compo/dropzone";
import { useObjectURL, useUploadImage } from "../compo/image";
import Placeholder from "../compo/placeholder";
import { useGapStyle } from "../compo/styles";
import { SnackBarProviderProps } from "../const";
import UtilContainer from "../container/util";
import { mapRangeToSliderProp } from "../utils";
import { FlipWorkerData } from "../worker/confuser.worker";
import { useStyles as useThemeColorStyles } from './themecolor'
const ROTATE_RANGE = [0, 90, 180, 270, 360]
const ROTATE_RANGE_PROPS = mapRangeToSliderProp(ROTATE_RANGE)
const RPS = [0, 100, 200, 500, 800, 1000]
const RPS_PROPS = mapRangeToSliderProp(RPS)

function useFlipperWorker() {
    const promiseWorker = useRef<PromiseWorker>()
    useEffect(() => {
        const worker = new Worker(new URL('../worker/confuser.worker.ts', import.meta.url))
        promiseWorker.current = new PromiseWorker(worker)
        return () => {
            worker.terminate()
        }
    }, [])
    return promiseWorker.current
}
const MIME_REG = /image\//
function Confuser() {
    const gapStyles = useGapStyle()
    const [inProgress, setInProgress] = useState(false)
    const { preview: style_preview } = useThemeColorStyles()
    const [currentImageUrl, changeImage] = useUploadImage()
    const [currentImageResultUrl, changeResult] = useObjectURL()

    const [rotateAngle, setRotateAngle] = useControlledValue(0)
    const [randomPixelShift, setRandomPixelShift] = useControlledValue(0)
    const worker = useFlipperWorker()
    const { enqueueSnackbar } = useSnackbar()
    const handleMismatchMime = useCallback((file: File) => {
        enqueueSnackbar(`${file.name}的文件类型是不受支持的${file.type}。`, { variant: 'error' })
    }, [])
    const handleFileToMuch = useCallback(() => {
        enqueueSnackbar('拖入的文件数量太多啦！一个个来吧。', { variant: 'error' })
    }, [])
    const [dragEntered,refParentContainer,refDropzone,refFileUploader] = useDropzone(changeImage, handleMismatchMime, MIME_REG,1,handleFileToMuch)

    const execute = useCallback(async () => {
        setInProgress(true)
        try {
            const { files } = refFileUploader.current
            if (files.length != 1) {
                handleFileToMuch()
            } else {
                const blob = files[0]
                const result: ImageBitmap = await (await worker.postMessage({
                    img: blob,
                    rotate: rotateAngle,
                    rps: randomPixelShift
                } as FlipWorkerData))
                const canvas = document.createElement('canvas')
                canvas.width = result.width
                canvas.height = result.height
                canvas.getContext('bitmaprenderer').transferFromImageBitmap(result)
                result.close()
                changeResult(canvas.toDataURL())
            }
        } catch (e) {
            console.error(e)
        } finally {
            setInProgress(false)
        }
    }, [refFileUploader, worker, rotateAngle, randomPixelShift])

    return <UtilContainer ref={refParentContainer}>
        <Typography variant="h4">图片翻转</Typography>
        <Divider />
        <div className={gapStyles.vgap}></div>
        <Grid container spacing={2}>
            <Grid item md={6} xs={12}>
                <Card variant="outlined">
                    <Container className={gapStyles.has_vertical_gap}>
                        <Typography variant="h5">选择图像</Typography>
                        <Divider />
                        <Input inputRef={refFileUploader} id="image" type="file" inputProps={{ accept: "image/*" }} onChange={changeImage as any} required></Input>
                        <Button variant="outlined" color="primary" onClick={execute} disabled={inProgress || !currentImageUrl}>执行</Button><Fade
                            in={inProgress}
                            unmountOnExit
                            timeout={800}
                        >
                            <CircularProgress size={18} />
                        </Fade>
                        <Typography variant="subtitle1">当前图像</Typography>
                        <Placeholder className={style_preview} caption="选择文件或拖拽到这里" >
                            {currentImageUrl ? <img alt="preview" className={style_preview} src={currentImageUrl}></img> : null}
                        </Placeholder>
                        <Typography variant="subtitle1">运行结果</Typography>
                        <Placeholder className={style_preview} caption="暂无预览" >
                            {currentImageResultUrl ? <img alt="preview" className={style_preview} src={currentImageResultUrl}></img> : null}
                        </Placeholder>
                    </Container>

                </Card>
            </Grid>
            <Grid item md={6} xs={12}>
                <Card>
                    <Container className={gapStyles.has_vertical_gap}>
                        <Typography variant="h5">参数调整</Typography>
                        <Divider />
                        <div className={gapStyles.vgap}></div>
                        <span>
                            <Typography component="span" id="label-rotate-angle" variant="subtitle1">旋转角度:</Typography>
                            <Slider
                                step={1}
                                value={rotateAngle}
                                aria-labelledby="label-rotate-angle"
                                valueLabelDisplay="auto"
                                onChange={setRotateAngle}
                                {...ROTATE_RANGE_PROPS}
                            />
                        </span>
                        <span>
                            <Typography component="span" id="label-k" variant="subtitle1">随机更改像素点</Typography>
                            <Slider
                                step={1}
                                value={randomPixelShift}
                                aria-labelledby="label-k"
                                valueLabelDisplay="auto"
                                onChange={setRandomPixelShift}
                                {...RPS_PROPS}
                            />
                        </span>
                    </Container>
                </Card>
            </Grid>
        </Grid>
        <Portal>
            <Dropzone show={dragEntered} ref={refDropzone}/>
        </Portal>
    </UtilContainer>
}
export default function ConfuserPage() {
    return <SnackbarProvider {...SnackBarProviderProps}>
        <Confuser />
    </SnackbarProvider>
}