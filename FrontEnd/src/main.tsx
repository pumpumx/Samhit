import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainApp from './app'
import {createBrowserRouter , RouterProvider , Route ,createRoutesFromElements} from 'react-router-dom'
import HomePage from './pages/Home'

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
  <Route>
    <Route path='/' element={<MainApp/>} />
    <Route path='/home' element={<HomePage/>} />
  </Route>
    </>
  )
)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes}>
    </RouterProvider>
  </StrictMode>
)
