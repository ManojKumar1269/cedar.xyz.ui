import React, { useEffect, useState } from 'react';
import MainLayout from './components/shared/main-layout/main-layout';
import SessionLayout from './components/shared/session-layout/session-layout';
import Home from './components/home/home';
import Login from './components/login/login';
import NotFound from './components/not-found/not-found';
import { isExpired } from './constant';

function App() {
  const [route, setRoute] = useState('login');

  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem("user"));

    if (user && user.access_token && user._id && user.access_token_expires && !isExpired(user.access_token_expires)){
      setRoute("home");
    } else {
      window.localStorage.removeItem("user");
    }
  }, []); 

  const handleRouteChange = (route) => {
    setRoute(route);
  }

  return (
    <div className="h-100">
      {route === "home" ? (
        <MainLayout>
          <Home routeChange={handleRouteChange}/>
        </MainLayout>
      ) : route === "login" ? (
        <SessionLayout>
          <Login routeChange={handleRouteChange}/>
        </SessionLayout>
      ) : (
        <SessionLayout>
          <NotFound routeChange={handleRouteChange}/>
        </SessionLayout>
      )}
    </div>
  );
}

export default App;
