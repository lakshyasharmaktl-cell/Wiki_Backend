import express from 'express';
import multer from 'multer';

import {
  create_user,
  verify_otp,
  resend_otp,
  change_unverified_email,
  user_login,
  get_profile,
  update_profile,
  change_password,
  change_email,
  change_avatar,
  delete_account
} from '../controller/user_controller.js';

import {
  get_admin_stats,
  get_all_users,
  update_user_role,
  delete_user,
  admin_get_products,
  admin_create_product,
  admin_update_product,
  admin_delete_product,
  admin_get_orders,
  admin_update_order_status
} from '../controller/admin_controller.js';

import {
  get_products,
  get_product_by_id,
  create_order,
  get_user_orders,
  seed_initial_products
} from '../controller/product_controller.js';

import { verifyToken, isAdmin } from '../middleware/auth_middleware.js';

const upload = multer({ storage: multer.diskStorage({}) });
const routes = express.Router();

// --- AUTHENTICATION ROUTES (Backwards compatible + REST standard) ---
routes.post('/laxxy', upload.single('profileImg'), create_user);
routes.post('/api/auth/register', upload.single('profileImg'), create_user);

routes.post('/verify_otp/:id', verify_otp);
routes.post('/verify_otp', verify_otp);
routes.post('/api/auth/verify-otp/:id', verify_otp);
routes.post('/api/auth/verify-otp', verify_otp);

routes.post('/resend_otp/:id', resend_otp);
routes.post('/resend_otp', resend_otp);
routes.post('/api/auth/resend-otp/:id', resend_otp);
routes.post('/api/auth/resend-otp', resend_otp);

routes.post('/change_unverified_email/:id', change_unverified_email);
routes.post('/change_unverified_email', change_unverified_email);
routes.post('/api/auth/change-email/:id', change_unverified_email);

routes.post('/user_login', user_login);
routes.post('/api/auth/login', user_login);

// --- USER PROFILE & ACCOUNT ROUTES ---
routes.get('/api/user/profile', verifyToken, get_profile);
routes.put('/api/user/profile', verifyToken, update_profile);
routes.put('/api/user/change-password', verifyToken, change_password);
routes.put('/api/user/change-email', verifyToken, change_email);
routes.put('/api/user/change-avatar', verifyToken, change_avatar);
routes.delete('/api/user/delete-account', verifyToken, delete_account);

// --- ORDERS & CART ---
routes.post('/api/orders', create_order);
routes.get('/api/user/orders', verifyToken, get_user_orders);

// --- PUBLIC PRODUCT CATALOG ROUTES ---
routes.get('/api/products', get_products);
routes.get('/api/products/:id', get_product_by_id);
routes.post('/api/products/seed', seed_initial_products);

// --- ADMIN CONTROL PANEL ROUTES (Protected) ---
routes.get('/api/admin/stats', verifyToken, isAdmin, get_admin_stats);
routes.get('/api/admin/users', verifyToken, isAdmin, get_all_users);
routes.put('/api/admin/users/:id/role', verifyToken, isAdmin, update_user_role);
routes.delete('/api/admin/users/:id', verifyToken, isAdmin, delete_user);

routes.get('/api/admin/products', verifyToken, isAdmin, admin_get_products);
routes.post('/api/admin/products', verifyToken, isAdmin, admin_create_product);
routes.put('/api/admin/products/:id', verifyToken, isAdmin, admin_update_product);
routes.delete('/api/admin/products/:id', verifyToken, isAdmin, admin_delete_product);

routes.get('/api/admin/orders', verifyToken, isAdmin, admin_get_orders);
routes.put('/api/admin/orders/:id/status', verifyToken, isAdmin, admin_update_order_status);

export default routes;
