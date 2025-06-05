import React from 'react';
import './Button.css';

const Button = ({ type, text }) => {
  return (
    <button className={`custom-button ${type}`}>
      {text}
    </button>
  );
};

export default Button;
