import 'bootstrap/dist/css/bootstrap.css'
import "../styles/globals.css"

interface MyAppProps {
  Component: React.ComponentType;
  pageProps: any;
}

function MyApp(props: MyAppProps) {
  return <props.Component {...props.pageProps} />
}

export default MyApp;
