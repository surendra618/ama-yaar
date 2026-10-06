import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ArrowUpRight, ChevronDown } from 'lucide-react';

// RADIAL OUTWARD SCATTER FLOATING IMAGES CATALOG (52 High-Fashion / AI Elements Across 6 Waves)
const FLOATING_IMAGES = [
  // WAVE 1: INITIAL CENTER EXPLOSION (0.04 -> 0.35 Scroll Progress)
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=85',
    tag: 'STREET #01',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[210px] sm:h-[260px]',
    targetX: -480,
    targetY: -220,
    targetRotate: -8,
    depth: 25,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=85',
    tag: 'CAP #02',
    width: 'w-[125px] sm:w-[155px]',
    height: 'h-[135px] sm:h-[165px]',
    targetX: -270,
    targetY: -180,
    targetRotate: 6,
    depth: 12,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=85',
    tag: 'LUXURY #03',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[105px] sm:h-[130px]',
    targetX: -110,
    targetY: -260,
    targetRotate: -4,
    depth: 18,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: true,
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=85',
    tag: 'FLATLAY #04',
    width: 'w-[150px] sm:w-[190px]',
    height: 'h-[185px] sm:h-[235px]',
    targetX: 270,
    targetY: -180,
    targetRotate: -5,
    depth: 22,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=85',
    tag: 'TEE #05',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[205px] sm:h-[255px]',
    targetX: 480,
    targetY: -220,
    targetRotate: 7,
    depth: 25,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85',
    tag: 'VIBE #06',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[180px] sm:h-[220px]',
    targetX: -460,
    targetY: 180,
    targetRotate: -6,
    depth: 20,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=85',
    tag: 'PORTRAIT #07',
    width: 'w-[130px] sm:w-[160px]',
    height: 'h-[110px] sm:h-[135px]',
    targetX: -220,
    targetY: 220,
    targetRotate: 5,
    depth: 14,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: true,
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85',
    tag: 'URBAN #08',
    width: 'w-[135px] sm:w-[165px]',
    height: 'h-[115px] sm:h-[140px]',
    targetX: 220,
    targetY: 220,
    targetRotate: -4,
    depth: 14,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: true,
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=85',
    tag: 'MODEL #09',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[185px] sm:h-[230px]',
    targetX: 460,
    targetY: 180,
    targetRotate: 6,
    depth: 20,
    range: [0.04, 0.14, 0.28, 0.35],
    mobileHide: false,
  },

  // WAVE 2: SECOND RADIAL EXPLOSION WAVE (0.18 -> 0.50 Scroll Progress)
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=85',
    tag: 'CYBER #10',
    width: 'w-[150px] sm:w-[190px]',
    height: 'h-[190px] sm:h-[240px]',
    targetX: -520,
    targetY: -50,
    targetRotate: -7,
    depth: 24,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: false,
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=85',
    tag: 'EDITORIAL #11',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[120px] sm:h-[150px]',
    targetX: -340,
    targetY: -270,
    targetRotate: 5,
    depth: 16,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: true,
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
    tag: 'EDGY #12',
    width: 'w-[155px] sm:w-[190px]',
    height: 'h-[180px] sm:h-[225px]',
    targetX: 340,
    targetY: -270,
    targetRotate: -6,
    depth: 22,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: false,
  },
  {
    id: 13,
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85',
    tag: 'YELLOW #13',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[180px] sm:h-[225px]',
    targetX: 520,
    targetY: -50,
    targetRotate: 8,
    depth: 25,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: false,
  },
  {
    id: 14,
    src: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=85',
    tag: 'SHADE #14',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[125px] sm:h-[155px]',
    targetX: -380,
    targetY: 240,
    targetRotate: -4,
    depth: 18,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: true,
  },
  {
    id: 15,
    src: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=85',
    tag: 'RETRO #15',
    width: 'w-[135px] sm:w-[165px]',
    height: 'h-[160px] sm:h-[195px]',
    targetX: -160,
    targetY: 250,
    targetRotate: 6,
    depth: 15,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: true,
  },
  {
    id: 16,
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=85',
    tag: 'GLAM #16',
    width: 'w-[135px] sm:w-[165px]',
    height: 'h-[160px] sm:h-[195px]',
    targetX: 160,
    targetY: 250,
    targetRotate: -5,
    depth: 15,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: true,
  },
  {
    id: 17,
    src: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=85',
    tag: 'ACID #17',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[125px] sm:h-[155px]',
    targetX: 380,
    targetY: 240,
    targetRotate: 4,
    depth: 18,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: false,
  },
  {
    id: 18,
    src: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=85',
    tag: 'CASUAL #18',
    width: 'w-[145px] sm:w-[175px]',
    height: 'h-[165px] sm:h-[205px]',
    targetX: 0,
    targetY: -280,
    targetRotate: -3,
    depth: 17,
    range: [0.18, 0.28, 0.42, 0.50],
    mobileHide: true,
  },

  // WAVE 3: THIRD RADIAL EXPLOSION WAVE (0.34 -> 0.66 Scroll Progress)
  {
    id: 19,
    src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=85',
    tag: 'POLO #19',
    width: 'w-[160px] sm:w-[195px]',
    height: 'h-[195px] sm:h-[245px]',
    targetX: -440,
    targetY: -240,
    targetRotate: -6,
    depth: 23,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: false,
  },
  {
    id: 20,
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=85',
    tag: 'HENLEY #20',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[175px] sm:h-[220px]',
    targetX: 440,
    targetY: -240,
    targetRotate: 6,
    depth: 21,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: false,
  },
  {
    id: 21,
    src: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=85',
    tag: 'VINTAGE #21',
    width: 'w-[140px] sm:w-[175px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: -490,
    targetY: 80,
    targetRotate: -5,
    depth: 25,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: false,
  },
  {
    id: 22,
    src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85',
    tag: 'ZIPPER #22',
    width: 'w-[140px] sm:w-[175px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: 490,
    targetY: 80,
    targetRotate: 5,
    depth: 17,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: true,
  },
  {
    id: 23,
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=85',
    tag: 'PORTRAIT #23',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[120px] sm:h-[150px]',
    targetX: -300,
    targetY: 260,
    targetRotate: -3,
    depth: 19,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: true,
  },
  {
    id: 24,
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=85',
    tag: 'HIGH-END #24',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[120px] sm:h-[150px]',
    targetX: 300,
    targetY: 260,
    targetRotate: 3,
    depth: 13,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: true,
  },
  {
    id: 25,
    src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=85',
    tag: 'NEXT GEN #25',
    width: 'w-[155px] sm:w-[190px]',
    height: 'h-[190px] sm:h-[235px]',
    targetX: 0,
    targetY: 280,
    targetRotate: 4,
    depth: 20,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: false,
  },
  {
    id: 26,
    src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85',
    tag: 'ULTRA #26',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[165px] sm:h-[205px]',
    targetX: -260,
    targetY: -220,
    targetRotate: -4,
    depth: 14,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: true,
  },
  {
    id: 27,
    src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=85',
    tag: 'CHIC #27',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[165px] sm:h-[205px]',
    targetX: 260,
    targetY: -220,
    targetRotate: 4,
    depth: 14,
    range: [0.34, 0.44, 0.58, 0.66],
    mobileHide: true,
  },

  // WAVE 4: FOURTH RADIAL EXPLOSION WAVE (0.50 -> 0.82 Scroll Progress)
  {
    id: 28,
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=85',
    tag: 'FINALE #28',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: -500,
    targetY: -210,
    targetRotate: -7,
    depth: 18,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: false,
  },
  {
    id: 29,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85',
    tag: 'DROP #29',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: 500,
    targetY: -210,
    targetRotate: 7,
    depth: 27,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: false,
  },
  {
    id: 30,
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=85',
    tag: 'AESTHETIC #30',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: -320,
    targetY: 240,
    targetRotate: -4,
    depth: 24,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: true,
  },
  {
    id: 31,
    src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85',
    tag: 'STYLE #31',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: 320,
    targetY: 240,
    targetRotate: 4,
    depth: 22,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: false,
  },
  {
    id: 32,
    src: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=85',
    tag: 'FASHION #32',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[165px] sm:h-[205px]',
    targetX: -450,
    targetY: -100,
    targetRotate: -5,
    depth: 12,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: true,
  },
  {
    id: 33,
    src: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=85',
    tag: 'LOOK #33',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[165px] sm:h-[205px]',
    targetX: 450,
    targetY: -100,
    targetRotate: 5,
    depth: 20,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: true,
  },
  {
    id: 34,
    src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=85',
    tag: 'URBAN #34',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[125px] sm:h-[155px]',
    targetX: 0,
    targetY: 270,
    targetRotate: 0,
    depth: 16,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: false,
  },
  {
    id: 35,
    src: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=85',
    tag: 'CAP #35',
    width: 'w-[130px] sm:w-[160px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: -200,
    targetY: -250,
    targetRotate: -4,
    depth: 15,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: true,
  },
  {
    id: 36,
    src: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=85',
    tag: 'TEE #36',
    width: 'w-[130px] sm:w-[160px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: 200,
    targetY: -250,
    targetRotate: 4,
    depth: 15,
    range: [0.50, 0.60, 0.74, 0.82],
    mobileHide: true,
  },

  // WAVE 5: FIFTH RADIAL EXPLOSION WAVE (0.64 -> 0.94 Scroll Progress)
  {
    id: 37,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=85',
    tag: 'NEON #37',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: -480,
    targetY: -220,
    targetRotate: -7,
    depth: 26,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },
  {
    id: 38,
    src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=85',
    tag: 'PORTRAIT #38',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: 480,
    targetY: -220,
    targetRotate: 7,
    depth: 24,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },
  {
    id: 39,
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85',
    tag: 'FIT #39',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: -510,
    targetY: 60,
    targetRotate: -5,
    depth: 20,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },
  {
    id: 40,
    src: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=85',
    tag: 'GLASSES #40',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: 510,
    targetY: 60,
    targetRotate: 5,
    depth: 20,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },
  {
    id: 41,
    src: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&q=85',
    tag: 'SUIT #41',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: -300,
    targetY: 250,
    targetRotate: -4,
    depth: 18,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: true,
  },
  {
    id: 42,
    src: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=85',
    tag: 'DENIM #42',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: 300,
    targetY: 250,
    targetRotate: 4,
    depth: 18,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: true,
  },
  {
    id: 43,
    src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=85',
    tag: 'POLO #43',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[160px] sm:h-[200px]',
    targetX: 0,
    targetY: -270,
    targetRotate: 0,
    depth: 15,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },
  {
    id: 44,
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=85',
    tag: 'HENLEY #44',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[160px] sm:h-[200px]',
    targetX: 0,
    targetY: 270,
    targetRotate: 0,
    depth: 15,
    range: [0.64, 0.74, 0.88, 0.94],
    mobileHide: false,
  },

  // WAVE 6: SIXTH RADIAL EXPLOSION WAVE (0.78 -> 0.99 Scroll Progress)
  {
    id: 45,
    src: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=85',
    tag: 'VINTAGE #45',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: -480,
    targetY: -210,
    targetRotate: -8,
    depth: 26,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: false,
  },
  {
    id: 46,
    src: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85',
    tag: 'ZIPPER #46',
    width: 'w-[160px] sm:w-[200px]',
    height: 'h-[200px] sm:h-[250px]',
    targetX: 480,
    targetY: -210,
    targetRotate: 8,
    depth: 26,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: false,
  },
  {
    id: 47,
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=85',
    tag: 'GIRL #47',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: -320,
    targetY: 240,
    targetRotate: -4,
    depth: 20,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: true,
  },
  {
    id: 48,
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=85',
    tag: 'BOY #48',
    width: 'w-[150px] sm:w-[185px]',
    height: 'h-[130px] sm:h-[160px]',
    targetX: 320,
    targetY: 240,
    targetRotate: 4,
    depth: 20,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: true,
  },
  {
    id: 49,
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=85',
    tag: 'ULTRA #49',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: -490,
    targetY: 40,
    targetRotate: -5,
    depth: 22,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: false,
  },
  {
    id: 50,
    src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=85',
    tag: 'CHIC #50',
    width: 'w-[145px] sm:w-[180px]',
    height: 'h-[175px] sm:h-[215px]',
    targetX: 490,
    targetY: 40,
    targetRotate: 5,
    depth: 22,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: false,
  },
  {
    id: 51,
    src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=85',
    tag: 'MODEL #51',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[160px] sm:h-[200px]',
    targetX: -220,
    targetY: -240,
    targetRotate: -3,
    depth: 16,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: true,
  },
  {
    id: 52,
    src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85',
    tag: 'SUIT #52',
    width: 'w-[140px] sm:w-[170px]',
    height: 'h-[160px] sm:h-[200px]',
    targetX: 220,
    targetY: -240,
    targetRotate: 3,
    depth: 16,
    range: [0.78, 0.86, 0.96, 0.99],
    mobileHide: true,
  },
];

// HIGH-DENSITY OUTWARD STREAM SUBCOMPONENT (8 ACTIVE STREAMING CARDS)
// Images emerge continuously behind text every 450ms and fly outward in all directions past screen borders!
function SequentialImageStreamer({ images, mousePos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 450); // Fast 450ms spawn interval for rich, active card flow
    return () => clearInterval(timer);
  }, [images.length]);

  // Keep 8 active slots streaming outward simultaneously across all directions
  const len = images.length;
  const activeSlots = [
    (currentIndex - 7 + len) % len,
    (currentIndex - 6 + len) % len,
    (currentIndex - 5 + len) % len,
    (currentIndex - 4 + len) % len,
    (currentIndex - 3 + len) % len,
    (currentIndex - 2 + len) % len,
    (currentIndex - 1 + len) % len,
    currentIndex,
  ];

  // 12 Compass directions (Left, Right, Top, Bottom & Multi-Angle Diagonals)
  const compassDirections = [
    { x: -980, y: -60 },   // Pure Left
    { x: 980, y: 60 },     // Pure Right
    { x: 0, y: -650 },     // Top Center
    { x: 0, y: 650 },      // Bottom Center
    { x: -880, y: -450 },  // Far Top-Left
    { x: 880, y: -450 },   // Far Top-Right
    { x: -880, y: 450 },   // Far Bottom-Left
    { x: 880, y: 450 },    // Far Bottom-Right
    { x: -500, y: -580 },  // Mid Top-Left
    { x: 500, y: -580 },   // Mid Top-Right
    { x: -500, y: 580 },   // Mid Bottom-Left
    { x: 500, y: 580 },    // Mid Bottom-Right
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="popLayout">
        {activeSlots.map((idx) => {
          const img = images[idx];
          if (!img) return null;

          // Select compass trajectory far past screen frame
          const dir = compassDirections[img.id % compassDirections.length];
          const finalX = dir.x;
          const finalY = dir.y;

          const mousePxX = mousePos.x * (img.depth || 10);
          const mousePxY = mousePos.y * (img.depth || 10);

          return (
            <motion.div
              key={`${img.id}-${idx}`}
              initial={{
                x: '-50%',
                y: '-50%',
                scale: 0.15,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                // 1. Starts ONLY behind central text -> 2. Slides out -> 3. Slides past screen frame into overflow:hidden (NO FADE!)
                x: [
                  '-50%',
                  `calc(-50% + ${finalX * 0.28}px)`,
                  `calc(-50% + ${finalX * 0.72}px)`,
                  `calc(-50% + ${finalX}px)`,
                ],
                y: [
                  '-50%',
                  `calc(-50% + ${finalY * 0.28}px)`,
                  `calc(-50% + ${finalY * 0.72}px)`,
                  `calc(-50% + ${finalY}px)`,
                ],
                scale: [0.15, 1, 1, 1], // Stays solid full size!
                opacity: [0, 1, 1, 1],  // NO OPACITY FADE! 100% Solid opacity while sliding past screen frame!
                rotate: [
                  0,
                  (img.targetRotate || 4),
                  (img.targetRotate || 4) * 1.2,
                  (img.targetRotate || 4) * 1.4,
                ],
              }}
              exit={{
                opacity: 0,
                scale: 0.2,
                transition: { duration: 0.1 },
              }}
              transition={{
                duration: 3.6, // Smooth travel duration out past screen borders
                times: [0, 0.12, 0.6, 1.0],
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '47%',
                left: '50%',
                translateX: mousePxX,
                translateY: mousePxY,
              }}
              className={`${img.width} ${img.height} ${img.mobileHide ? 'hidden md:block' : 'block'} rounded-none overflow-hidden shadow-2xl border border-white/20 bg-neutral-900/80 backdrop-blur-xs group transition-transform duration-300 hover:scale-115 hover:z-50 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] cursor-pointer pointer-events-auto`}
            >
              <img
                src={img.src}
                alt={img.tag}
                className="h-full w-full object-cover filter saturate-[0.95] group-hover:scale-110 transition-transform duration-500"
              />
              {/* Dynamic overlay & tag label on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-purple-300 uppercase bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-400/40 backdrop-blur-md">
                  {img.tag}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function HeroBanner() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse Parallax Track
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll Sync Animations for Pinned Viewport Transition + Dynamic Sequential Image Stream
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  // 1. PHASE 1: Wall SVG Image (Rotates -45deg in opposite 3D direction & fades out on scroll)
  const imgScale = useTransform(smoothProgress, [0, 0.08], [1, 3.8]);
  const imgRotateX = useTransform(smoothProgress, [0, 0.08], [0, -45]);
  const imgRotateY = useTransform(smoothProgress, [0, 0.08], [0, -45]);
  const imgRotateZ = useTransform(smoothProgress, [0, 0.08], [0, 45]);
  const imgOpacity = useTransform(smoothProgress, [0, 0.01, 0.07], [1, 0.5, 0]);

  // Steady Text Overlay (Stays fixed & fully visible while wall image rotates away and cards stream in behind it)
  const textOpacity = useTransform(smoothProgress, [0, 0.85, 0.98], [1, 1, 0]);
  const intro3DPointerEvents = useTransform(smoothProgress, [0, 0.06], ['auto', 'none']);

  // 2. PHASE 2: Floating Cards Hero (Emerges immediately behind rotating wall image on initial scroll)
  const heroOpacity = useTransform(smoothProgress, [0.01, 0.06, 0.92, 0.98], [0, 1, 1, 0]);
  const heroScale = useTransform(smoothProgress, [0.01, 0.06, 0.92, 0.98], [0.85, 1, 1, 0.9]);
  const heroPointerEvents = useTransform(smoothProgress, [0.01, 0.04, 0.94], ['none', 'auto', 'none']);

  const scrollNextStep = () => {
    if (containerRef.current) {
      const scrollTarget = window.innerHeight * 1.2;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-white selection:text-black font-sans min-h-[350vh]">

      {/* STICKY PINNED VIEWPORT CONTAINER (STAYS LOCKED IN PLACE AS USER SCROLLS) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* ========================================================================= */}
        {/* PHASE 1: WALL SVG (ROTATING 3D & FADING) + STEADY CENTER TEXT & BUTTONS */}
        {/* ========================================================================= */}
        <div
          onClick={scrollNextStep}
          style={{ pointerEvents: intro3DPointerEvents }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-transparent overflow-hidden cursor-pointer select-none px-0 perspective-[1200px]"
        >
          {/* 1. Image rotates in 3D and fades out on scroll */}
          <motion.img
            src="/home img/wall.svg"
            alt="AmaYaar Wall"
            style={{
              opacity: imgOpacity,
              scale: imgScale,
              rotateX: imgRotateX,
              rotateY: imgRotateY,
              rotateZ: imgRotateZ,
            }}
            className="w-full h-full object-fill pointer-events-none transform-gpu"
          />

          {/* 2. Text & Buttons stay steady in place without rotating */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute z-50 flex flex-col items-center justify-center text-center px-4 pointer-events-auto"
          >
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-tight mb-4 sm:mb-5 max-w-3xl">
              THE CREATOR-FIRST <br />
              GENERATIVE AI PLATFORM
            </h1>

            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/products"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-white px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-black shadow-md hover:bg-neutral-100 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Start now
              </Link>

              <Link
                to="/products"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/40 bg-black/60 px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white backdrop-blur-md shadow-md hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Developer API
              </Link>
            </div>
          </motion.div>
        </div>


        {/* ========================================================================= */}
        {/* PHASE 2: FLOATING CARDS HERO (WITH CLEAN SEQUENTIAL IMAGE STREAM) */}
        {/* ========================================================================= */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            pointerEvents: heroPointerEvents,
          }}
          className="absolute inset-0 z-20 flex flex-col justify-between pt-20 sm:pt-24"
        >
          {/* SEQUENTIAL ONE-BY-ONE IMAGE STREAM (No lingering images on sides) */}
          <SequentialImageStreamer
            images={FLOATING_IMAGES}
            mousePos={mousePos}
          />
        </motion.div>

      </div>

    </div>
  );
}
