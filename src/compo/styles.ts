import { createStyles, makeStyles } from "@material-ui/core";
import { useMediaQuery } from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";

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
export const useFooterStyle = makeStyles(theme => {
    return {
        "footer": {
            margin: "10px 0 10px",
            "& a": {
                marginLeft: '5px',
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                "&:hover": {
                    textDecoration: 'underline',
                }
            }
        },
        flex: {
            display: 'flex',
            alignItems: 'flex-end',
        }
    }
})
export function useColorScheme() {
    const [value, set] = useState(false)
    const cb = useCallback((ev: MediaQueryListEvent) => {
        set(ev.matches)
    }, [])
    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)')
        query.addEventListener('change', cb)
        set(query.matches)
        return () => {
            query.removeEventListener('change', cb)
        }
    }, [])
    return value
}
export const useFlexCenter =
    makeStyles(() => {
        return {
            'flex-center': {
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
            }
        }
    })
