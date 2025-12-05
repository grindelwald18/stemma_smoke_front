import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PlanogramList from './pages/PlanogramList.jsx';
import PlanogramForm from './pages/PlanogramForm.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: "/planograms",
                element: <PlanogramList />
            },
            {
                path: "/planograms/new",
                element: <PlanogramForm />
            },
            {
                path: "/planograms/:id/edit",
                element: <PlanogramForm />
            },
            {
                path: "/",
                element: <Navigate to="/planograms" replace />
            }
        ]
    }
]);