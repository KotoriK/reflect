import { makeStyles, Typography } from "@material-ui/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sensor_Size } from "./sensor";
const useStyles = makeStyles((theme) => {
    return {
        realSizeSensor: {
            borderStyle: 'solid',
            borderRadius: '3px',
            borderColor: theme.palette.grey[900],
            backgroundColor: theme.palette.grey.A100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: "auto",
            marginRight: "auto"
        },
        middle: {
            textAlign: 'center',
            color: theme.palette.grey[700]
        }
    }
})
function useCurrentAvailWidth() {
    const [width, set] = useState(0)
    useEffect(() => {
        //假设屏幕不会变化
        //虽然还是会变的
        set(screen.availWidth)
    }, [])
    return width
}
export function RealSizeSensor({ size: { width, height }, caption }: { size: Sensor_Size, caption?: string }) {
    const styles = useStyles()
    const prop_width = `${width}mm`, prop_height = `${height}mm`
    const ref = useRef<HTMLDivElement>()
    const [isWiderThanScreen, setIsWiderThanScreen] = useState(false)
    const availWidth = useCurrentAvailWidth()
    useEffect(() => {
        const element = ref.current
        if (element) {
            setIsWiderThanScreen(element.clientWidth >= availWidth)
        }
    }, [width, availWidth])
    return <div ref={ref} className={styles.realSizeSensor} style={{
        width: prop_width,
        height: prop_height,
        minHeight: prop_height,
        minWidth: prop_width,
        maxHeight: prop_height,
        maxWidth: prop_width
    }}>
        <div className={styles.middle}>
            {caption ? <Typography variant='subtitle2' >{caption}</Typography> : null}
            <Typography variant='subtitle2' >{`${prop_width} x ${prop_height}`}</Typography>
            {isWiderThanScreen && <Typography variant='subtitle2' style={{ color: 'red' }}>传感器大小大于屏幕宽度</Typography>}
        </div>

    </div>
}