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
export const useFooterStyle = makeStyles(theme=>{
    return {
        "footer": {
            margin: "10px 0 10px",
            "& a": {
                marginLeft: '5px',
                color: theme.palette.text.primary,
                textDecoration: 'none',
                "&:hover": {
                    textDecoration: 'underline',
                }
            }
        },
        flex:{
            display: 'flex',
            alignItems: 'flex-end',
        }
    }
})