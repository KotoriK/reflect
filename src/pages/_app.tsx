import { createGenerateClassName, CssBaseline, StylesProvider } from "@material-ui/core";
import Head from "next/head";
import useHorse from "../compo/horse";
import { PageTransition } from 'next-page-transitions'
import '../page-transition.css'
import { useRouter } from "next/router";
import RouteName from '../route.json'
const PROJECT_NAME = 'kotorik/utils'
export default function App({ Component, pageProps }) {
    useHorse()
    const router = useRouter()
    const route = router.route
    const routeInfo = RouteName[route]
    const pageTitle = routeInfo?.name ? routeInfo.name + ' - ' + PROJECT_NAME : PROJECT_NAME
    const pageDescription = routeInfo?.description ?? PROJECT_NAME
    return <>
        <CssBaseline />
        <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription}></meta>
        </Head>
        <PageTransition timeout={300} classNames="page-transition">
            <Component {...pageProps} key={route} />
        </PageTransition></>
}