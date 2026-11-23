import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { getMediaUrl } from '../utils/mediaUrl';

const DEFAULT_WORKOUT_CONFIG = {
  tag: 'OUR TOP PICKS',
  headingLine1: 'TOP WORKOUT GEAR FOR',
  headingLine2: 'PEAK PERFORMANCE!',
  subtitle: 'Discover the best of our collection, designed to power your workouts all year round.',
  isActive: true,
  card1: {
    image: '/home img/workout_winter.jpg',
    season: '01/WINTER _2025',
    heading: 'TOP\nWORKOUT\nGEAR FOR\nPEAK\nPERFORMA\nNICE!',
    tag: 'TOP SELLING GEAR',
    link: '/products',
    isActive: true,
  },
  card2: {
    image: '/home img/workout_summer.jpg',
    season: '02/SUMMER _2025',
    heading: 'LATEST\nSTYLES AND\nINNOVATIONS\nIN WORKOUT\nGEAR.',
    tag: 'NEW ARRIVAL',
    link: '/products',
    isActive: true,
  },
};

function TypewriterHeading({ text, className, delay = 0.1 }) {
  const words = (text || '').split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.12,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.h2
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.22em]">
          {Array.from(word).map((char, charIdx) => (
            <motion.span key={charIdx} variants={letterVariants} className="inline-block">
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h2>
  );
}

export default function TopPicksBanner() {
  const [config, setConfig] = useState(DEFAULT_WORKOUT_CONFIG);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/homepage-sections/workout_top_picks', {
        params: { _t: Date.now() },
      })
      .then((res) => {
        if (isMounted && res.data?.data) {
          setConfig((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch((err) => {
        // Fall back gracefully to built-in photoshoot data
        console.warn('[TopPicksBanner] Using default photoshoot config:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (config.isActive === false) {
    return null;
  }

  const card1 = config.card1 || DEFAULT_WORKOUT_CONFIG.card1;
  const card2 = config.card2 || DEFAULT_WORKOUT_CONFIG.card2;

  const parseLines = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return raw.split('\n').filter((l) => l.trim().length > 0);
    }
    return [];
  };

  const card1Lines = parseLines(card1.heading);
  const card2Lines = parseLines(card2.heading);

  return (
    <section className="w-full bg-[#eaedee] text-black py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-12 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-[1480px]">
        {/* Top Header Row with AOS Animation */}
        <div
          data-aos="fade-up"
          data-aos-duration="600"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-10"
        >
          {/* Left Title Group */}
          <div className="flex-1 max-w-3xl">
            <span className="block text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2 sm:mb-3">
              {config.tag || 'OUR TOP PICKS'}
            </span>
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <TypewriterHeading
                text={config.headingLine1 || 'TOP WORKOUT GEAR FOR'}
                delay={0.1}
                className="text-2xl sm:text-4xl lg:text-5xl font-normal sm:font-medium uppercase tracking-normal text-neutral-800 leading-[1.05] font-sans"
              />
              <TypewriterHeading
                text={config.headingLine2 || 'PEAK PERFORMANCE!'}
                delay={0.75}
                className="text-2xl sm:text-4xl lg:text-5xl font-normal sm:font-medium uppercase tracking-normal text-neutral-800 leading-[1.05] font-sans"
              />
            </div>
          </div>

          {/* Right Subtitle */}
          <div className="max-w-xs text-neutral-600">
            <p className="text-xs sm:text-sm leading-relaxed font-normal">
              {config.subtitle || 'Discover the best of our collection, designed to power your workouts all year round.'}
            </p>
          </div>
        </div>

        {/* 2 Wide Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {/* Card 1 */}
          {card1.isActive !== false && (
            <div
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="100"
              className="group relative h-[400px] sm:h-[480px] lg:h-[550px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg cursor-pointer"
            >
              <Link to={card1.link || '/products'} className="block h-full w-full">
                <img
                  src={getMediaUrl(card1.image || '/home img/workout_winter.jpg')}
                  alt="Workout Gear Winter"
                  className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/home img/workout_winter.jpg';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {card1.season && (
                  <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20">
                    <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      {card1.season}
                    </span>
                  </div>
                )}

                <div
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="250"
                  className="absolute bottom-14 sm:bottom-16 left-5 sm:left-8 z-20 max-w-xs sm:max-w-sm"
                >
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-medium uppercase tracking-wide leading-[1.12]">
                    {(card1Lines.length > 0 ? card1Lines : ['TOP', 'WORKOUT', 'GEAR FOR', 'PEAK', 'PERFORMA', 'NICE!']).map(
                      (line, idx) => (
                        <React.Fragment key={idx}>
                          <span className={idx >= 4 ? 'text-white/70 font-normal' : 'text-white font-medium'}>
                            {line}
                          </span>
                          <br />
                        </React.Fragment>
                      )
                    )}
                  </h3>
                </div>

                {card1.tag && (
                  <div className="absolute bottom-4 sm:bottom-5 left-5 sm:left-8 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      {card1.tag}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                  <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                </div>
              </Link>
            </div>
          )}

          {/* Card 2 */}
          {card2.isActive !== false && (
            <div
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="200"
              className="group relative h-[400px] sm:h-[480px] lg:h-[550px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg cursor-pointer"
            >
              <Link to={card2.link || '/products'} className="block h-full w-full">
                <img
                  src={getMediaUrl(card2.image || '/home img/workout_summer.jpg')}
                  alt="Activewear Summer"
                  className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/home img/workout_summer.jpg';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {card2.season && (
                  <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20">
                    <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      {card2.season}
                    </span>
                  </div>
                )}

                <div
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="350"
                  className="absolute bottom-14 sm:bottom-16 left-5 sm:left-8 z-20 max-w-xs sm:max-w-sm"
                >
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-medium uppercase tracking-wide leading-[1.12]">
                    {(card2Lines.length > 0 ? card2Lines : ['LATEST', 'STYLES AND', 'INNOVATIONS', 'IN WORKOUT', 'GEAR.']).map(
                      (line, idx) => (
                        <React.Fragment key={idx}>
                          <span className={idx < 2 ? 'text-white/70 font-normal' : 'text-white font-medium'}>
                            {line}
                          </span>
                          <br />
                        </React.Fragment>
                      )
                    )}
                  </h3>
                </div>

                {card2.tag && (
                  <div className="absolute bottom-4 sm:bottom-5 left-5 sm:left-8 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      {card2.tag}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                  <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
