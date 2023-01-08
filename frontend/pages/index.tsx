import App from '../components/App'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { store } from "../store/store"

function IndexPage() {
    return (
        <div>
            <Head>
                <title>Matrix Generator</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <Provider store={store}>
                <div className='container-fluid h-100'> <App /> </div>
            </Provider>
        </div>
    )
}

export default IndexPage