import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['whisky', 'mocktails', 'beers', 'spirits'],
      default: 'whisky'
    },
    subCategory: { type: String, default: 'Single Malt' },
    tagline: { type: String, default: '700ml • 40% ABV' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, default: 50 },
    deliveryTime: { type: String, default: '10 MINS' },
    image: { type: String, required: true },
    origin: { type: String, default: 'Scotland' },
    age: { type: String, default: '12 Years' },
    abv: { type: String, default: '40%' },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    tastingNotes: {
      nose: { type: String, default: 'Rich aromas of vanilla, honey and toasted oak' },
      palate: { type: String, default: 'Smooth dried fruits, spice, and balanced smoke' },
      finish: { type: String, default: 'Long, warm and velvety finish' }
    },
    description: { type: String, default: 'Handcrafted luxury spirit matured in selected oak casks.' },
    bestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
