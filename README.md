# Fashion Store Frontend

> A modern, production-ready e-commerce platform built **completely from scratch** as a university diploma project. No templates, no skeletons, no shortcuts - just clean, professional code following industry best practices.

**[Live Demo → kounak.netlify.app](https://kounak.netlify.app)**

**Try Admin Panel**: `admin@kounak.com` / `admin123`

## 🎯 Overview

This is a full-featured fashion e-commerce platform developed as a university diploma project in Ukraine. What started as an academic assignment has evolved into a production-ready application that demonstrates enterprise-level architecture, modern React patterns, and a complete shopping experience with user management, admin capabilities, and payment processing.

**Key Achievement**: Every line of code, every component, every API integration was built from scratch without using any templates or boilerplate generators.

## 🏗️ Architecture & Scale

The application consists of:
- **41 React components** for modular, reusable UI
- **29 pages** covering the complete user journey
- **21 API client files** for backend integration
- **7 custom hooks** for business logic encapsulation
- **Context API** for global state management
- **Responsive design** that works flawlessly on mobile, tablet, and desktop

## 💼 What Makes This Different

### User Experience
- **Complete shopping flow**: Browse → Cart → Checkout → Order tracking
- **Wishlist functionality**: Save items for later
- **User profiles**: Manage addresses, view order history, edit personal info
- **Real-time cart updates**: Persistent across sessions
- **Category filtering**: Intuitive product discovery
- **Search functionality**: Find products quickly

### Admin Capabilities
- **Full CRUD operations**: Create, read, update, delete products
- **Category management**: Organize products efficiently  
- **Order tracking**: Monitor and fulfill orders in real-time
- **User management**: View and manage customer accounts
- **Statistics dashboard**: Track sales and performance
- **Image management**: Upload and organize product photos

### Payment Processing
- **Secure checkout flow**: Multi-step order placement
- **Address management**: Multiple delivery addresses
- **Payment simulation**: Complete transaction workflow
- **Order confirmation**: Email-ready notifications
- **Status tracking**: Customers can track order progress

## 🛠️ Tech Stack

### Core Technologies
- **React 18.2.0** - Latest version with concurrent features
- **React Router** - Client-side routing with protected routes
- **Context API** - Global state for authentication and user data
- **Custom Hooks** - Reusable business logic (useCart, useWishlist, useOrders, useAdmin)

### UI & UX
- **Material-UI 5.15.10** - Professional component library
- **React Hot Toast** - User-friendly notifications
- **React Beautiful DnD** - Drag and drop for admin panel
- **Responsive CSS** - Mobile-first design approach

### Data & API
- **Axios** - HTTP client with interceptors
- **JWT Authentication** - Secure token-based sessions
- **API Integration** - RESTful backend communication
- **Environment-based config** - Separate dev/prod settings

### Deployment
- **Netlify** - Global CDN with automatic deployments
- **Build optimization** - Code splitting and lazy loading
- **Production-ready** - 2MB bundle size

## 📁 Project Structure

```
src/
├── api/              # 21 API clients (products, cart, orders, users, etc.)
├── components/       # 41 reusable components (Header, Footer, ProductCard, Cart, etc.)
├── pages/            # 29 application pages (Home, Catalog, Checkout, Admin, etc.)
├── context/          # AuthContext for global authentication state
├── hooks/            # Custom hooks (useCart, useWishlist, useOrders, useAdmin)
├── config/           # API configuration and environment settings
└── styles/           # CSS modules and component styling
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🎨 Features in Detail

### Authentication & Security
- **JWT token authentication** - Secure user sessions
- **Protected routes** - Admin-only areas secured
- **Role-based access** - Different permissions for users and admins
- **Context-based state** - Global authentication management

### Shopping Features  
- **Product catalog** - Infinite scrolling with multi-speed animated columns
- **Shopping cart** - Persistent across sessions
- **Wishlist** - Save favorite items
- **Checkout flow** - Multi-step order placement
- **Order history** - Track past purchases

### Admin Panel
- **Product management** - Full CRUD for inventory
- **Drag & drop** - Reorder products easily
- **Image upload** - Manage product photos
- **Category management** - Organize product catalog
- **Order management** - Process and fulfill orders
- **User management** - View customer accounts

## 🎬 Infinite Scrolling Catalog Animation

The catalog features a sophisticated infinite scrolling animation system that creates an immersive browsing experience with three columns moving at different speeds and directions.

### Core Features

#### Multi-Speed Column Animation
- **Left column**: Speed 0.5, direction "up"
- **Middle column**: Speed 1.2, direction "down"  
- **Right column**: Speed 0.8, direction "up"
- Smooth 60fps animations using `requestAnimationFrame` for optimal performance

#### Teleport Mechanism
- Seamless looping where cards appear simultaneously at top/bottom
- Direction-aware teleportation with proper buffer management
- No visual artifacts during transitions
- Creates the illusion of endless content

#### Interactive Controls
- **Pause on Hover**: All columns pause when hovered over
- **Smooth Resume**: Seamless continuation when cursor moves away
- **Independent Control**: Each column can be controlled independently

#### Responsive Adaptation
- **Mobile** (< 768px): Slower speeds, single direction for better performance
- **Tablet** (768px - 1024px): Medium speeds, mixed directions
- **Desktop** (> 1024px): Full speed variety with all animation features

### Technical Implementation

#### Backend Support
- `/products/chunked` endpoint with pagination support
- Environment variable configuration (no hardcoded URLs)
- Direction-aware sorting for seamless teleport functionality

#### Frontend Components
- **`useInfiniteScroll`** hook: Handles chunked loading efficiently
- **`ScrollContainer`**: Intersection observer for lazy loading
- **`useColumnAnimation`** hook: Smooth animation management
- **`AnimatedColumn`** component: Teleport logic and column rendering
- **`useResponsiveAnimation`** hook: Device adaptation and speed adjustment

#### Performance Optimizations
- Memory management with cleanup mechanisms
- Delta time clamping to prevent animation jumps
- Error handling with graceful degradation
- Loading states with skeleton animations
- Column balancing for insufficient products

#### User Experience
- Smooth 60fps scrolling without stuttering
- Visual balance with cards distributed evenly across columns
- Working product links and wishlist buttons
- Mobile-friendly adapted speeds and layouts
- Infinite loop with seamless teleportation

The catalog provides an engaging infinite scrolling experience that showcases products dynamically while maintaining all existing functionality and adapting beautifully to different screen sizes.

## 📱 Responsive Design

Fully responsive with breakpoints:
- **Mobile**: < 768px (optimized for touch)
- **Tablet**: 768px - 1024px (comfortable browsing)
- **Desktop**: > 1024px (full feature set)

## 🌐 Deployment

Deployed on **Netlify** with:
- Automatic deployments on git push
- Global CDN for fast loading
- SSL certificate included
- Environment variable management

## 🎓 Project Origin

Originally developed as a **university diploma project** in Ukraine to demonstrate:
- Full-stack development capabilities
- Modern React patterns and best practices
- Complete e-commerce functionality
- Production-ready deployment

The project has since evolved into a showcase of enterprise-level frontend development that could power a real online store.

## 👨‍💻 Author

**Konstantin Kunak** - Full-stack developer and university student in Ukraine

Built completely from scratch with no templates or skeletons - every component, every line of code, every integration written from the ground up.

---

⭐ **Star this repo if you found it helpful!**
