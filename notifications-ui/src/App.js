import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8081/notifications/", {mode:'cors'})
      .then(res => res.json())
      .then(
        (data) => {
          setIsLoaded(true);
          setNotifications(data);
        },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
      return (
        <html>
          <head>
            <title>
              Notifications
            </title>
          </head>
          <body>
            <h3>List of Notifications</h3>
            <ul>
              {notifications.map(notification => (
                <li>
                  {notification.timestamp + " - " + notification.source + " - " + notification.type + " - " + notification.version}
                  <ul>
                    <li>
                      <pre>
                        {JSON.stringify(notification.data)}
                      </pre>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </body>
        </html>
      );
  }
}

export default App;
