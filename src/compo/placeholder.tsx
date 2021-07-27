import { createStyles, makeStyles, Typography } from "@material-ui/core"
import clsx from 'clsx'
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
const Placeholder = ({ className, caption, children }: { caption: string, className?: string, children?: JSX.Element }) => {
    const styles = useStyles()
    const styles_flexCenter = useFlexCenter()["flex-center"]
    return <div className={clsx(!children && styles.dashed, styles_flexCenter, className)}>
        {children ?? <Typography variant="subtitle2">{caption}</Typography>}
    </div>
}
export default Placeholder