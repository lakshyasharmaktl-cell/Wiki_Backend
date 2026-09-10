import product_models from '../models/product_models.js';
import order_models from '../models/order_models.js';
import { error } from '../error/errorhandling.js';

export const get_products = async (req, res) => {
  try {
    const { category, search, sort, bestSeller, featured, limit } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (bestSeller === 'true') {
      query.bestSeller = true;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };

    let productQuery = product_models.find(query).sort(sortOption);
    if (limit) productQuery = productQuery.limit(Number(limit));

    const products = await productQuery;

    return res.status(200).json({
      status: true,
      count: products.length,
      products
    });
  } catch (err) {
    return error(err, res);
  }
};

export const get_product_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await product_models.findById(id);
    }
    if (!product) {
      product = await product_models.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ status: false, msg: 'Product not found.' });
    }

    return res.status(200).json({ status: true, product });
  } catch (err) {
    return error(err, res);
  }
};

export const create_order = async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, shippingAddress, subtotal, discount, shippingFee, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ status: false, msg: 'Cart is empty or total amount is missing.' });
    }

    const newOrder = new order_models({
      user: req.user?._id || null,
      customerName: customerName || req.user?.name || 'Valued Connoisseur',
      customerEmail: customerEmail || req.user?.email || 'customer@whiskyhub.com',
      customerPhone: customerPhone || req.user?.phone || '',
      shippingAddress: shippingAddress || {
        street: '742 Model Town',
        city: 'Kaithal',
        state: 'Haryana',
        pincode: '136027'
      },
      items,
      subtotal: subtotal || totalAmount,
      discount: discount || 0,
      shippingFee: shippingFee || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Processing'
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      status: true,
      msg: 'Order placed successfully! Tracking details will be updated shortly.',
      order: savedOrder
    });
  } catch (err) {
    return error(err, res);
  }
};

export const get_user_orders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await order_models.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, count: orders.length, orders });
  } catch (err) {
    return error(err, res);
  }
};

export const seed_initial_products = async (req, res) => {
  try {
    const count = await product_models.countDocuments();
    if (count > 0) {
      return res.status(200).json({ status: true, msg: `Products already seeded (${count} items).` });
    }

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
        description: "The Macallan Sherry Oak 12 Years Old forms part of our Sherry Oak range which features a series of single malt whiskies matured exclusively in hand-picked sherry seasoned oak casks from Jerez.",
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
        description: "A truly exceptional single malt, the result not just of eighteen years of care and attention, but of whisky-making craft and knowledge.",
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
          nose: "Peach, pineapple, grapefruit, clove, candied orange, vanilla, Mizunara (Japanese oak).",
          palate: "Coconut, cranberry, butter.",
          finish: "Sweet ginger, cinnamon, long finish."
        },
        description: "Yamazaki 12 Year Old is Suntory's flagship single malt whisky, from Japan's first and oldest malt distillery.",
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
        description: "An extraordinary blend created with some of the rarest Scotch whiskies from across the four corners of Scotland.",
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
        description: "The King of Islay. Deep, dry and powerfully peaty, this classic malt is matured for 16 long years on the south shore.",
        bestSeller: false,
        isFeatured: true
      },
      {
        name: "Virgin Mojito Botanica",
        slug: "virgin-mojito-botanica",
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
        description: "An elevated alcohol-free cocktail made with hand-picked garden mint, Persian lime juice, and sparkling mineral water.",
        bestSeller: true,
        isFeatured: true
      },
      {
        name: "Smoked Berry Shirley Temple",
        slug: "smoked-berry-shirley-temple",
        category: "mocktails",
        subCategory: "Artisanal Mocktail",
        tagline: "330ml • 0.0% ABV",
        price: 480,
        originalPrice: 600,
        discountPercent: 20,
        deliveryTime: "10 MINS",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600",
        origin: "Signature Bar",
        age: "Freshly Crafted",
        abv: "0.0%",
        rating: 4.6,
        reviewsCount: 64,
        tastingNotes: {
          nose: "Pomegranate and aromatic ginger.",
          palate: "Tart cherry with delicate smoky sweetness.",
          finish: "Sparkling ginger zing."
        },
        description: "A reimagined classic mocktail infused with artisanal grenadine, smoked cherry bitters, and fiery ginger ale.",
        bestSeller: false,
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
        description: "The world famous Mexican lager, smooth, golden, best enjoyed chilled with a fresh lime wedge.",
        bestSeller: true,
        isFeatured: true
      },
      {
        name: "Budweiser Magnum Double Matured",
        slug: "budweiser-magnum",
        category: "beers",
        subCategory: "Strong Lager",
        tagline: "Pack of 6 (500ml) • 6.5% ABV",
        price: 1450,
        originalPrice: 1700,
        discountPercent: 15,
        deliveryTime: "12 MINS",
        image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=600",
        origin: "USA / Global",
        age: "Double Matured",
        abv: "6.5%",
        rating: 4.7,
        reviewsCount: 165,
        tastingNotes: {
          nose: "Rich toasted malt and subtle hops.",
          palate: "Bold body with crisp effervescence.",
          finish: "Satisfying full-bodied finish."
        },
        description: "Crafted with double matured barley malt and beechwood aged for an intense, full-bodied taste.",
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
        description: "Distilled from the finest French soft winter wheat and natural spring water from Gensac-la-Pallue.",
        bestSeller: true,
        isFeatured: true
      },
      {
        name: "Captain Morgan Private Reserve Rum",
        slug: "captain-morgan-reserve",
        category: "spirits",
        subCategory: "Spiced Rum",
        tagline: "750ml • 40% ABV",
        price: 2450,
        originalPrice: 2900,
        discountPercent: 16,
        deliveryTime: "10 MINS",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
        origin: "Jamaica / Caribbean",
        age: "Aged in Charred Oak",
        abv: "40%",
        rating: 4.6,
        reviewsCount: 140,
        tastingNotes: {
          nose: "Rich vanilla, cassia bark, and warm cinnamon.",
          palate: "Molasses sweetness with Caribbean island spices.",
          finish: "Smooth and spiced warmth."
        },
        description: "Crafted with secret spices and aged in charred oak barrels for an adventurous, smooth Caribbean flavor profile.",
        bestSeller: false,
        isFeatured: true
      }
    ];

    await product_models.insertMany(defaultCatalog);

    return res.status(201).json({
      status: true,
      msg: `Seeded ${defaultCatalog.length} products successfully!`,
      products: defaultCatalog
    });
  } catch (err) {
    return error(err, res);
  }
};
