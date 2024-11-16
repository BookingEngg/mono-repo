import { useEffect } from 'react'
import './App.css'
import {Button} from 'rsuite'

function App() {
  useEffect(() => {
    const getBooks = async () => {
      const response = await fetch('http://localhost:8080/api/v1/platform/users')
      const data = await response.json()
      console.log("RESPONSE FROM BE>>>>>>>>>>", data);
    }
    getBooks()
  }, [])
  return (
    <>
      <h1>Hello FE Started</h1>
      <Button>Hello world</Button>
    </>
  )
}
export default App