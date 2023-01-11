import Head from 'next/head'
import Tutorial from '../components/Tutorial'

function TutorialPage() { 
    return (
        <div>
            <Head>
                <title>Matrix Generator</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <div className='container-fluid h-100'> <Tutorial/> </div>
        </div>
    )

}

export default TutorialPage