import { Input, Button, Container, Grid, makeStyles, Typography, Divider, Card, Slider, Switch, FormControlLabel, CircularProgress, Fade } from '@material-ui/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createStyles } from '@material-ui/core'
import { readImage, KMeansResult, readImageDownsampling, normalizeRGBA, rgbaToHSLA, sortHSL } from 'palette'
import GitHubIcon from '@material-ui/icons/GitHub';
import Placeholder from '../compo/placeholder'
import Color from '../compo/color'
import PromiseWorker from 'promise-worker';
import UtilContainer from '../container/util'
import { useGapStyle, useFooterStyle } from '../compo/styles';
import useControlledValue from '../compo/controlledValue'
import clsx from 'clsx';
import Link from 'next/link'
import { useUploadImage } from '../compo/image';
import { mapRangeToSliderProp } from '../utils';
function useThemeColorWorker() {
    const promiseWorker = useRef<PromiseWorker>()
    useEffect(() => {
        const worker = new Worker(new URL('../worker/ThemeColorWorker.ts', import.meta.url))
        promiseWorker.current = new PromiseWorker(worker)
        return () => {
            worker.terminate()
        }
    }, [])
    return promiseWorker.current
}
export const useStyles = makeStyles((theme) => createStyles({
    "color": {
        height: '3vh',
        width: "3vh"
    },
    "preview": {
        height: "20vh",
        marginLeft: "auto",
        marginRight: "auto"
    },
    "result": {
        display: "flex",
        "& span": {
            marginLeft: 8,

        }
    }
}))
const defaultKSetting = {
    k: 3, iteration: 20
}
const KMeansSetting_k_range = [1, 5, 10]
const KMeansSetting_iteration_range = [5, 100, 200]
const KMeansSetting_k_Prop = mapRangeToSliderProp(KMeansSetting_k_range)
const KMeansSetting_iteration_Prop = mapRangeToSliderProp(KMeansSetting_iteration_range)

type ThemeColorStateResult = Pick<KMeansResult, 'iterate_time' | 'cluster_center' | 'fit_thresold' | 'size'> & { label: string[] }

export default function ThemeColor() {
    const [currentImageUrl, changeImage] = useUploadImage()
    const [result, setResult] = useState<ThemeColorStateResult>()
    const [doDownSample, setDoDownSample] = useControlledValue(true)
    const [kMeansSetting_k, setKMeansSetting_k] = useControlledValue(defaultKSetting.k)
    const [kMeansSetting_iteration, setKMeansSetting_iteration] = useControlledValue(defaultKSetting.iteration)
    const refImageElement = useRef<HTMLImageElement>()
    const themeColorWorker = useThemeColorWorker()
    const [inProgress, setInProgress] = useState(false)
    const execute = useCallback(async () => {
        const { current } = refImageElement
        const data = doDownSample ? readImageDownsampling(current, 10 * 1000) : readImage(current)
        setInProgress(true)
        const result: any = await themeColorWorker.postMessage({
            k: kMeansSetting_k, iteration: kMeansSetting_iteration,
            img: data
        })
        const { size } = result
        result.label = (result as KMeansResult).label.map(value => (value / size * 100).toFixed(2) + '%')
        setResult(result)
        setInProgress(false)
    }, [refImageElement, kMeansSetting_k, kMeansSetting_iteration, doDownSample, themeColorWorker])

    const styles = useStyles()
    const gapStyles = useGapStyle()
    const footerStyles = useFooterStyle()

    const mappedResult = useMemo(() =>
        result && <>
            <div className={styles.result}>
                <Typography component="span" variant="subtitle1"><strong>像素个数：</strong>{result.size}</Typography>
                <Typography component="span" variant="subtitle1"><strong>达到拟合要求：</strong>{result.fit_thresold ? "是" : "否"}</Typography>
                <Typography component="span" variant="subtitle1"><strong>迭代次数：{result.iterate_time}</strong></Typography>
            </div>
            <br />
            {result.cluster_center.map(v => [v, rgbaToHSLA(normalizeRGBA(v))])
                .sort((a, b) => sortHSL([2, 0, 1, 3])(a[1], b[1]))
                .map(([pixel, _], index) => <Grid key={index} item>
                    <Color color={pixel} className={styles.color} percent={result.label[index]}></Color>
                </Grid>)}
        </>
        , [result])
    return <UtilContainer>
        <Typography variant="h4">主题颜色</Typography>
        <Divider />
        <div className={gapStyles.vgap}></div>

        <Grid container spacing={2}>
            <Grid item md={6} xs={12}>
                <Card variant="outlined">
                    <Container className={gapStyles.has_vertical_gap}>
                        <Typography variant="h5">选择图像</Typography>
                        <Divider />
                        <Input id="image" type="file" inputProps={{ accept: "image/*" }} onChange={changeImage} required></Input>
                        <Button variant="outlined" color="primary" onClick={execute} disabled={inProgress || !currentImageUrl}>执行</Button><Fade
                            in={inProgress}
                            unmountOnExit
                            timeout={800}
                        >
                            <CircularProgress size={18} />
                        </Fade>
                        <Typography variant="subtitle1">当前图像</Typography>
                        <Placeholder className={styles.preview} caption="暂无预览" >
                            {currentImageUrl ? <img ref={refImageElement} alt="preview" className={styles.preview} src={currentImageUrl}></img> : null}
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
                        <span >
                            <Typography component="span" id="label-iteration" variant="subtitle1">迭代次数:</Typography>
                            <Slider
                                step={1}
                                {...KMeansSetting_iteration_Prop}
                                value={kMeansSetting_iteration}
                                aria-labelledby="label-iteration"
                                valueLabelDisplay="auto"
                                onChange={setKMeansSetting_iteration}
                            ></Slider>
                        </span>
                        <span>
                            <Typography component="span" id="label-k" variant="subtitle1">类的个数(k)</Typography>
                            <Slider
                                step={1}
                                value={kMeansSetting_k}
                                aria-labelledby="label-k"
                                valueLabelDisplay="auto"
                                onChange={setKMeansSetting_k}
                                {...KMeansSetting_k_Prop}
                            ></Slider>
                        </span>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={doDownSample}
                                    onChange={setDoDownSample}
                                    name="checkedB"
                                    color="primary"
                                />
                            }
                            label="开启降采样"
                        />
                    </Container>
                </Card>
            </Grid>
            {result && <Grid item md xs={12}>
                <Card>
                    <Container className={gapStyles.has_vertical_gap}>
                        <Typography variant="h5">结果</Typography>
                        <Divider />
                        <Grid container spacing={2} className={gapStyles.has_vertical_gap}>
                            {mappedResult}
                        </Grid>
                    </Container>
                </Card>
            </Grid>}
        </Grid>
        <Divider variant="fullWidth" className={gapStyles.has_vertical_gap} />
        <div className={clsx(footerStyles.footer, footerStyles.flex)}>
            <GitHubIcon />
            <Link href="https://github.com/KotoriK/palette" passHref>
                <Typography component="a" variant='caption'>KotoriK/palette</Typography>
            </Link>
        </div>
    </UtilContainer>
}


