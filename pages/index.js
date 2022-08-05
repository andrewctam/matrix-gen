import React from 'react';
import App from '../components/App'
import Head from 'next/head'


function IndexPage() {
    return (
      <div>
        <Head>
          <title>Matrix Generator</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

        <div className='container-fluid'> <App /> </div>
      </div>
    )
  }
  
  export default IndexPage