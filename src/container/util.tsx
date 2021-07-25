import { Button, Container, Toolbar } from '@material-ui/core'
import Link from 'next/link'

export default function UtilContainer({ children }: { children: JSX.Element | JSX.Element[] }) {
    return <>
        <Toolbar>
                <Link href="/">
                    <Button color="primary">{"< 返回"}</Button>
                </Link>
        </Toolbar>
        <Container>
            {children}
        </Container>
    </>
}