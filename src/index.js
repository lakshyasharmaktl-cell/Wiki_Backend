import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/routes.js';
import user_models from './models/user_models.js'; 
import product_models from './models/product_models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1234;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI ;

// Seed initial admin, demo user & product catalog
const initDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = 'admin@whiskyhub.com';
    const existingAdmin = await user_models.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const newAdmin = new user_models({
        name: 'Master Distiller Admin',
        email: adminEmail,
        password: 'Admin@Whisky2026',
        role: 'admin',
        gender: 'Male',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        phone: '+91 9876543210',
        address: 'WhiskyHub HQ, Reserve Cellar 01, Kaithal',
        bio: 'Lead Curator & Platform Administrator for WhiskyHub.',
        user: { isVerify: true, isDelete: false }
      });
      await newAdmin.save();
      console.log('Default Admin created: admin@whiskyhub.com / Admin@Whisky2026');
    }

    // 2. Seed Standard Demo User
    const userEmail = 'connoisseur@whiskyhub.com';
    const existingUser = await user_models.findOne({ email: userEmail });
    if (!existingUser) {
      const newUser = new user_models({
        name: 'Alexander Croft', 
        email: userEmail,
        password: 'User@Whisky2026',
        role: 'user',
        gender: 'Male',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        phone: '+91 7495065304',
        address: '742 Model Town, Kaithal, Haryana 136027',
        bio: 'Single malt collector & speyside cask investor.',
        user: { isVerify: true, isDelete: false }
      });
      await newUser.save();
      console.log('Default Demo User created: connoisseur@whiskyhub.com / User@Whisky2026');
    }

    // 3. Seed Products if empty
    const productCount = await product_models.countDocuments();
    if (productCount === 0) {
      const defaultCatalog = [
        {
          name: "Macallan 12Y Sherry Oak",
          slug: "macallan-12y-sherry-oak",
          category: "whisky",
          subCategory: "Single Malt",
          tagline: "700ml • 40% ABV",
          price: 8450,
          originalPrice: 9900,
          discountPercent: 15,
          deliveryTime: "9 MINS",
          image: "https://images.unsplash.com/photo-1584225064536-d0fbc0a10c1c?auto=format&fit=crop&q=80&w=600",
          origin: "Scotland",
          age: "12 Years",
          abv: "40%",
          rating: 4.8,
          reviewsCount: 142,
          tastingNotes: {
            nose: "Vanilla with a hint of ginger, dried fruits and wood smoke.",
            palate: "Deliciously smooth, rich dried fruits and sherry oak.",
            finish: "Sweet toffee and lingering spice."
          },
          description: "Matured exclusively in hand-picked sherry seasoned oak casks from Jerez.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Glenfiddich 18 Single Malt",
          slug: "glenfiddich-18",
          category: "whisky",
          subCategory: "Single Malt",
          tagline: "700ml • 40% ABV",
          price: 10800,
          originalPrice: 12500,
          discountPercent: 14,
          deliveryTime: "12 MINS",
          image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
          origin: "Scotland",
          age: "18 Years",
          abv: "40%",
          rating: 4.9,
          reviewsCount: 198,
          tastingNotes: {
            nose: "Remarkably rich aroma with ripe orchard fruit, baked apple and robust oak.",
            palate: "Richly delivers luxurious dried fruit, candy peel and dates.",
            finish: "Warm, rewarding and distinguished."
          },
          description: "Exceptional single malt aged eighteen years in Spanish Oloroso and American oak.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Yamazaki 12 Japanese Single Malt",
          slug: "yamazaki-12",
          category: "whisky",
          subCategory: "Japanese Single Malt",
          tagline: "700ml • 43% ABV",
          price: 22000,
          originalPrice: 25000,
          discountPercent: 12,
          deliveryTime: "15 MINS",
          image: "https://images.unsplash.com/photo-1549231482-5cf39d19fba4?auto=format&fit=crop&q=80&w=600",
          origin: "Japan",
          age: "12 Years",
          abv: "43%",
          rating: 4.9,
          reviewsCount: 310,
          tastingNotes: {
            nose: "Peach, pineapple, grapefruit, clove, candied orange, vanilla, Mizunara oak.",
            palate: "Coconut, cranberry, butter.",
            finish: "Sweet ginger, cinnamon, long finish."
          },
          description: "Suntory's flagship single malt whisky from Yamazaki distillery.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Johnnie Walker Blue Label",
          slug: "johnnie-walker-blue",
          category: "whisky",
          subCategory: "Blended Scotch",
          tagline: "750ml • 40% ABV",
          price: 18500,
          originalPrice: 21000,
          discountPercent: 12,
          deliveryTime: "10 MINS",
          image: "https://images.unsplash.com/photo-1531214159280-079b95d26139?auto=format&fit=crop&q=80&w=600",
          origin: "Scotland",
          age: "NAS Rare Reserve",
          abv: "40%",
          rating: 5.0,
          reviewsCount: 260,
          tastingNotes: {
            nose: "Waves of spice give way to vanilla and honey.",
            palate: "Caramel and hazelnuts course through dark chocolate.",
            finish: "Luxuriously long, warming, smoky finish."
          },
          description: "An extraordinary blend created with Scotland's rarest whiskies.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Lagavulin 16 Islay Single Malt",
          slug: "lagavulin-16",
          category: "whisky",
          subCategory: "Islay Peated Single Malt",
          tagline: "700ml • 43% ABV",
          price: 11500,
          originalPrice: 13200,
          discountPercent: 13,
          deliveryTime: "11 MINS",
          image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=600",
          origin: "Islay, Scotland",
          age: "16 Years",
          abv: "43%",
          rating: 4.8,
          reviewsCount: 175,
          tastingNotes: {
            nose: "Intense peat smoke with rich iodine and sea spray sweet notes.",
            palate: "Rich dried fruit sweetness with warming peat smoke and barley malt.",
            finish: "Huge, long, warming and peaty."
          },
          description: "The King of Islay. Deep, dry and powerfully peaty.",
          bestSeller: false,
          isFeatured: true
        },
        {
          name: "Virgin Mojito Botanica",
          slug: "virgin-mojito",
          category: "mocktails",
          subCategory: "Craft Mocktail",
          tagline: "330ml • 0.0% ABV • Fresh Mint",
          price: 450,
          originalPrice: 550,
          discountPercent: 18,
          deliveryTime: "8 MINS",
          image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600",
          origin: "Signature Bar",
          age: "Freshly Crafted",
          abv: "0.0%",
          rating: 4.7,
          reviewsCount: 88,
          tastingNotes: {
            nose: "Crushed spearmint and zesty Key lime.",
            palate: "Crisp sparkling botanical soda with cane sugar balance.",
            finish: "Cool refreshing citrus burst."
          },
          description: "Elevated alcohol-free cocktail with fresh garden mint and lime.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Corona Extra Cerveza Premium",
          slug: "corona-extra",
          category: "beers",
          subCategory: "Imported Lager",
          tagline: "Pack of 6 (330ml) • 4.5% ABV",
          price: 1350,
          originalPrice: 1550,
          discountPercent: 13,
          deliveryTime: "10 MINS",
          image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600",
          origin: "Mexico",
          age: "Chilled",
          abv: "4.5%",
          rating: 4.8,
          reviewsCount: 220,
          tastingNotes: {
            nose: "Subtle malt with fruity-honey aroma.",
            palate: "Light, crisp and balanced with gentle hop bitterness.",
            finish: "Clean and refreshing."
          },
          description: "The world-renowned crisp Mexican lager.",
          bestSeller: true,
          isFeatured: true
        },
        {
          name: "Grey Goose Artisanal French Vodka",
          slug: "grey-goose-vodka",
          category: "spirits",
          subCategory: "Ultra-Premium Vodka",
          tagline: "750ml • 40% ABV",
          price: 4950,
          originalPrice: 5800,
          discountPercent: 15,
          deliveryTime: "10 MINS",
          image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=600",
          origin: "France",
          age: "Gensac Spring Water",
          abv: "40%",
          rating: 4.9,
          reviewsCount: 180,
          tastingNotes: {
            nose: "Delicate floral aroma with citrus sweetness.",
            palate: "Silky, sweet almond notes and mineral purity.",
            finish: "Bright, long and satisfying."
          },
          description: "Distilled from French winter wheat and pure spring water.",
          bestSeller: true,
          isFeatured: true
        }
      ];
      await product_models.insertMany(defaultCatalog);
      console.log(`Seeded ${defaultCatalog.length} default products.`);
    }
  } catch (err) {
    console.log('Database init warning:', err.message);
  }
};

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await initDatabase();
  })
  .catch((err) => console.log('MongoDB connection error =>', err.message));

app.use('/', routes);

app.listen(PORT, () => console.log(`WhiskyHub backend server running on port ${PORT}`));
