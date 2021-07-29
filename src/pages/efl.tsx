import { Container, Divider, List, ListItem, makeStyles, Paper, Typography, useTheme, Grid, Switch, FormControlLabel, ListItemIcon, ListItemText, IconButton, Checkbox } from '@material-ui/core'
import clsx from 'clsx';

import { connect, Provider, useSelector } from 'react-redux'
import { createStore, Action } from 'redux'
import undoable, { StateWithHistory, ActionCreators as UndoActionCreators } from 'redux-undo'
import { getLensName, Lens, OP_Lens } from '../compo/lens';
import { IntlProvider } from 'react-intl'
import defaultLocaleConfig from '../locale'
import { OP_SensorSize, SENSOR_SIZES, Sensor_Size, Size2Name, getStopLost, getCropFactorDia, getNameId, getKeyOfSensorSize, getCropFactorWidth } from '../compo/sensor'
import UtilContainer from '../container/util';
import Link from 'next/link'
//react hooks
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFooterStyle, useGapStyle } from '../compo/styles';
import useControlledValue from '../compo/controlledValue';
import { SnackbarProvider, useSnackbar } from 'notistack';

//icons
import CropIcon from '@material-ui/icons/Crop';
import ExposureIcon from '@material-ui/icons/Exposure';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

interface EFLState {
    lens: Lens,
    sensors: Array<Sensor_Size>,
    baseSensorIndex: number
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

function EFLStateReducer(state: EFLState = defaultEFLState, action: EFLStateAction): EFLState {
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
const OP_SensorSize_Group_Connected = connect((state: StateWithHistory<EFLState>) => { return { sensors: state.present.sensors, baseSensor: state.present.baseSensorIndex } }
    , dispatch => {
        return {
            editSensor: (data: Sensor_Size, i: number) => dispatch(editSensor(data, i)),
            setBaseSensor: (i: number) => dispatch(setBaseSensor(i))
        }
    })(function OP_SensorSize_Group_Connected({ showRealSizeSensor, baseSensor, sensors, editSensor, setBaseSensor }: {
        sensors: Sensor_Size[], baseSensor: number, editSensor: (data: Sensor_Size, i: number) => EFLStateAction, showRealSizeSensor: boolean, setBaseSensor: any
    }) {
        const styles = useStyles()
        return <>
            {sensors.map((sensor, index) => {
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
const OP_Lens_Connected = connect((state: StateWithHistory<EFLState>) => { return { lens: state.present.lens } }, dispatch => {
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
function PrintResult({ baseSensor, cropFactDia, stopLost, sensor, lens, lens_equivalent, cropFactWidth, lens_equivalent_widthCrop }: ResultProp) {
    const intl = useIntl()
    const baseSensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(baseSensor)) }), [baseSensor])
    const sensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(sensor)) }), [sensor])
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

function useResults() {
    const { sensors: _sensors, baseSensor: baseIndex, lens } = useSelector((state: StateWithHistory<EFLState>) => { const { sensors, baseSensorIndex: baseSensor, lens } = state.present; return { sensors, baseSensor, lens } })
    const sensors = [..._sensors]
    const baseSensor = sensors.splice(baseIndex, 1)[0]
    const styles = useStyles()
    return sensors
        .filter((sensor) => sensor != SENSOR_SIZES[''])
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
        })
}
const AddRemoveSensor = connect((state: StateWithHistory<EFLState>) => { return { sensors: state.present.sensors } }, dispatch => {
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
const EFL = connect((state: StateWithHistory<EFLState>) => {
    return {
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
    }
},
    dispatch => {
        return {
            onUndo: () => dispatch(UndoActionCreators.undo()),
            onRedo: () => dispatch(UndoActionCreators.redo()),
        }
    })(
        function EFL({ canUndo, canRedo, onUndo, onRedo }: { canUndo: boolean, canRedo: boolean, onUndo: () => Action<any>, onRedo: () => Action<any> }) {
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
            return <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
                <IntlProvider locale={'zh-CN'}
                    messages={defaultLocaleConfig}
                >
                    <UtilContainer>
                        <Typography variant="h4">等效换算</Typography>
                        <Divider />
                        <IconButton aria-label="Undo" color="primary" disabled={!canUndo} onClick={onUndo}>
                            <UndoIcon />
                        </IconButton>
                        <IconButton aria-label="Redo" color="primary" disabled={!canRedo} onClick={onRedo}>
                            <RedoIcon />
                        </IconButton>
                        <AddRemoveSensor />
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
                            <strong>参考资料 Reference</strong>
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
            </SnackbarProvider>

        })
const store = createStore(undoable(EFLStateReducer))
export default function EFLPage() {
    return <Provider store={store}>
        <EFL />
    </Provider>
}