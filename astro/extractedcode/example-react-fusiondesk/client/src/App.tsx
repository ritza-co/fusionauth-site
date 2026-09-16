import React from 'react';
import './App.css';
import {createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider} from 'react-router-dom';
import {LoginPage, ProfilePage, TicketPage, TicketsPage} from './pages';
import {AppLayout} from './layouts/AppLayout';
import {ProtectedRoutes} from './components/ProtectedRoutes';
import {QueryClient, QueryClientProvider} from 'react-query';

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout/>}>
      <Route index element={<LoginPage/>}/>
      <Route element={<ProtectedRoutes/>}>
        <Route path="/tickets" element={<TicketsPage/>}/>
        <Route path="/tickets/:id" element={<TicketPage/>}
               loader={({params}) => {
                 if (!params.id || params.id === 'new')
                   return Promise.resolve({ticket: {}});
                 return fetch(`http://localhost:8083/api/tickets/${params.id}`, {
                   credentials: 'include'
                 })
                   .then(response => response.json())
                   .then(ticket => ({ticket}));
               }}
        />
        <Route path="/profile" element={<ProfilePage/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace={true}/>}/>
    </Route>
  )
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  );
}
