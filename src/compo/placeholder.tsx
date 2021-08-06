import { createStyles, makeStyles, Typography } from "@material-ui/core"
import clsx from 'clsx'
import { forwardRef } from "react"
import { useFlexCenter } from "./styles"
const useStyles = makeStyles((theme) => createStyles({
    'container': {
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
    },
    'dashed': {
        border: theme.palette.text.primary + " dashed",
    }
}))
export interface PlaceholderProps{ caption: string, className?: string, children?: JSX.Element }
const Placeholder = forwardRef<HTMLDivElement,PlaceholderProps>(({ className, caption, children },ref) => {
    const styles = useStyles()
    const styles_flexCenter = useFlexCenter()["flex-center"]
    return <div ref={ref} className={clsx(!children && styles.dashed, styles_flexCenter, className)}>
        {children ?? <Typography variant="subtitle2">{caption}</Typography>}
    </div>
})
export default Placeholder