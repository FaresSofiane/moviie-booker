import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {Toaster} from "sonner";
import {AuthProvider} from "@/context/AuthContext.tsx";
import App from "@/App.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Toaster/>
        <AuthProvider>

            <App/>


        </AuthProvider>
    </StrictMode>,
)
