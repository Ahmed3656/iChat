import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <section className='error-page d-flex justify-content-center align-items-center' style={{height : '60vh'}}>
      <div className="text-center">
        <h2 style={{color : '#1885FF', fontSize : '102px', marginBottom : '0'}}>OOPS!</h2>
        <h2 style={{marginBottom: '2rem'}}>Page Not Found</h2>
        <Link to="/" className='go-home-btn'>Go Back Home</Link>
      </div>
    </section>
  )
}

export default ErrorPage