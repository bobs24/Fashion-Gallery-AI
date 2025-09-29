import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-light text-center tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-300">
          Fashion Gallery
        </h1>
        <p className="text-center text-[var(--color-text-secondary)] mt-2 text-sm tracking-wider">Your Personal AI Stylist</p>
      </div>
    </header>
  );
};

export default Header;