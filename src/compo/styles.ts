import { createStyles, makeStyles } from "@material-ui/core";

export const useFormCtrlStyle = makeStyles(theme => {
    return {
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
    }
})
export const useGapStyle = makeStyles((theme) => createStyles({
    vgap: {
        height: 20
    },
    "has_vertical_gap": {
        marginTop: 15,
        marginBottom: 12
    },
}))