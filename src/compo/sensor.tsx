import { FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Grid, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import React, { useState, useCallback, ChangeEvent, ReactNode } from "react"
import { useIntl } from "react-intl"
import { useFormCtrlStyle } from "./styles"
import clsx from 'clsx'
import { RealSizeSensor } from "./RealSizeSensor"

export const SENSOR_SIZES = {
    "8x10": {
        width: 254, height: 203
    },
    "5x7": {
        width: 178, height: 127
    },
    "4x5": {
        width: 121, height: 97
    },
    "instax_wide": {
        width: 99, height: 62
        //https://instax.com/wide/en/
    },
    "6x12": {
        width: 118, height: 56
    },
    "6x9": {
        width: 84, height: 56
    },
    "6x8": {
        width: 76, height: 56
    },
    "IMAX": {
        width: 70.41, height: 52.63
    },
    "6x7": {
        width: 70, height: 56
    },
    "instax_square": {
        width: 62, height: 62
        //https://instax.com/mini_liplay/en/
    },
    "6x6": {
        width: 56, height: 56
    },
    "instax_mini": {
        width: 62, height: 46
        //https://instax.com/mini_liplay/en/
    },
    "6x4.5": {
        width: 42, height: 56
    },
    '4433': {
        width: 44, height: 33
    },
    '135': {
        width: 36, height: 24
    },
    'super35_2p': {
        width: 24.89, height: 9.35
    },
    'super35_3p': {
        width: 24.89, height: 13.86
    },
    'super35_4p': {
        width: 24.89, height: 18.66
    },
    'APS-H(Canon)': {
        width: 28.7, height: 19
    },
    'APS-C(Canon)': {
        width: 22.3, height: 14.9
    },
    'APS-C': {
        width: 23.6, height: 15.6
    },
    'APS-C(Sigma)': {
        width: 20.7, height: 13.8
    },
    '4/3': {
        width: 21.60, height: 17.30
    },
    '110': {
        width: 17, height: 13
    },
    '1inch': {
        width: 13.20, height: 8.8
    },
    'standard16': {
        width: 10.26, height: 7.49
    },
    'super16': {
        width: 12.52, height: 7.41
    },
    '1/1.7inch': {
        width: 7.6, height: 5.7
    },
    '1/3inch': {
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
export function getCropFactorDia(a: Sensor_Size, b: Sensor_Size) {
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
export function getKeyOfSensorSize(size: Sensor_Size) {
    const { width, height } = size
    return width + 'x' + height
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
export function OP_SensorSize({ className, value, onChange, showRealSizeSensor }: { className?: string, value?: Sensor_Size, onChange: (data: Sensor_Size) => void, showRealSizeSensor: boolean }) {
    const intl = useIntl()
    const [mode_custom, setMode] = useState(false)
    const styles = clsx(className, useFormCtrlStyle().formControl)
    const handleChange = useCallback((ev) => {
        setMode(ev.target.value ? false : true);
        onChange(ev.target.value as any)
    }, [])
    return <Grid container>
        <Grid lg item>
            <OptionSelect onChange={handleChange} value={value}
                className={styles} name={"传感器尺寸"} options={Object.entries(SENSOR_SIZES)
                    .map(([name, size]) => [size, intl.formatMessage({ id: getNameId(name) })]
                    )} />
            <OP_SensorSize_Custom className={styles} onChange={onChange} value={value} readonly={!mode_custom} />

        </Grid>
        {/* {(value != SENSOR_SIZES['']) && <>
            <Grid lg item>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <AspectRatioIcon/>
                        </ListItemIcon>
                        <ListItemText primary="纵横比" secondary={ratio(value.width,value.height)}/>
                    </ListItem>
                </List>
            </Grid>
        {showRealSizeSensor && <Grid lg item style={{ alignSelf: 'center' }}><RealSizeSensor size={value} /></Grid>}</>} */}
        {(value != SENSOR_SIZES['']) && 
        showRealSizeSensor && <Grid lg item style={{ alignSelf: 'center' }}><RealSizeSensor size={value} /></Grid>}
    </Grid>
}