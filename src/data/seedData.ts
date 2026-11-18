import type {
  InvestmentSetting,
  OpportunityCategory,
  Product,
  ProductCategory,
  WebsiteSettings,
} from '../types';

export const HERO_BANNER_IMAGE =
  '/src/assets/images/hero_fmcg_pan_india_clean_1794985179366.jpg';
export const LOGISTICS_IMAGE =
  '/src/assets/images/about_distribution_logistics_1794985158281.jpg';
export const STAPLES_OILS_IMAGE =
  '/src/assets/images/cat_staples_oils_1794985156022.jpg';
export const SPICES_TEA_IMAGE =
  '/src/assets/images/cat_spices_tea_clean_1794985179370.jpg';
export const DAIRY_MEALS_IMAGE =
  '/src/assets/images/cat_dairy_meals_clean_1794985180239.jpg';

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  id: 'corporate',
  companyName: 'INDEPENDENCE FMCG',
  tagline: 'KAN KAN MEIN SWAAD! KAN KAN MEIN BHARAT!',
  heroHeading: 'INDEPENDENCE FMCG',
  heroSubheading:
    'Build your FMCG business with Independence. Explore structured Dealership, C&F Agency, Super Stockist, and Distributorship opportunities across India’s food and beverage market.',
  heroBannerUrl: HERO_BANNER_IMAGE,
  aboutIntro:
    'INDEPENDENCE FMCG operates in the Food & Beverage Services sector with a focus on everyday household staples, culinary essentials, packaged nutrition, and regional distribution partnerships across India. All corporate statements and product specifications remain configurable and subject to management verification prior to commercial rollout.',
  vision:
    'To establish a dependable Pan-India food and beverage distribution network reaching urban metros, tier-2/3 towns, and rural retail counters with consistent product quality and transparent partner governance.',
  mission:
    'To empower regional entrepreneurs, warehouse operators, and wholesale distributors through structured territory allocation, timely supply chain execution, and ethical commercial terms.',
  objectives:
    '1. Expand verified retail reach across all 28 States and 8 Union Territories.\n2. Maintain standardized food safety, packaging hygiene, and batch traceability.\n3. Enable transparent digital onboarding, KYC verification, and live application tracking for channel partners.\n4. Build multi-tier supply efficiency connecting C&F hubs, Super Stockists, Distributors, and Dealers.',
  qualityCommitment:
    'Every product line is structured around strict FSSAI compliance guidelines, hygienic packaging standards, batch-level quality checks, and temperature-appropriate warehousing practices.',
  distributionStrategy:
    'Our four-tier Pan-India distribution architecture bridges State-level C&F Agencies and regional Super Stockists with district-level Distributors and retail Dealership counters for disciplined market coverage without territory overlap.',
  contactEmail: 'Configure Official Email in Admin Dashboard',
  contactPhone: 'Configure Official Helpline in Admin Dashboard',
  whatsappNumber: '',
  officeAddress: 'Configure Registered Corporate Office Address in Admin Dashboard',
  faqs: [
    {
      category: 'General',
      question: 'What business opportunities are offered by INDEPENDENCE FMCG?',
      answer:
        'INDEPENDENCE FMCG offers four structured channel partner opportunities across India: FMCG Dealership, C&F Agency (Carrying & Forwarding), Super Stockist, and FMCG Distributorship.',
    },
    {
      category: 'Territory',
      question: 'How is territory availability checked before applying?',
      answer:
        'During application, you select your State or Union Territory, District, City, and PIN Code. Our system checks configured territory status and checks for duplicate active applications in the same category.',
    },
    {
      category: 'Investment',
      question: 'Are investment figures fixed or indicative?',
      answer:
        'All investment amounts displayed prior to formal agreement execution are indicative estimates configurable by the administration. Approved commercial terms are finalized only after territory evaluation and management review.',
    },
    {
      category: 'Tracking',
      question: 'How can I track my submitted application status?',
      answer:
        'Use the Application Tracking Portal with your unique Application Reference ID and registered 10-digit mobile number to verify identity and view real-time stage updates, pending documents, and official remarks.',
    },
  ],
};

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'packaged-food',
    name: 'Packaged Food',
    slug: 'packaged-food',
    description: 'Everyday culinary packs, vermicelli, instant mixes, and sealed pantry goods.',
    imageUrl: STAPLES_OILS_IMAGE,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    slug: 'grocery-staples',
    description: 'Aged basmati rice, stone-ground whole wheat atta, pulses, and daily grains.',
    imageUrl: STAPLES_OILS_IMAGE,
    sortOrder: 2,
    active: true,
  },
  {
    id: 'edible-oils',
    name: 'Edible Oils',
    slug: 'edible-oils',
    description: 'Kachi ghani mustard oil, filtered groundnut oil, and refined cooking oils.',
    imageUrl: STAPLES_OILS_IMAGE,
    sortOrder: 3,
    active: true,
  },
  {
    id: 'snacks-namkeen',
    name: 'Snacks & Namkeen',
    slug: 'snacks-namkeen',
    description: 'Traditional Indian bhujia, savory mixtures, roasted bites, and tea-time snacks.',
    imageUrl: SPICES_TEA_IMAGE,
    sortOrder: 4,
    active: true,
  },
  {
    id: 'tea-beverages',
    name: 'Tea & Beverages',
    slug: 'tea-beverages',
    description: 'Assam CTC blends, masala chai packs, and refreshing family beverage lines.',
    imageUrl: SPICES_TEA_IMAGE,
    sortOrder: 5,
    active: true,
  },
  {
    id: 'dairy-products',
    name: 'Dairy Products',
    slug: 'dairy-products',
    description: 'Pure cow ghee, UHT milk cartons, cultured buttermilk, and dairy essentials.',
    imageUrl: DAIRY_MEALS_IMAGE,
    sortOrder: 6,
    active: true,
  },
  {
    id: 'spices-masala',
    name: 'Spices & Masala',
    slug: 'spices-masala',
    description: 'Single-origin turmeric, red chili, whole cardamom, and aromatic blended masalas.',
    imageUrl: SPICES_TEA_IMAGE,
    sortOrder: 7,
    active: true,
  },
  {
    id: 'ready-to-eat',
    name: 'Ready-to-Eat Products',
    slug: 'ready-to-eat',
    description: 'Retort-packed Indian meals, gravies, and quick convenience food solutions.',
    imageUrl: DAIRY_MEALS_IMAGE,
    sortOrder: 8,
    active: true,
  },
  {
    id: 'daily-essentials',
    name: 'Daily Essentials',
    slug: 'daily-essentials',
    description: 'High-velocity household food and kitchen replenishment essentials.',
    imageUrl: HERO_BANNER_IMAGE,
    sortOrder: 9,
    active: true,
  },
];

export const DEFAULT_SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-sharbati-atta',
    name: 'Whole Wheat Sharbati Atta (Sample SKU)',
    categoryId: 'grocery-staples',
    categoryName: 'Grocery & Staples',
    description:
      'Configurable sample SKU: Stone-ground 100% whole wheat flour crafted for soft rotis and daily household consumption.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '5 kg · 10 kg · 25 kg',
    imageUrl: STAPLES_OILS_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-basmati-rice',
    name: 'Royal Long Grain Basmati Rice (Sample SKU)',
    categoryId: 'grocery-staples',
    categoryName: 'Grocery & Staples',
    description:
      'Configurable sample SKU: Aged aromatic long-grain basmati rice suited for retail and HoReCa distribution.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '1 kg · 5 kg · 25 kg',
    imageUrl: STAPLES_OILS_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-mustard-oil',
    name: 'Kachi Ghani Mustard Oil (Sample SKU)',
    categoryId: 'edible-oils',
    categoryName: 'Edible Oils',
    description:
      'Configurable sample SKU: Cold-pressed pure mustard oil bottled in tamper-evident retail and bulk packs.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '500 ml · 1 L · 5 L Jar',
    imageUrl: STAPLES_OILS_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-spices-trio',
    name: 'Authentic Haldi, Mirch & Garam Masala (Sample SKU)',
    categoryId: 'spices-masala',
    categoryName: 'Spices & Masala',
    description:
      'Configurable sample SKU: Hygienically ground Indian spices retaining natural volatile oils and aroma.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '100 g · 200 g · 500 g',
    imageUrl: SPICES_TEA_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-assam-tea',
    name: 'Assam Leaf & CTC Gold Tea (Sample SKU)',
    categoryId: 'tea-beverages',
    categoryName: 'Tea & Beverages',
    description:
      'Configurable sample SKU: Strong brisk Assam CTC and aromatic masala chai blends for Pan-India retail shelves.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '250 g · 500 g · 1 kg',
    imageUrl: SPICES_TEA_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-namkeen-mix',
    name: 'Traditional Bikaneri Bhujia & Mixture (Sample SKU)',
    categoryId: 'snacks-namkeen',
    categoryName: 'Snacks & Namkeen',
    description:
      'Configurable sample SKU: Nitrogen-flushed crisp Indian savory snacks built for fast kirana and modern-trade turnover.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '50 g · 200 g · 400 g',
    imageUrl: SPICES_TEA_IMAGE,
    status: 'published',
    featured: false,
    isSample: true,
  },
  {
    id: 'sample-cow-ghee',
    name: 'Pure Cow Ghee & UHT Milk (Sample SKU)',
    categoryId: 'dairy-products',
    categoryName: 'Dairy Products',
    description:
      'Configurable sample SKU: Granular aromatic cow ghee and shelf-stable UHT milk cartons for daily nutrition.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '250 ml · 500 ml · 1 L',
    imageUrl: DAIRY_MEALS_IMAGE,
    status: 'published',
    featured: true,
    isSample: true,
  },
  {
    id: 'sample-ready-meals',
    name: 'Ready-to-Eat Indian Curry Meals (Sample SKU)',
    categoryId: 'ready-to-eat',
    categoryName: 'Ready-to-Eat Products',
    description:
      'Configurable sample SKU: Convenient heat-and-eat Indian culinary meal boxes with zero added preservatives.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '280 g · 350 g',
    imageUrl: DAIRY_MEALS_IMAGE,
    status: 'published',
    featured: false,
    isSample: true,
  },
  {
    id: 'sample-packaged-vermicelli',
    name: 'Roasted Vermicelli & Culinary Packs (Sample SKU)',
    categoryId: 'packaged-food',
    categoryName: 'Packaged Food',
    description:
      'Configurable sample SKU: Hygienic packaged pantry food lines engineered for everyday Indian kitchens.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: '200 g · 500 g',
    imageUrl: HERO_BANNER_IMAGE,
    status: 'published',
    featured: false,
    isSample: true,
  },
  {
    id: 'sample-daily-essentials',
    name: 'Household Kitchen Essentials Pack (Sample SKU)',
    categoryId: 'daily-essentials',
    categoryName: 'Daily Essentials',
    description:
      'Configurable sample SKU: High-frequency everyday replenishment staples tailored for neighbourhood retail stores.',
    productInfo: 'Sample Catalogue Entry · Replace with verified SKU specifications via Admin Dashboard.',
    packSizes: 'Retail Assortment',
    imageUrl: HERO_BANNER_IMAGE,
    status: 'published',
    featured: false,
    isSample: true,
  },
];

export const DEFAULT_INVESTMENT_SETTINGS: Record<OpportunityCategory, InvestmentSetting> = {
  dealership: {
    id: 'dealership',
    opportunityType: 'dealership',
    title: 'FMCG Dealership',
    summary:
      'Direct retail-facing or sub-wholesale dealership opportunity serving local markets, neighbourhood supermarkets, and high-footfall commercial zones.',
    initialInvestment: 'Configurable in Admin (Subject to city tier & shop size)',
    securityDeposit: 'Configurable in Admin (Refundable as per agreement terms)',
    initialStock: 'Configurable in Admin (Based on initial SKU assortment)',
    infrastructure: 'Dedicated commercial shop / showroom space in active market area',
    warehouse: 'Back-room storage (200–500 sq. ft. indicative)',
    transportation: 'Local delivery support (two-wheeler / light commercial vehicle)',
    otherCharges: 'Billing software, FSSAI registration, and GST compliance as applicable',
    termsLabel: 'Subject to Territory Assessment',
    disclaimer:
      'Notice: All figures and resource norms shown are configurable placeholders pending formal commercial approval. INDEPENDENCE FMCG does not guarantee fixed margins, income, or returns prior to signed agreement execution.',
    eligibilityPoints: [
      'Indian citizen or registered proprietorship/partnership/company entity',
      'Commercial shop availability (owned or valid registered lease)',
      'Valid PAN Card and applicable local trade / FSSAI compliance',
      'Active working capital readiness and local market familiarity',
    ],
    requiredDocuments: [
      'Identity Proof (Aadhaar / Voter ID / Passport)',
      'Address Proof',
      'PAN Card',
      'GST Registration (if applicable)',
      'Business Registration Documents (if applicable)',
      'Shop Ownership / Rent Agreement Proof',
    ],
  },
  cf_agency: {
    id: 'cf_agency',
    opportunityType: 'cf_agency',
    title: 'C&F Agency (Carrying & Forwarding)',
    summary:
      'State or regional logistics hub managing bulk inward stock receipt, scientific warehousing, order invoicing, and primary dispatch to Super Stockists and Distributors.',
    initialInvestment: 'Configurable in Admin (Hub capacity dependent)',
    securityDeposit: 'Configurable in Admin (Bank guarantee / security terms)',
    initialStock: 'Consignment / hub buffer norms defined in formal C&F contract',
    infrastructure: 'Computerized ERP/billing desk, CCTV surveillance, fire safety compliance',
    warehouse: '3,000 – 10,000+ sq. ft. RCC covered godown with dock access',
    transportation: 'Heavy & medium commercial transport tie-ups for regional dispatch',
    otherCharges: 'Material handling equipment, manpower, and insurance coverage',
    termsLabel: 'Subject to Territory Assessment',
    disclaimer:
      'Notice: C&F commercial terms, handling structures, and deposit requirements are strictly governed by the executed C&F Agreement and verified warehouse audit.',
    eligibilityPoints: [
      'Registered business entity with valid GST and PAN',
      'Proven warehousing, inventory management, and logistics track record',
      'All-weather covered warehouse with loading/unloading bays',
      'Financial capacity to sustain regional dispatch operations',
    ],
    requiredDocuments: [
      'Authorized Signatory Identity & Address Proof',
      'Company PAN & Certificate of Incorporation / Partnership Deed',
      'GST Registration Certificate',
      'Warehouse Ownership / Lease Agreement & Floor Plan',
      'Logistics & Fleet Capability Statement',
    ],
  },
  super_stockist: {
    id: 'super_stockist',
    opportunityType: 'super_stockist',
    title: 'Super Stockist',
    summary:
      'State-zone or multi-district stockist anchoring inventory availability and supplying appointed FMCG Distributors across assigned regional clusters.',
    initialInvestment: 'Configurable in Admin (Zone scale dependent)',
    securityDeposit: 'Configurable in Admin (As per regional agreement)',
    initialStock: 'Configurable in Admin (Multi-category opening inventory)',
    infrastructure: 'Dedicated billing office, inventory tracking system, sales coordination team',
    warehouse: '1,500 – 4,000+ sq. ft. clean, pest-controlled FMCG godown',
    transportation: 'Dedicated goods carrier vehicles for inter-district distributor supply',
    otherCharges: 'FSSAI central/state license, GST, and transit insurance',
    termsLabel: 'Subject to Territory Assessment',
    disclaimer:
      'Notice: Territory boundaries, stock norms, and approved commercial terms are issued exclusively in writing upon successful Management Review.',
    eligibilityPoints: [
      'Established FMCG wholesale or multi-district distribution experience',
      'Existing network of sub-distributors or wholesale buyers',
      'Compliant godown facility and transport readiness',
      'Valid GST, PAN, and sound financial standing',
    ],
    requiredDocuments: [
      'Identity & Address Proof',
      'PAN & GST Certificate',
      'Business Registration & Financial Profile',
      'Godown Ownership / Lease Documents',
      'Existing Retailer / Distributor Network Summary',
    ],
  },
  distributorship: {
    id: 'distributorship',
    opportunityType: 'distributorship',
    title: 'FMCG Distributorship',
    summary:
      'District or town-level primary distribution partner servicing kirana stores, supermarkets, and retail outlets through regular beat coverage.',
    initialInvestment: 'Configurable in Admin (District / beat size dependent)',
    securityDeposit: 'Configurable in Admin (As per commercial policy)',
    initialStock: 'Configurable in Admin (Core fast-moving SKU assortment)',
    infrastructure: 'Office desk, order-taking setup, and beat sales staff support',
    warehouse: '500 – 1,500 sq. ft. dry, hygienic storage godown',
    transportation: 'Delivery van / tempo / e-rickshaw for retail beat replenishment',
    otherCharges: 'GST registration (where applicable) and FSSAI retail/wholesale license',
    termsLabel: 'Subject to Territory Assessment',
    disclaimer:
      'Notice: Estimated parameters shown here are configurable by INDEPENDENCE FMCG administration and do not constitute an offer of guaranteed earnings or profits.',
    eligibilityPoints: [
      'Active FMCG/grocery distribution experience or strong local retail relationships',
      'Ready godown/shop infrastructure and last-mile delivery vehicle',
      'Commitment to scheduled retail beat coverage',
      'Valid KYC, PAN, and applicable tax registrations',
    ],
    requiredDocuments: [
      'Identity Proof & Address Proof',
      'PAN Card',
      'GST Certificate (if applicable)',
      'Godown / Shop Documents',
      'Existing Business Proof (if applicable)',
    ],
  },
};
