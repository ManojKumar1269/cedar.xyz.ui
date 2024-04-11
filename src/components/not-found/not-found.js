import React from 'react';

function NotFound({ routeChange }) {

  const handleGoHome = (event) => {
    event.preventDefault();
    routeChange('home');
  }

  return (
    <div>
      <h1 className="text-left">XYZ</h1>
      <h4 className="text-left mb-5 border-bottom pb-3">Customer Portal</h4>
      <h1 className="mb-5">Sorry, The info you are looking is not available. Thanks.</h1>
      <button className='btn btn-sm btn-primary' onClick={handleGoHome}>Go Home</button>
    </div>
  );
}

export default NotFound;