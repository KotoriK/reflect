import { IntlProvider } from 'react-intl'
import defaultLocaleConfig from '../../locale'
import { createStore, Action } from 'redux'
import { connect, Provider } from 'react-redux'

import undoable, { StateWithHistory, ActionCreators as UndoActionCreators } from 'redux-undo'

import UtilContainer from '../../container/util';
import Link from 'next/link'
import { useFooterStyle, useGapStyle } from '../../compo/styles';
import useControlledValue from '../../compo/controlledValue';
import { SnackbarProvider } from 'notistack';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import { Divider, FormControlLabel, Grid, IconButton, List, Paper, Switch, Typography, useTheme } from '@material-ui/core'
import { useEffect, useCallback } from 'react'
import { AddRemoveSensor, EFLResult, EFLState, EFLStateReducer, OP_Lens_Connected, OP_SensorSize_Group_Connected, useEFLStyles } from '../../compo/efl'
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
            const styles = useEFLStyles()
            const gapStyles = useGapStyle()
            const footerStyles = useFooterStyle().footer
            const theme = useTheme()
            const [showRealSensor, setShowReal] = useControlledValue(false)
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
                            label="画幅实际大小预览"
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
                            <EFLResult/>
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