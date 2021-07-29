import { Container, Divider, List, ListItem, makeStyles, Paper, Typography, useTheme, Grid, ListItemIcon, ListItemText, IconButton, Checkbox, Button } from '@material-ui/core'

import { connect, useSelector } from 'react-redux'
import { StateWithHistory, } from 'redux-undo'
import { getLensName, Lens, OP_Lens } from './lens';

import { OP_SensorSize, SENSOR_SIZES, Sensor_Size, Size2Name, getStopLost, getCropFactorDia, getNameId, getCropFactorWidth, getKeyOfSensorSize } from './sensor'

//react hooks
import { useCallback, useMemo, } from 'react';
import { useIntl } from 'react-intl';

//icons
import CropIcon from '@material-ui/icons/Crop';
import ExposureIcon from '@material-ui/icons/Exposure';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { useRouter } from 'next/router';
import { useGapStyle } from './styles';

export const EFL_RESULT_KEY = 'efl_result'
export interface EFLState {
    lens: Lens,
    sensors: Array<Sensor_Size>,
    baseSensorIndex: number
}
export type EFLStateAction = {
    type: 'lens',
    data: Lens
} | {
    type: 'add_sensor',
    data: Sensor_Size
} | {
    type: 'remove_sensor',
    i: number
} | {
    type: 'clear_sensors'
} | {
    type: 'edit_sensor',
    data: Sensor_Size,
    i: number
} | {
    type: 'base_sensor',
    i: number
}
export const useEFLStyles = makeStyles(theme => {
    return {
        baseSensor: {
            border: theme.palette.primary.light + ' dotted'
        },
        block: {
            padding: theme.spacing(3)
        },
        listItem: {
            display: 'block'
        },
        ul: {
            marginBlockStart: 0,
            marginBlockEnd: 0,
            paddingInlineStart: 20
        }
    }
})

const defaultEFLState: EFLState = {
    lens: {
        focal: 50, aperture: 1.4
    },
    sensors: [SENSOR_SIZES[''], SENSOR_SIZES[135]],
    baseSensorIndex: 1
}

export function EFLStateReducer(state: EFLState = defaultEFLState, action: EFLStateAction): EFLState {
    let { lens, sensors: _sensors, baseSensorIndex } = state
    let sensors = [..._sensors]
    switch (action.type) {
        case 'add_sensor':
            sensors.push(action.data)
            break
        case 'clear_sensors':
            sensors = []
            break
        case 'edit_sensor':
            sensors[action.i] = action.data
            break
        case 'lens':
            lens = action.data
            break
        case 'remove_sensor':
            {
                const { i } = action
                if (baseSensorIndex == i) baseSensorIndex = (i - 1) >= 0 ? (i - 1) : 0
                sensors.splice(i)
                break
            }
        case 'base_sensor':
            const { i } = action
            if (i >= 0 && i < sensors.length) {
                baseSensorIndex = i
            } else {
                return state
            }
            break
        default: return state
    }
    return { lens: lens, sensors, baseSensorIndex: baseSensorIndex }
}
function setLens(next: Lens): EFLStateAction {
    return {
        type: 'lens', data: next
    }
}
function addSensor(data: Sensor_Size): EFLStateAction {
    return {
        type: 'add_sensor',
        data
    }
}
function editSensor(data: Sensor_Size, i: number): EFLStateAction {
    return {
        type: 'edit_sensor',
        data, i
    }
}
function removeSensor(i: number): EFLStateAction {
    return {
        type: 'remove_sensor',
        i
    }
}
function clearSensors(): EFLStateAction {
    return {
        type: 'clear_sensors',
    }
}
function setBaseSensor(i: number): EFLStateAction {
    return {
        type: 'base_sensor',
        i
    }
}
export const OP_SensorSize_Group_Connected = connect((state: StateWithHistory<EFLState>) => { return { sensors: state.present.sensors, baseSensor: state.present.baseSensorIndex } }
    , dispatch => {
        return {
            editSensor: (data: Sensor_Size, i: number) => dispatch(editSensor(data, i)),
            setBaseSensor: (i: number) => dispatch(setBaseSensor(i))
        }
    })(function OP_SensorSize_Group_Connected({ showRealSizeSensor, baseSensor, sensors, editSensor, setBaseSensor }: {
        sensors: Sensor_Size[], baseSensor: number, editSensor: (data: Sensor_Size, i: number) => EFLStateAction, showRealSizeSensor: boolean, setBaseSensor: any
    }) {
        const styles = useEFLStyles()
        return <>{sensors.map((sensor, index) => {
            const isBaseSensor = index == baseSensor
            return <OP_SensorSize key={index}
                showRealSizeSensor={showRealSizeSensor}
                value={sensor}
                onChange={(data) => editSensor(data, index)}
                index={index}
                setBaseSensor={setBaseSensor}
                isBaseSensor={isBaseSensor}
                baseSensorClassName={styles.baseSensor} />
        }
        )}</>
    })
export const OP_Lens_Connected = connect((state: StateWithHistory<EFLState>) => { return { lens: state.present.lens } }, dispatch => {
    return { setLens: (data: Lens) => dispatch(setLens(data)) }
})(function OP_Lens_Connected({ lens, setLens }: { setLens: (data: Lens) => EFLStateAction, lens: Lens }) {
    return <ListItem><OP_Lens lens={lens} onChange={setLens} /></ListItem>
})
interface ResultProp {
    baseSensor: Sensor_Size,
    cropFactDia: number,
    cropFactWidth: number,
    stopLost: number,
    sensor: Sensor_Size,
    lens: Lens,
    lens_equivalent: Lens
    lens_equivalent_widthCrop: Lens
}
const SensorHighlight = (caption: string) => <span style={{ color: useTheme().palette.primary.main }}>{caption}</span>
export function PrintResult({ baseSensor, cropFactDia, stopLost, sensor, lens, lens_equivalent, cropFactWidth, lens_equivalent_widthCrop }: ResultProp) {
    const intl = useIntl()
    const baseSensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(getKeyOfSensorSize(baseSensor))) }), [baseSensor])
    const sensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(getKeyOfSensorSize(sensor))) }), [sensor])
    const theme = useTheme()
    return <>
        <Typography component="span" variant='h6' style={{ textDecoration: 'bold' }}>{`${sensorName}`}</Typography>
        {' '}
        <Typography component="span" variant='subtitle2' style={{ textDecoration: 'bold', color: theme.palette.primary.main }}>{`与${baseSensorName}相比较`}</Typography>
        <List>
            <ListItem>
                <ListItemIcon><CropIcon /></ListItemIcon>
                <ListItemText primary="裁切系数（对角线）" secondary={cropFactDia.toFixed(3)} />
            </ListItem>
            <ListItem>
                <ListItemIcon><CropIcon /></ListItemIcon>
                <ListItemText primary="裁切系数（宽度）" secondary={cropFactWidth.toFixed(3)} />
            </ListItem>
            <ListItem>
                <ListItemIcon><ExposureIcon /></ListItemIcon>
                <ListItemText primary="进光量变化" secondary={stopLost.toFixed(3)} />
            </ListItem>
        </List>
        <Typography component="p" variant="body2">{SensorHighlight(sensorName)}{`上的${getLensName(lens)} `}
            {'等效为'}
            {SensorHighlight(baseSensorName)}
            {`上的 ${getLensName(lens_equivalent)}(对角线)，${getLensName(lens_equivalent_widthCrop)}(宽度)`}</Typography>
        <Typography variant="caption" color="textSecondary"><strong>等效 </strong>是指视角与景深等效，不考虑纵横比变化。计算的光圈值仅考虑等效景深，进光量变化未考虑。</Typography>
    </>
}

export const AddRemoveSensor = connect((state: StateWithHistory<EFLState>) => { return { sensors: state.present.sensors } }, dispatch => {
    return {
        addSensor: (data: Sensor_Size) => dispatch(addSensor(data)),
        removeSensor: (i: number) => dispatch(removeSensor(i)),
    }
})(function AddRemoveSensor({ sensors, addSensor, removeSensor }: any) {
    const canAdd = !(sensors.length < 11)
    const canRemove = !(sensors.length > 2)
    const onAdd = useCallback(() => {
        addSensor(SENSOR_SIZES[''])
    }, [])
    const onRemove = useCallback(() => {
        removeSensor(sensors.length - 1)
    }, [sensors])
    return <>
        <IconButton aria-label="Add" color="primary" disabled={canAdd} onClick={onAdd}>
            <AddIcon />
        </IconButton>
        <IconButton aria-label="Remove" color="primary" disabled={canRemove} onClick={onRemove}>
            <RemoveIcon />
        </IconButton>
    </>
})
export type EFLResultContainerProp = Pick<EFLState,"sensors"|"lens"> & {baseSensor:Sensor_Size}
export const EFLResultContainer = ({ sensors, baseSensor, lens }: EFLResultContainerProp) => {
    const styles = useEFLStyles()
    return <><Typography variant="h5">结果</Typography>
        <Divider />
        <List>
            {sensors
                .map((sensor, index) => {
                    const cropFactDia = getCropFactorDia(sensor, baseSensor)
                    const cropFactWidth = getCropFactorWidth(sensor, baseSensor)
                    return <ListItem key={`r${index}`} className={styles.listItem}>
                        <PrintResult stopLost={getStopLost(sensor, baseSensor)}
                            cropFactDia={cropFactDia} cropFactWidth={cropFactWidth}
                            baseSensor={baseSensor} sensor={sensor} lens={lens}
                            lens_equivalent={{ focal: (lens.focal * cropFactDia), aperture: (lens.aperture * cropFactDia) }}
                            lens_equivalent_widthCrop={{ focal: (lens.focal * cropFactWidth), aperture: (lens.aperture * cropFactWidth) }}
                        />
                    </ListItem>
                })}
        </List></>
}
export const EFLResult = () => {
    const state: EFLState = useSelector((state: StateWithHistory<EFLState>) => state.present)
    const { sensors, lens, baseSensorIndex } = state
    const baseSensor = [...sensors].splice(baseSensorIndex, 1)[0]
    const sensors_Filled = sensors.filter((sensor) => sensor != SENSOR_SIZES[''])
    const gapStyles = useGapStyle()
    const router = useRouter()
    const doPrint = () => {
        localStorage.setItem(EFL_RESULT_KEY, JSON.stringify({ baseSensor, lens, sensors: sensors_Filled }))
        router.push('/efl/print')
    }
    return <>
        {sensors_Filled.length > 1 ? <Grid item sm={12} lg={6}>
            <Paper>
                <Container>
                    <div className={gapStyles.vgap}></div>
                    <EFLResultContainer lens={lens} baseSensor={baseSensor} sensors={sensors_Filled} />
                    <Button color="primary" variant="contained" onClick={doPrint}>打印结果</Button>
                    <div className={gapStyles.vgap}></div>
                </Container>
            </Paper>
        </Grid> : null}
    </>
}