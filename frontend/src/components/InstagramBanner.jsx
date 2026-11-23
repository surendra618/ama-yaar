import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { getMediaUrl } from '../utils/mediaUrl';

const DEFAULT_BANNER = {
  image: '/insta-banner-1920x500.jpg',
  link: 'https://instagram.com/amayaar.in',
  title: 'Follow AMA YAAR on Instagram',
  openInNewTab: true,
  isActive: true,
};

export default function InstagramBanner() {
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/homepage-sections/instagram_banner', {
        params: { _t: Date.now() },
      })
      .then((res) => {
        if (isMounted && res.data?.data) {
          setBanner((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch((err) => {
        console.warn('[InstagramBanner] Using default banner config:', err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (banner.isActive === false) {
    return null;
  }

  const destination = (banner.link || 'https://instagram.com/amayaar.in').trim();
  const isExternal = destination.startsWith('http://') || destination.startsWith('https://');
  const openInNew = banner.openInNewTab !== false;
  const imageSrc = getMediaUrl(banner.image || '/insta-banner-1920x500.jpg');
  const title = banner.title || 'Follow AMA YAAR on Instagram';

  const imageElement = (
    <img
      src={imageSrc}
      alt={title}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/insta-banner-1920x500.jpg';
      }}
      className="w-full h-auto aspect-[1920/500] object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
      loading="lazy"
    />
  );

  return (
    <section className="w-full bg-black overflow-hidden my-0">
      <div className="w-full max-w-[1920px] mx-auto overflow-hidden">
        {isExternal || openInNew ? (
          <a
            href={destination}
            target={openInNew ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="block w-full overflow-hidden group cursor-pointer"
            title={title}
          >
            {imageElement}
          </a>
        ) : (
          <Link
            to={destination}
            className="block w-full overflow-hidden group cursor-pointer"
            title={title}
          >
            {imageElement}
          </Link>
        )}
      </div>
    </section>
  );
}
