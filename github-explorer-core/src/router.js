import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import RepositoryDetailsPage from './pages/RepositoryDetailsPage';
import ProfileDetailsPage from './pages/ProfileDetailsPage';

// PUBLIC_INTERFACE
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'profile/:username',
        element: <UserProfilePage />,
      },
      {
        path: 'repo/:username/:reponame',
        element: <RepositoryDetailsPage />,
      },
      {
        path: 'developer/:username',
        element: <ProfileDetailsPage />,
      }
    ]
  }
]);
