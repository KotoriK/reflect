import { InputAdornment, TextField } from "@material-ui/core"
import clsx from "clsx"
import { useCallback, ChangeEvent } from "react"
import { useFormCtrlStyle } from "./styles"

export interface Lens{
    focal:number,
    aperture:number
}
export function getLensName({focal,aperture}:Lens){
    return `${focal.toFixed(2)}mm F/${aperture.toFixed(2)}`
}
export function OP_Lens({lens,onChange,className}:{lens:Lens,onChange:(next:Lens)=>void,className?:string}){
    const styles = clsx(className, useFormCtrlStyle().formControl)
    const {focal,aperture}=lens
    const handleFocal = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({
            focal: parseFloat(event.target.value), aperture
        })
    }, [onChange, aperture])
    const handleAperture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({
            focal, aperture: parseFloat(event.target.value)
        })
    }, [onChange, focal])
    return <>
    <TextField className={styles} label="镜头35mm焦距" value={focal} onChange={handleFocal} InputProps={{ endAdornment: <InputAdornment position="start">mm</InputAdornment> }} />
    <TextField className={styles} label="镜头光圈" value={aperture} onChange={handleAperture} InputProps={{ startAdornment: <InputAdornment position="start">F/</InputAdornment> }} /></>
}