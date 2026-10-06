const Blog = require('./blog.model');

const INITIAL_BLOGS = [
  {
    title: 'The Rise of Heavyweight 240+ GSM Oversized Tees in 2026 Street Culture',
    category: 'Style Guide',
    author: 'Vansh Singh',
    role: 'Head of Design',
    date: 'Oct 02, 2026',
    readTime: '4 min read',
    image: '/model-nirvana.jpg',
    featured: true,
    excerpt: 'Why standard thin cotton tees are dead. How 240 GSM boxy cut streetwear tees maintain shape, drape, and long-lasting urban presence.',
    content: 'For decades, fast-fashion brands pushed 140-160 GSM lightweight cotton tees. In 2026, modern urban fashion demands high-density, heavyweight 240 to 280 GSM combed cotton.',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Acid Wash vs Vintage Fade: How to Style Distressed Denim & Graphic Tops',
    category: 'Vibe & Trends',
    author: 'Arjun Yadav',
    role: 'Creative Director',
    date: 'Sep 28, 2026',
    readTime: '5 min read',
    image: '/model01.png',
    featured: false,
    excerpt: 'Demystifying handcrafted acid wash techniques. Here is how to pair distressed washed tops with 6-pocket cargos for effortless cool.',
    content: 'No two acid wash tees are ever identical. That unique, smoky marble texture isn\'t printed — it\'s carved through artisanal pumice stone washing and organic enzyme baths.',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: '6-Pocket Cargo Pants: The Ultimate Guide to Street Comfort & Utility',
    category: 'Streetwear Essentials',
    author: 'Sunil Kashyap',
    role: 'Lead Stylist',
    date: 'Sep 21, 2026',
    readTime: '3 min read',
    image: '/cardauto.png',
    featured: false,
    excerpt: 'From skater roots to modern airport lookbooks: why utility cargo pants are the most versatile bottomwear investment you can make.',
    content: 'Utility cargos have officially replaced traditional denim as the daily uniform for urban creators. Engineered with deep gusseted pockets and relaxed draping.',
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'Behind the Art: How Our Cyber Anime Back-Prints Are Designed',
    category: 'Culture Lab',
    author: 'Rohan Verma',
    role: 'Art Director',
    date: 'Sep 14, 2026',
    readTime: '6 min read',
    image: '/cardaut03.png',
    featured: false,
    excerpt: 'Take an exclusive peek into our design lab as we sketch, digitize, and screen-print bold anime artwork on drop shoulder silhouettes.',
    content: 'Every graphic print at AMA YAAR tells a narrative. We combine cyberpunk typography with dark anime aesthetics, translating hand-drawn ink sketches into screen prints.',
    displayOrder: 4,
    isActive: true,
  },
];

const seedInitialBlogsIfEmpty = async () => {
  const count = await Blog.countDocuments();
  if (count === 0) {
    await Blog.insertMany(INITIAL_BLOGS);
  }
};

const getActiveBlogs = async () => {
  await seedInitialBlogsIfEmpty();
  return Blog.find({ isActive: true }).sort({ featured: -1, displayOrder: 1, createdAt: -1 });
};

const getAllBlogs = async () => {
  await seedInitialBlogsIfEmpty();
  return Blog.find().sort({ featured: -1, displayOrder: 1, createdAt: -1 });
};

const getBlogById = async (id) => {
  return Blog.findById(id);
};

const createBlog = async (data) => {
  if (data.featured) {
    await Blog.updateMany({}, { featured: false });
  }
  const blog = new Blog(data);
  return blog.save();
};

const updateBlog = async (id, data) => {
  if (data.featured) {
    await Blog.updateMany({ _id: { $ne: id } }, { featured: false });
  }
  return Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteBlog = async (id) => {
  return Blog.findByIdAndDelete(id);
};

module.exports = {
  getActiveBlogs,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
