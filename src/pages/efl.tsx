import { Container, Divider, List, ListItem, makeStyles, Paper, Typography, useTheme, Grid } from '@material-ui/core'
import clsx from 'clsx';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { connect, Provider } from 'react-redux'
import { createStore } from 'redux'
import undoable, { StateWithHistory, ActionCreators as UndoActionCreators } from 'redux-undo'
import { getLensName, Lens, OP_Lens } from '../compo/lens';
import { IntlProvider } from 'react-intl'
import defaultLocaleConfig from '../locale'
import { OP_SensorSize, SENSOR_SIZES, Sensor_Size, Size2Name, getStopLost, getCropFactor, getNameId } from '../compo/sensor'
import UtilContainer from '../container/util';

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
    })(function OP_SensorSize_Group_Connected({ baseSensor, sensors, addSensor, removeSensor, editSensor, clear }: {
        sensors: Sensor_Size[], baseSensor: number, addSensor: (data: Sensor_Size) => EFLStateAction,
        removeSensor: (i: number) => EFLStateAction, editSensor: (data: Sensor_Size, i: number) => EFLStateAction,
        clear: () => EFLStateAction
    }) {
        const styles = useStyles()
        return <>
            {(sensors.length == 0 ? <ListItem><OP_SensorSize onChange={(data) => addSensor(data)}></OP_SensorSize></ListItem> : sensors.map((sensor, index) =>
                <ListItem className={clsx(index == baseSensor && styles.baseSensor)}><OP_SensorSize value={sensor} onChange={(data) => editSensor(data, index)}></OP_SensorSize></ListItem>
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
function Result({ baseSensor, cropFactor, stopLost, sensor, lens_35mm, lens_sameEffect }: ResultProp) {
    const intl = useIntl()
    const baseSensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(baseSensor)) }), [baseSensor])
    const sensorName = useMemo(() => intl.formatMessage({ id: getNameId(Size2Name.get(sensor)) }), [sensor])
    const theme = useTheme()
    return <>
        <Typography component="span" variant='h6' style={{ textDecoration: 'bold' }}>{`${sensorName}`}</Typography>
        <Typography component="span" variant='subtitle2' style={{ textDecoration: 'bold', color: theme.palette.secondary.main }}>{`与${baseSensorName}相比较`}</Typography>
        {[`裁切系数：${cropFactor.toFixed(3)}`, `进光量损失:f${stopLost.toFixed(3)}`, `您选择的${getLensName(lens_35mm)}在${sensorName}等效为${getLensName(lens_sameEffect)}`].map(text => <Typography component="p">{text}</Typography>)}
    </>
}
const Results = connect((state: StateWithHistory<EFLState>) => { const { sensors, baseSensor, lens } = state.present; return { sensors, baseSensor, lens } })
    (function Results({ sensors: _sensors, baseSensor: baseIndex, lens }: { sensors: Sensor_Size[], baseSensor: number, lens: Lens }) {
        const sensors = [..._sensors]
        const baseSensor = sensors.splice(baseIndex, 1)[0]
        const styles = useStyles()

        return <List>
            {sensors
                .filter((sensor) => sensor != SENSOR_SIZES[''])
                .map((sensor, index) => {
                    const cropFactor = getCropFactor(sensor, baseSensor)
                    return <ListItem key={`r${index}`} className={styles.listItem}>
                        <Result stopLost={getStopLost(sensor, baseSensor)}
                            cropFactor={cropFactor}
                            baseSensor={baseSensor} sensor={sensor} lens_35mm={lens} lens_sameEffect={{ focal: (lens.focal * cropFactor), aperture: (lens.aperture * cropFactor) }} />
                    </ListItem>
                })}
        </List>
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
            onRedo: () => dispatch(UndoActionCreators.redo())
        }
    })(
        function EFL() {
            const styles = useStyles()
            return <IntlProvider locale={'zh-CN'}
                messages={defaultLocaleConfig}
            >
                <UtilContainer>
                    <Grid container spacing={2}>
                        <Grid item md xs={12}>
                            <Container>
                                <Paper>
                                    <List><OP_SensorSize_Group_Connected />
                                        <OP_Lens_Connected /></List>
                                </Paper>
                            </Container>
                        </Grid>
                        <Grid item md xs={12}>
                            <Container>
                                <Paper>
                                    <Container>
                                        <Typography variant="h5">结果</Typography>
                                        <Divider />
                                        <Results />
                                    </Container>
                                </Paper>
                            </Container>
                        </Grid>
                    </Grid>
                </UtilContainer>
            </IntlProvider >
        })
const store = createStore(undoable(EFLStateReducer))
export default function EFLPage() {
    return <Provider store={store}>
        <EFL />
    </Provider>
}