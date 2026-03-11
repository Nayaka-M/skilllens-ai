import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 35 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); 
    if (!text) return;
    const words = text.split(' ');
    let i = 0;
    const timer = setInterval(() => {
      if (i < words.length) {
        setDisplayedText((prev) => prev + (i === 0 ? '' : ' ') + words[i]);
        i++;
      } else { clearInterval(timer); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default Typewriter;