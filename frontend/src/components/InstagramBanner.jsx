import React from 'react';

export default function InstagramBanner() {
  return (
    <section className="w-full bg-black overflow-hidden my-0">
      <a
        href="https://instagram.com/amayaar.in"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-[1920px] mx-auto overflow-hidden group"
        title="Follow AMA YAAR on Instagram"
      >
        <img
          src="/insta-banner-1920x500.jpg"
          alt="AMA YAAR Instagram Banner"
          className="w-full h-auto aspect-[1920/500] object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
          loading="lazy"
        />
      </a>
    </section>
  );
}
