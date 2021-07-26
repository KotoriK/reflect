import { Container, Divider, List, ListItem, makeStyles, Paper, Typography, useTheme, Grid, Switch, FormControlLabel, ListItemIcon, ListItemText, IconButton } from '@material-ui/core'
import clsx from 'clsx';

import { connect, Provider, useSelector } from 'react-redux'
import { createStore,Action } from 'redux'
import undoable, { StateWithHistory, ActionCreators as UndoActionCreators } from 'redux-undo'
import { getLensName, Lens, OP_Lens } from '../compo/lens';
import { IntlProvider } from 'react-intl'
import defaultLocaleConfig from '../locale'
import { OP_SensorSize, SENSOR_SIZES, Sensor_Size, Size2Name, getStopLost, getCropFactor, getNameId, getKeyOfSensorSize } from '../compo/sensor'
import UtilContainer from '../container/util';
import Link from 'next/link'
//react hooks
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFooterStyle, useGapStyle } from '../compo/styles';
import useControlledValue from '../compo/controlledValue';

//icons
import CropIcon from '@material-ui/icons/Crop';
import ExposureIcon from '@material-ui/icons/Exposure';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';

interface EFLState {
    lens: Lens,
    sensors: Array<Sensor_Size>,
    baseSensor: number
}
type EFLStateAction = {
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
const useStyles = makeStyles(theme => {
    return {
        baseSensor: {
            backgroundColor: theme.palette.primary.light + '88'
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
function EFLStateReducer(state: EFLState = { lens: { focal: 50, aperture: 1.4 }, sensors: [SENSOR_SIZES[''], SENSOR_SIZES[135]], baseSensor: 1 }, action: EFLStateAction): EFLState {
    let { lens, sensors: _sensors, baseSensor } = state
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
            sensors.splice(action.i)
            break
        case 'base_sensor':
            const { i } = action
            if (i >= 0 && i < sensors.length) {
                baseSensor = i
            } else {
                return state
            }
            break
        default: return state
    }
    return { lens: lens, sensors, baseSensor }
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
const OP_SensorSize_Group_Connected = connect((state: StateWithHistory<EFLState>) => { return { sensors: state.present.sensors, baseSensor: state.present.baseSensor } }
    , dispatch => {
        return {
            addSensor: (data: Sensor_Size) => dispatch(addSensor(data)),
            removeSensor: (i: number) => dispatch(removeSensor(i)),
            editSensor: (data: Sensor_Size, i: number) => dispatch(editSensor(data, i)),
            clear: () => dispatch(clearSensors()),
            setBaseSensor: (i: number) => dispatch(setBaseSensor(i))
        }
    })(function OP_SensorSize_Group_Connected({ showRealSizeSensor, baseSensor, sensors, addSensor, removeSensor, editSensor, clear }: {
        sensors: Sensor_Size[], baseSensor: number, addSensor: (data: Sensor_Size) => EFLStateAction,
        removeSensor: (i: number) => EFLStateAction, editSensor: (data: Sensor_Size, i: number) => EFLStateAction,
        clear: () => EFLStateAction, showRealSizeSensor: boolean
    }) {
        const styles = useStyles()
        return <>
            {(sensors.length == 0 ? <ListItem><OP_SensorSize showRealSizeSensor={showRealSizeSensor} onChange={(data) => addSensor(data)}></OP_SensorSize></ListItem> : sensors.map((sensor, index) =>
                <ListItem className={clsx(index == baseSensor && styles.baseSensor)} key={getKeyOfSensorSize(sensor)}><OP_SensorSize showRealSizeSensor={showRealSizeSensor} value={sensor} onChange={(data) => editSensor(data, index)}></OP_SensorSize></ListItem>
            ))}</>
    })
const OP_Lens_Connected = connect((state: StateWithHistory<EFLState>) => { return { lens: state.present.lens } }, dispatch => {
    return { setLens: (data: Lens) => dispatch(setLens(data)) }
})(function OP_Lens_Connected({ lens, setLens }: { setLens: (data: Lens) => EFLStateAction, lens: Lens }) {
    return <ListItem><OP_Lens lens={lens} onChange={setLens} /></ListItem>
})
interface ResultProp {
    baseSensor: Sensor_Size, cropFactor: number, stopLost: number, sensor: Sensor_Size
    , lens_35mm: Lens, lens_sameEffect: Lens
}
const SensorHighlight = (caption: string) => <span style={{ color: useTheme().palette.secondary.main }}>{caption}</span>
function Result({ baseSensor, cropFactor, stopLost, sensor, lens_35mm, lens_sameEffect }: ResultProp) {
    const intl = useIntl()
    const baseSensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(baseSensor)) }), [baseSensor])
    const sensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(sensor)) }), [sensor])
    const theme = useTheme()
    return <>
        <Typography component="span" variant='h6' style={{ textDecoration: 'bold' }}>{`${sensorName}`}</Typography>
        {' '}
        <Typography component="span" variant='subtitle2' style={{ textDecoration: 'bold', color: theme.palette.secondary.main }}>{`与${baseSensorName}相比较`}</Typography>
        <List>
            <ListItem>
                <ListItemIcon><CropIcon /></ListItemIcon>
                <ListItemText primary="裁切系数" secondary={cropFactor.toFixed(3)} />
            </ListItem>
            <ListItem>
                <ListItemIcon><ExposureIcon /></ListItemIcon>
                <ListItemText primary="进光量损失" secondary={stopLost.toFixed(3)} />
            </ListItem>
        </List>
        <Typography component="p" variant="body2">{`您选择的 ${getLensName(lens_35mm)} 在`}
            {SensorHighlight(sensorName)}
            {'上等效为'}
            {SensorHighlight(baseSensorName)}
            {`上的 ${getLensName(lens_sameEffect)}`}</Typography>
    </>
}

function useResults() {
    const { sensors: _sensors, baseSensor: baseIndex, lens } = useSelector((state: StateWithHistory<EFLState>) => { const { sensors, baseSensor, lens } = state.present; return { sensors, baseSensor, lens } })
    const sensors = [..._sensors]
    const baseSensor = sensors.splice(baseIndex, 1)[0]
    const styles = useStyles()
    return sensors
        .filter((sensor) => sensor != SENSOR_SIZES[''])
        .map((sensor, index) => {
            const cropFactor = getCropFactor(sensor, baseSensor)
            return <ListItem key={`r${index}`} className={styles.listItem}>
                <Result stopLost={getStopLost(sensor, baseSensor)}
                    cropFactor={cropFactor}
                    baseSensor={baseSensor} sensor={sensor} lens_35mm={lens} lens_sameEffect={{ focal: (lens.focal * cropFactor), aperture: (lens.aperture * cropFactor) }} />
            </ListItem>
        })
}
const EFL = connect((state: StateWithHistory<EFLState>) => {
    return {
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
    }
},
    dispatch => {
        return {
            onUndo: () => dispatch(UndoActionCreators.undo()),
            onRedo: () => dispatch(UndoActionCreators.redo())
        }
    })(
        function EFL({ canUndo, canRedo, onUndo, onRedo }:{canUndo:boolean,canRedo:boolean,onUndo:()=>Action<any>,onRedo:()=>Action<any>}) {
            const styles = useStyles()
            const gapStyles = useGapStyle()
            const footerStyles = useFooterStyle().footer
            const theme = useTheme()
            const [showRealSensor, setShowReal] = useControlledValue(false)
            const results = useResults()
            useEffect(() => {
                //根据页面宽度决定是否打开底片尺寸预览
                const minWidth = theme.breakpoints.width('md')
                const isWiderThanSmall = window.matchMedia(`(min-width:${minWidth}px)`).matches
                if (isWiderThanSmall) {
                    setShowReal(undefined, true)
                }
            }, [])
            const keyboardListener = useCallback((e) => {
                if (e.ctrlKey) {
                    if (e.key == 'z') onUndo()
                    else if (e.key == 'y') onRedo()
                }
            }, [])
            useEffect(() => {
                document.addEventListener('keypress', keyboardListener)
                return () => document.removeEventListener('keypress', keyboardListener)
            }, [])
            return <IntlProvider locale={'zh-CN'}
                messages={defaultLocaleConfig}
            >
                <UtilContainer>
                    <Typography variant="h4">等效换算</Typography>
                    <Divider />
                    <IconButton aria-label="Undo" color="primary" disabled={!canUndo} onClick={onUndo}>
                        <UndoIcon/>
                    </IconButton>
                    <IconButton aria-label="Redo" color="primary" disabled={!canRedo} onClick={onRedo}>
                        <RedoIcon/>
                    </IconButton>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showRealSensor}
                                onChange={setShowReal}
                                color="primary"
                            />
                        }
                        label="传感器实际大小预览"
                        className={gapStyles.has_vertical_gap}
                    />
                    <Grid container spacing={2}>
                        <Grid item sm={12} lg={6}>
                            <Paper>
                                <List>
                                    <OP_SensorSize_Group_Connected showRealSizeSensor={showRealSensor} />
                                    <OP_Lens_Connected />
                                </List>
                            </Paper>
                        </Grid>
                        {results.length == 0 ? null : <Grid item sm={12} lg={6}>
                            <Paper>
                                <Container>
                                    <div className={gapStyles.vgap}></div>
                                    <Typography variant="h5">结果</Typography>
                                    <Divider />
                                    <List>
                                        {results}
                                    </List>
                                </Container>
                            </Paper>
                        </Grid>}
                    </Grid>
                    <Divider variant="fullWidth" className={gapStyles.has_vertical_gap} />
                    <Typography variant='caption' component='div' className={footerStyles}>
                        <strong>Reference</strong>
                        <ul className={styles.ul}>
                            <li>
                                <Link href="https://en.wikipedia.org/wiki/Image_sensor_format">Image sensor format - Wikipedia</Link>
                            </li>
                            <li>
                                <Link href="https://en.wikipedia.org/wiki/120_film">120 film - Wikipedia</Link>
                            </li>
                            <li>
                                <Link href="https://en.wikipedia.org/wiki/Film_format">Film format - Wikipedia</Link>
                            </li>
                        </ul>
                    </Typography>
                </UtilContainer>
            </IntlProvider >
        })
const store = createStore(undoable(EFLStateReducer))
export default function EFLPage() {
    return <Provider store={store}>
        <EFL />
    </Provider>
}