import React from 'react';

const SVGImage = {
  ReceiveCard: (color1, color2, stroke) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100">
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          fill={color1}
          stroke={stroke}
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="30" fill={color2} />
      </svg>
    );
  },

  Home: (color1, color2, stroke) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100">
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          fill={color1}
          stroke={stroke}
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="30" fill={color2} />
      </svg>
    );
  },
};

export default SVGImage;
