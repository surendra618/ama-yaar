const fs = require('fs');

const raw = `,Product Type,Category,Sub-Category,Product name,Small,Medium,Large,XL,Size,Size in Avaialable,Cost Price (₹),Selling Price (₹),Total Pieces,Sold Pieces,Remaining Pieces
,Shirts,BOXY-FIT Shirts,Check Design,BLACK WITH MARRON RED WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,DARK GREY WITH MAROON RED & WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,GREY WITH BROWN & WHITE CHECKS---Street 17 GFX,0,0,1,0,,,,,1,,
,,,,GREY WITH BROWN & WHITE CHECKS---Will Not GFX,0,0,1,0,,,,,1,,
,,,,LIGHT BLUE WITH WHITE & BLACK---Street 17 GFX,0,1,0,0,,,,,1,,
,,,,LIGHT BLUE WITH WHITE & BLACK---Will Not GFX,0,0,2,0,,,,,2,,
,,,,LIGHT GREY WITH WHITE & BLACK CHECKS,0,1,0,0,,,,,1,,
,,,,MUSTARD YELLOW WITH GREY & WHITE CHECKS---Street 17 GFX,0,0,1,0,,,,,1,,
,,,,MUSTARD YELLOW WITH GREY & WHITE CHECKS---Nope GFX,0,1,0,0,,,,,1,,
,,,,SKY BLUE WITH GREY & WHITE CHECKS,0,0,1,0,,,,,1,,
,,,,TEAL GREEN WITH BLACK & WHITE CHECKS,0,1,0,0,,,,,1,,
,,,,WHITE WITH BLACK & RED CHECKS,0,1,0,0,,,,,1,,
,,,,WHITE WITH BLUE CHECKS,0,0,1,0,,,,,1,,
,,,Plain Design,BEIGE,0,1,1,1,,,,,3,,
,,,,BLACK,0,1,1,1,,,,,3,,
,,,,BROWN,0,1,1,1,,,,,3,,
,,,,LIGHT BLUE,0,1,1,1,,,,,3,,
,,,,OFF WHITE-CREAM,0,1,1,1,,,,,3,,
,,,,WHITE,0,1,1,1,,,,,3,,
,,,,,,,,,,,,,,,
,,PATTERN Shirts,------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,DARK NAVY BLUE,0,1,1,1,,,,,3,,
,,,,WHITE,0,0,1,2,,,,,3,,
,,,,,,,,,,,,,,,
,,PLAIN Shirts,------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,DARK OLIVE GREEN,0,1,1,1,,,,,3,,
,,,,NAVY BLUE,0,1,1,1,,,,,3,,
,,,,RUST BROWN,0,1,1,1,,,,,3,,
,,,,WHITE,0,0,1,2,,,,,3,,
,,,,,,,,,,,,,,,
,,STRIP Shirts,------------------------,LIGHT BLUE & WHITE,0,2,0,1,,,,,3,,
,,,,LIGHT PINK & WHITE,0,0,0,3,,,,,3,,
,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,
,T-Shirts,Fleece henley,------------------------,BLACK,0,1,0,1,,,,,2,,
,,,,DARK CHARCOAL GREY,0,0,0,1,,,,,1,,
,,,,MINT GREEN,0,1,1,1,,,,,3,,
,,,,Peach Pink,0,1,2,1,,,,,3,,
,,,,Purple,0,1,0,1,,,,,2,,
,,,,,,,,,,,,,,,
,,Polo t-Shirts,Gucci,BLACK,0,0,1,0,,,,,1,,
,,,,LIGHT GREY,0,0,1,0,,,,,1,,
,,,,ROYAL BLUE,0,0,1,0,,,,,1,,
,,,,RUST BROWN,0,0,1,0,,,,,1,,
,,,,SLATE GREY,0,0,2,0,,,,,2,,
,,,Puma,BLACK,0,1,0,2,,,,,3,,
,,,,CREAM,0,1,1,0,,,,,2,,
,,,,MAUVE BROWN,0,1,1,1,,,,,3,,
,,,,RED,0,1,0,1,,,,,2,,
,,,,SLATY BLUE,0,2,0,1,,,,,3,,
,,,,WHITE,0,1,0,1,,,,,2,,
,,,Sports,BLACK,0,2,2,0,,,,,4,,
,,,,DUSKY PINK,0,1,1,0,,,,,2,,
,,,,OFF WHITE,0,1,1,0,,,,,2,,
,,,,RUST BROWN,0,2,2,0,,,,,4,,
,,,,RUST ORANGE,0,1,1,0,,,,,2,,
,,,,STEEL BLUE,0,2,2,0,,,,,4,,
,,,,,,,,,,,,,,,
,,Riders ,-------------------------,BLACK,0,1,1,1,,,,,3,,
,,,,BLACK  WITH SLATE GREEN SLEEVES,0,1,3,1,,,,,5,,
,,,,BLACK WITH BROWN SLEEVES,0,1,0,1,,,,,2,,
,,,,BROWN,0,1,1,1,,,,,3,,
,,,,CREAM,0,1,1,1,,,,,3,,
,,,,RED,0,1,1,1,,,,,3,,
,,,,RED WITH WHITE SLEEVES,0,1,1,1,,,,,3,,
,,,,RUST BROWN WITH DARK BROWN SLEEVES,0,0,0,3,,,,,3,,
,,,,SLATE BLUE,0,1,1,1,,,,,3,,
,,,,SLATE GREEN WITH BLACK SLEEVES,0,1,1,1,,,,,3,,
,,,,WHITE,0,1,1,1,,,,,3,,
,,,,WHITE WITH OLIVE GREEN SLEEVES,0,1,0,0,,,,,1,,
,,,,WHITE WITH RED SLEEVES,0,0,0,1,,,,,1,,
,,,,,,,,,,,,,,,
,,Waffle,------------------------,BLACK---------------------------------LUIS GFX,0,0,0,3,,,,,3,,
,,,,BLACK---------------------------------MAFIA GFX,0,0,3,1,,,,,4,,
,,,,BLACK---------------------------------LOST YOUTH GFX,0,0,1,0,,,,,1,,
,,,,CAMEL BROWN,0,1,1,1,,,,,3,,
,,,,DARK BROWN,0,0,0,1,,,,,1,,
,,,,DARK GREEN,0,1,1,1,,,,,3,,
,,,,GREY---------------------------------MAFIA GFX,0,0,2,0,,,,,2,,
,,,,GREY---------------------------------LOST YOUTH GFX,0,0,0,1,,,,,1,,
,,,,MARRON RED,0,0,1,0,,,,,1,,
,,,,OLIVE GREEN,0,1,1,0,,,,,2,,
,,,,RED---------------------------------LUIS GFX,0,1,0,1,,,,,2,,
,,,,RED---------------------------------SAINT GFX,0,1,0,0,,,,,1,,
,,,,SAGE GREEN---------------------------------LUIS GFX,0,0,1,1,,,,,2,,
,,,,SAGE GREEN---------------------------------Punjabi Pop GFX,0,0,1,0,,,,,1,,
,,,,WHITE,0,1,1,1,,,,,3,,`;

const lines = raw.trim().split('\n');
let curType = '';
let curCategory = '';
let curSubCategory = '';
const items = [];

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(s => s.trim());
  if (parts.length < 5) continue;
  const [empty, pType, cat, subCat, pName, s, m, l, xl, size, sizeAvail, cost, sell, total, sold, rem] = parts;
  if (pType) curType = pType;
  if (cat) curCategory = cat;
  if (subCat) curSubCategory = subCat;

  if (!pName || pName.startsWith('---') || pName.replace(/-/g, '').length === 0) continue;

  const small = parseInt(s) || 0;
  const medium = parseInt(m) || 0;
  const large = parseInt(l) || 0;
  const xlarge = parseInt(xl) || 0;
  const totalPieces = parseInt(total) || (small + medium + large + xlarge);

  // Clean name
  const cleanSubCat = (curSubCategory && !curSubCategory.startsWith('---')) ? curSubCategory : '';
  const cleanCategory = curCategory.trim();
  const cleanName = pName.replace(/-{3,}/g, ' - ').trim();

  // Full product display title
  let fullTitle = '';
  if (cleanSubCat) {
    fullTitle = `${cleanCategory} (${cleanSubCat}) - ${cleanName}`;
  } else {
    fullTitle = `${cleanCategory} - ${cleanName}`;
  }

  items.push({
    productType: curType,
    category: cleanCategory,
    subCategory: cleanSubCat,
    rawName: cleanName,
    fullTitle,
    variants: [
      { size: 'S', stock: small },
      { size: 'M', stock: medium },
      { size: 'L', stock: large },
      { size: 'XL', stock: xlarge }
    ].filter(v => v.stock > 0),
    totalPieces
  });
}

console.log('Total valid products found:', items.length);
console.log('Sample parsed (Shirts):', JSON.stringify(items.slice(0, 3), null, 2));
console.log('Sample parsed (T-Shirts):', JSON.stringify(items.filter(i => i.productType.includes('T-Shirt')).slice(0, 3), null, 2));
console.log('Unique categories:', [...new Set(items.map(i => i.category))]);
