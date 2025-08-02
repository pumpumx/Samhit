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
    <Route path='/' element={<HomePage/>} />
    <Route path='/room/:roomId' element={<GroupVideoCallUI/>} />
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
