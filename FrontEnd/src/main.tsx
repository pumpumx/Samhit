import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainApp from './app'
import {createBrowserRouter , RouterProvider , Route ,createRoutesFromElements} from 'react-router-dom'
import HomePage from './pages/Home'
import GroupVideoCallUI from './pages/Main'

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
  <Route>
    <Route path='/' element={<MainApp/>} />
    <Route path='/home' element={<HomePage/>} />
    <Route path='/main' element={<GroupVideoCallUI/>} />
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
