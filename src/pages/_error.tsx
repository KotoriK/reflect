import { Container, Divider, Popover, Typography } from "@material-ui/core"
import { useFlexCenter, useFooterStyle, useGapStyle } from "../compo/styles"
import Image from 'next/image'
import pic404 from '../../public/404.png'
import { NextPage } from "next"
import Link from 'next/link'
import { Link as LinkCompo } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub';
import clsx from 'clsx';

function HTTPCat(statusCode: number) {
    return <>
        <img src={`https://http.cat/${statusCode}`} alt={"cat_"+statusCode}></img>
        <Typography variant="caption" component="p" color="textSecondary">cute cats from <Link href="https://http.cat" passHref><LinkCompo>http.cat</LinkCompo></Link></Typography>
    </>
}
const StatusCode = ({ statusCode }) => <Typography component="p" style={{ color: "#88888888" }}>HTTP {statusCode}</Typography>
const 糟了 = () => <Typography variant="h1">糟了！</Typography>
function ErrorContentWithStatusCode({ statusCode }) {
    let attach
    switch (statusCode) {
        case 404:
            if (Math.random() < 0.5) {
                attach = <Image src={pic404} alt="404"></Image>
                break
            }
        default:
            attach = <><糟了 />{HTTPCat(statusCode)}</>
    }
    return <>
        <StatusCode statusCode={statusCode}></StatusCode>
        {attach}
    </>

}
function ErrorContentWithoutStatusCode() {
    return <><糟了 /><Typography variant="h5">客户端脚本不知道出了啥bug</Typography></>
}
function FooterSign() {
    const style_footer = useFooterStyle()
    return <div className={clsx(style_footer.footer, style_footer.flex)} style={{ height: "2vh" }}>
        <GitHubIcon />
        <Link href="/" passHref>
            <LinkCompo variant="caption">KotoriK/utils</LinkCompo>
        </Link></div>
}
interface ErrorProps {
    statusCode: number
}
const Error: NextPage<ErrorProps> = ({ statusCode }) => {
    const styles_flexCenter = useFlexCenter()["flex-center"]
    const gapStyles = useGapStyle()

    return (
        <Container>
            <div className={styles_flexCenter} style={{ height: "96vh" }}>
                <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                    {statusCode ? <ErrorContentWithStatusCode statusCode={statusCode} /> : <ErrorContentWithoutStatusCode />}
                    <Divider variant="fullWidth" className={gapStyles.has_vertical_gap} />
                    <FooterSign />
                </div>
            </div>
        </Container>
    )
}

Error.getInitialProps = ({ req, res, err }) => {
    const custom_code = req.url && req.url.match(/_error\?code=(\d+)/)
    if (custom_code) {
        return { statusCode: parseInt(custom_code[1]) }
    }

    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error