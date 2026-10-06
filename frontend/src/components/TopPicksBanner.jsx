import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function TypewriterHeading({ text, className, delay = 0.1 }) {
  const words = text.split(' ');

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
              OUR TOP PICKS
            </span>
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <TypewriterHeading
                text="TOP WORKOUT GEAR FOR"
                delay={0.1}
                className="text-2xl sm:text-4xl lg:text-5xl font-normal sm:font-medium uppercase tracking-normal text-neutral-800 leading-[1.05] font-sans"
              />
              <TypewriterHeading
                text="PEAK PERFORMANCE!"
                delay={0.75}
                className="text-2xl sm:text-4xl lg:text-5xl font-normal sm:font-medium uppercase tracking-normal text-neutral-800 leading-[1.05] font-sans"
              />
            </div>
          </div>

          {/* Right Subtitle */}
          <div className="max-w-xs text-neutral-600">
            <p className="text-xs sm:text-sm leading-relaxed font-normal">
              Discover the best of our collection, designed to power your workouts all year round.
            </p>
          </div>
        </div>

        {/* 2 Wide Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {/* Card 1: 01/WINTER _2025 */}
          <div
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="100"
            className="group relative h-[400px] sm:h-[480px] lg:h-[550px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg cursor-pointer"
          >
            <Link to="/products" className="block h-full w-full">
              {/* Background Image (Static without hover scale) */}
              <img
                src="/home img/workout_winter.jpg"
                alt="Top Workout Gear Winter"
                className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
              />

              {/* Dark Gradient Overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

              {/* Top Right Season Badge */}
              <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20">
                <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                  01/WINTER _2025
                </span>
              </div>

              {/* Bottom Left Large Typography Overlay with AOS Animation & Clean non-bold font */}
              <div
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="250"
                className="absolute bottom-14 sm:bottom-16 left-5 sm:left-8 z-20 max-w-xs sm:max-w-sm"
              >
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-medium uppercase tracking-wide leading-[1.12]">
                  <span className="text-white font-medium">TOP</span> <br />
                  <span className="text-white font-medium">WORKOUT</span> <br />
                  <span className="text-white font-medium">GEAR FOR</span> <br />
                  <span className="text-white font-medium">PEAK</span> <br />
                  <span className="text-white/70 font-normal">PERFORMA</span> <br />
                  <span className="text-white/70 font-normal">NICE!</span>
                </h3>
              </div>

              {/* Bottom Left Tag Badge matching screenshot */}
              <div className="absolute bottom-4 sm:bottom-5 left-5 sm:left-8 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  TOP SELLING GEAR
                </span>
              </div>

              {/* Top Right Arrow Indicator on Hover */}
              <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
              </div>
            </Link>
          </div>

          {/* Card 2: 02/SUMMER _2025 */}
          <div
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="200"
            className="group relative h-[400px] sm:h-[480px] lg:h-[550px] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg cursor-pointer"
          >
            <Link to="/products" className="block h-full w-full">
              {/* Background Image (Static without hover scale) */}
              <img
                src="/home img/workout_summer.jpg"
                alt="Latest Activewear Summer"
                className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
              />

              {/* Dark Gradient Overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

              {/* Top Right Season Badge */}
              <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20">
                <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-300 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                  02/SUMMER _2025
                </span>
              </div>

              {/* Bottom Left Large Typography Overlay with AOS Animation & Clean non-bold font */}
              <div
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="350"
                className="absolute bottom-14 sm:bottom-16 left-5 sm:left-8 z-20 max-w-xs sm:max-w-sm"
              >
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-medium uppercase tracking-wide leading-[1.12]">
                  <span className="text-white/70 font-normal">LATEST</span> <br />
                  <span className="text-white/70 font-normal">STYLES AND</span> <br />
                  <span className="text-white font-medium">INNOVATIONS</span> <br />
                  <span className="text-white font-medium">IN WORKOUT</span> <br />
                  <span className="text-white font-medium">GEAR.</span>
                </h3>
              </div>

              {/* Bottom Left Tag Badge matching screenshot */}
              <div className="absolute bottom-4 sm:bottom-5 left-5 sm:left-8 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  NEW ARRIVAL
                </span>
              </div>

              {/* Top Right Arrow Indicator on Hover */}
              <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-6 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md scale-90 group-hover:scale-100">
                <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
