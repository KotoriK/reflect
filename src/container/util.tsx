import { Button, Container, Toolbar } from '@material-ui/core'
import Link from 'next/link'

export default function UtilContainer({ children }: { children: JSX.Element }) {
    return <>
        <Toolbar>
            <Container>
                <Link href="/">
                    <Button color="primary">{"< 返回"}</Button>
                </Link>
            </Container>
        </Toolbar>
        <Container>
            {children}
        </Container>
    </>
}