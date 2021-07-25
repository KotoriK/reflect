import { FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Grid } from "@material-ui/core"
import React, { useState, useCallback, ChangeEvent, ReactNode } from "react"
import { useIntl } from "react-intl"
import { useFormCtrlStyle } from "./styles"
import clsx from 'clsx'
import { RealSizeSensor } from "./RealSizeSensor"
export const SENSOR_SIZES = {
    "4x5": {
        width: 121, height: 97
    }, "6x9": {
        width: 84, height: 56
    }, "6x8": {
        width: 76, height: 56
    }, "6x7": {
        width: 70, height: 56
    }, "6x4.5": {
        width: 42, height: 56
    }, '4433': {
        width: 44, height: 33
    }, '135': {
        width: 36, height: 24
    }, 'super35': {
        width: 24.89, height: 18.66
    }, 'APS-H(Canon)': {
        width: 28.7, height: 19
    }, 'APS-C(Canon)': {
        width: 22.3, height: 14.9
    }, 'APS-C': {
        width: 28.2, height: 23.6
    }, 'APS-C(Sigma)': {
        width: 20.7, height: 13.8
    }, '4/3': {
        width: 21.60, height: 17.30
    }, '1inch': {
        width: 13.20, height: 8.8
    }, 'super16': {
        width: 12.52, height: 7.41
    }, '1/1.7inch': {
        width: 7.6, height: 5.7
    }, '1/3inch': {
        width: 4.8, height: 3.6
    }, '': { width: 0, height: 0 }

    /* , custom: undefined */
}
export const Size2Name = new Map(Object.entries(SENSOR_SIZES).map(([name, size]) => [size, name]))
export function getNameId(name: string) {
    return `sensor_size.${name}`
}
export function getSensorDiagonalLength(sensor: Sensor_Size) {
    const { width, height } = sensor
    return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
}
export function getCropFactor(a: Sensor_Size, b: Sensor_Size) {
    //https://en.wikipedia.org/wiki/Image_sensor_format#cite_note-34
    return getSensorDiagonalLength(b) / getSensorDiagonalLength(a)
}
export function getSensorArea(sensor: Sensor_Size) {
    const { width, height } = sensor
    return width * height
}
export function getStopLost(a: Sensor_Size, b: Sensor_Size) {
    //https://en.wikipedia.org/wiki/Image_sensor_format#cite_note-33
    return Math.log2(getSensorArea(a) / getSensorArea(b))
}
export interface Sensor_Size {
    width: number, height: number
}
export function OptionSelect({ name, options, className, onChange, value }: ({
    name: string,
    options: Array<[any, string]>,
    onChange: (event: ChangeEvent<{
        name?: string;
        value: unknown;
    }>, child: ReactNode) => void,
    value: Sensor_Size
} & { className: string })) {

    return <FormControl className={className}>
        <InputLabel>{name}</InputLabel>
        <Select onChange={onChange} value={value}>
            {options.map(([value, caption]) => (
                <MenuItem key={caption} value={value}>
                    {caption}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
}
function OP_SensorSize_Custom({ className, onChange, value = { width: 0, height: 0 }, readonly }: { className: string, onChange: (value: Sensor_Size) => void, value: Sensor_Size, readonly: boolean }) {
    const { width, height } = value
    const handleWidth = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({
            width: parseFloat(event.target.value), height
        })
    }, [onChange, height])
    const handleHeight = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({
            width, height: parseFloat(event.target.value)
        })
    }, [onChange, width])
    return <>
        <TextField className={className} label="宽" value={width} onChange={handleWidth} InputProps={{ endAdornment: <InputAdornment position="start">mm</InputAdornment>, readOnly: readonly }} />
        <TextField className={className} label="高" value={height} onChange={handleHeight} InputProps={{ endAdornment: <InputAdornment position="start">mm</InputAdornment>, readOnly: readonly }} /></>
}
export function OP_SensorSize({ className, value, onChange }: { className?: string, value?: Sensor_Size, onChange: (data: Sensor_Size) => void }) {
    const intl = useIntl()
    const [mode_custom, setMode] = useState(false)
    const styles = clsx(className, useFormCtrlStyle().formControl)
    const handleChange = useCallback((ev: ChangeEvent<{
        name?: string;
        value: unknown;
    }>, child: ReactNode) => { setMode(ev.target.value ? false : true); onChange(ev.target.value as any) }
        , [setMode])
    return <Grid container>
        <Grid lg item>
            <OptionSelect onChange={handleChange} value={value}
                className={styles} name={"传感器尺寸"} options={Object.entries(SENSOR_SIZES)
                    .map(([name, size]) => [size, intl.formatMessage({ id: getNameId(name) })]
                    )} />
            <OP_SensorSize_Custom className={styles} onChange={onChange} value={value} readonly={!mode_custom} />
        </Grid>
        {value != SENSOR_SIZES[''] && <Grid lg item style={{alignSelf:'center'}}><RealSizeSensor size={value} /></Grid>}
    </Grid>
}