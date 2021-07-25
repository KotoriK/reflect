import { Container, makeStyles, Paper } from "@material-ui/core";
import clsx from "clsx";
import '../../node_modules/github-markdown-css/github-markdown.css'
const useStyles = makeStyles(theme => {
    return {
        body: {
            paddingTop: theme.spacing(5),
            paddingBottom: theme.spacing(5),
            color:theme.palette.text.primary + " !important",
            "& a":{
                color:theme.palette.primary.main + " !important"
            }
        },
    }
})

export default function Mdx({ children }: { children: JSX.Element }) {
    const styles = useStyles()
    return <Container>
        <Paper>
            <Container className={clsx(styles.body,"markdown-body")}>
                {children}
            </Container>
        </Paper>
    </Container>
}