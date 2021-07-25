import { makeStyles, Typography } from "@material-ui/core";
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
            marginLeft:"auto",
            marginRight:"auto"
        },
        middle: {
            textAlign: 'center',
            color: theme.palette.grey[700]
        }
    }
})
export function RealSizeSensor({ size: { width, height }, caption }: { size: Sensor_Size, caption?: string }) {
    const styles = useStyles()
    const prop_width = `${width}mm`, prop_height = `${height}mm`
    return <div className={styles.realSizeSensor} style={{
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
        </div>

    </div>
}