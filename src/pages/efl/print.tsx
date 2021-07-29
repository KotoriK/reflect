import { useEffect, useState } from "react"
import Link from 'next/link'
import { Paper, Container, Button } from "@material-ui/core"
import { EFL_RESULT_KEY, EFLResultContainer, EFLResultContainerProp, } from "../../compo/efl"
import { useGapStyle } from "../../compo/styles"
import defaultLocaleConfig from '../../locale'
import { IntlProvider } from 'react-intl'

function EFLPrint() {
    const [state, set] = useState<EFLResultContainerProp>()
    const gapStyles = useGapStyle()
    useEffect(() => {
        try {
            set(JSON.parse(localStorage.getItem(EFL_RESULT_KEY)))
            requestAnimationFrame(() => {
                window.print()
            })
        } catch (e) {
            console.error(e)
        }
    }, [])
    if (state) {
        return <IntlProvider locale={'zh-CN'}
            messages={defaultLocaleConfig}
        >
            <div className={gapStyles.vgap}></div>
            <EFLResultContainer {...state} />
            <div className={gapStyles.vgap}></div>
        </IntlProvider>
    } else {
        return <p><Link href="/efl"><Button variant='contained' color="primary">Return</Button></Link></p>
    }
}
export default function EFLPrintPage() {
    return <Paper>
        <Container>
            <EFLPrint />
        </Container>
    </Paper>
}
