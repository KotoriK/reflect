import { createStyles, makeStyles, Typography } from "@material-ui/core"
import clsx from 'clsx'
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
    return <div className={clsx(!children && styles.dashed, styles.container, className)}>
        {children ?? <Typography variant="subtitle2">{caption}</Typography>}
    </div>
}
export default Placeholder