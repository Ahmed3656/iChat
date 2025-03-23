import React from 'react';
import Loader from '../images/loader.gif';

export const LoadingPage = () => {
  return (
    <div className='loading-page'>
        <div className="loading-image">
            <img src={Loader} alt="" />
        </div>
    </div>
  )
}
