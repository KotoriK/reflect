import { Button, Container, Toolbar } from '@material-ui/core'
import Link from 'next/link'
import { forwardRef, PropsWithChildren, } from 'react'

const UtilContainer = forwardRef<HTMLDivElement, PropsWithChildren<{}>>(({ children }, ref) => {
    return <>
        <Toolbar>
            <Link href="/">
                <Button color="primary">{"< 返回"}</Button>
            </Link>
        </Toolbar>
        <Container ref={ref}>
            {children}
        </Container>
    </>
})
export default UtilContainer