import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from './AppLayout';
import { RequireAuth } from './RequireAuth';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { JoinInvite } from '@/pages/JoinInvite';
import { Dashboard } from '@/pages/app/Dashboard';
import { Groups } from '@/pages/app/Groups';
import { CreateGroup } from '@/pages/app/CreateGroup';
import { GroupDetail } from '@/pages/app/GroupDetail';
import { Activity } from '@/pages/app/Activity';
import { Settings } from '@/pages/app/Settings';
import { TransactionDetail } from '@/pages/app/TransactionDetail';
import { NotFound } from '@/pages/NotFound';
import { RenderErrorNotice } from '@/components/ErrorBoundary';

const router = createBrowserRouter([
  { path: '/', element: <Landing />, errorElement: <RenderErrorNotice /> },
  { path: '/login', element: <Login />, errorElement: <RenderErrorNotice /> },
  { path: '/signup', element: <Signup />, errorElement: <RenderErrorNotice /> },
  { path: '/forgot-password', element: <ForgotPassword />, errorElement: <RenderErrorNotice /> },
  { path: '/reset-password', element: <ResetPassword />, errorElement: <RenderErrorNotice /> },
  { path: '/join/:inviteCode', element: <JoinInvite />, errorElement: <RenderErrorNotice /> },
  {
    path: '/app',
    errorElement: <RenderErrorNotice />,
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      // Catch at the leaf so the account, wallet controls and navigation survive.
      { index: true, element: <Dashboard />, errorElement: <RenderErrorNotice /> },
      { path: 'groups', element: <Groups />, errorElement: <RenderErrorNotice /> },
      { path: 'groups/create', element: <CreateGroup />, errorElement: <RenderErrorNotice /> },
      { path: 'groups/:id', element: <GroupDetail />, errorElement: <RenderErrorNotice /> },
      { path: 'activity', element: <Activity />, errorElement: <RenderErrorNotice /> },
      { path: 'settings', element: <Settings />, errorElement: <RenderErrorNotice /> },
      {
        path: 'transactions/:hash',
        element: <TransactionDetail />,
        errorElement: <RenderErrorNotice />,
      },
    ],
  },
  { path: '*', element: <NotFound />, errorElement: <RenderErrorNotice /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
