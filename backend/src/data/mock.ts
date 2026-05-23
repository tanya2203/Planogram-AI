export const FA_COMPANY_ID = '233932'
export const TENANT_ID = 'tenant_ub_001'

export const TENANTS = [
  {
    id: TENANT_ID,
    name: 'United Breweries',
    slug: 'united-breweries',
    faCompanyId: FA_COMPANY_ID,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
]

export const ASSETS = [
  {
    id: 'asset_001',
    tenantId: TENANT_ID,
    faAssetDefinitionId: '22253',
    faEquipmentId: '1149302',
    faLocationId: '189,189,124',
    faSerialNumber: 'IN0540528109',
    name: 'Single Door Cooler #IN0540528109',
    type: 'SINGLE_DOOR_COOLER',
    widthCm: 60,
    heightCm: 165,
    depthCm: 60,
    shelfCount: 4,
    rackCount: 1,
    region: 'North',
    outletId: '124',
    iconUrl: null,
    isActive: true,
    createdAt: new Date('2025-05-19')
  },
  {
    id: 'asset_002',
    tenantId: TENANT_ID,
    faAssetDefinitionId: '22253',
    faEquipmentId: '1149303',
    faLocationId: '189,189,255',
    faSerialNumber: 'IN0540464341',
    name: 'Single Door Cooler #IN0540464341',
    type: 'SINGLE_DOOR_COOLER',
    widthCm: 60,
    heightCm: 165,
    depthCm: 60,
    shelfCount: 4,
    rackCount: 1,
    region: 'North',
    outletId: '255',
    iconUrl: null,
    isActive: true,
    createdAt: new Date('2025-05-19')
  },
  {
    id: 'asset_003',
    tenantId: TENANT_ID,
    faAssetDefinitionId: '22254',
    faEquipmentId: '1149304',
    faLocationId: '189,188,291',
    faSerialNumber: 'FA-22254-291',
    name: 'Double Door Cooler — Location 291',
    type: 'DOUBLE_DOOR_COOLER',
    widthCm: 120,
    heightCm: 180,
    depthCm: 70,
    shelfCount: 5,
    rackCount: 2,
    region: 'West',
    outletId: '291',
    iconUrl: null,
    isActive: true,
    createdAt: new Date('2025-05-19')
  },
  {
    id: 'asset_004',
    tenantId: TENANT_ID,
    faAssetDefinitionId: '22253',
    faEquipmentId: '1149305',
    faLocationId: '189,188,382',
    faSerialNumber: '31352220500038',
    name: 'Single Door Cooler #31352220500038',
    type: 'SINGLE_DOOR_COOLER',
    widthCm: 60,
    heightCm: 165,
    depthCm: 60,
    shelfCount: 4,
    rackCount: 1,
    region: 'West',
    outletId: '382',
    iconUrl: null,
    isActive: true,
    createdAt: new Date('2025-05-19')
  },
  {
    id: 'asset_005',
    tenantId: TENANT_ID,
    faAssetDefinitionId: '22254',
    faEquipmentId: '1149313',
    faLocationId: '189,188,330',
    faSerialNumber: '31907240501254',
    name: 'Double Door Cooler — Location 330',
    type: 'DOUBLE_DOOR_COOLER',
    widthCm: 120,
    heightCm: 180,
    depthCm: 70,
    shelfCount: 5,
    rackCount: 2,
    region: 'West',
    outletId: '330',
    iconUrl: null,
    isActive: true,
    createdAt: new Date('2025-05-19')
  }
]

export const SKUS = [
  {
    id: 'sku_001', faSkuId: '9511445', faErpCode: 'KFU650',
    tenantId: TENANT_ID, name: 'KF Ultra 650 ml',
    brand: 'Kingfisher Ultra', category: 'Beer', unit: 'Bottle',
    widthCm: 7, heightCm: 22, depthCm: 7,
    minFacings: 2, maxFacings: 8, defaultFacings: 3,
    mrp: 180, isNewProduct: false, isTopSelling: true,
    isFocused: false, tier: 'MANDATORY', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_002', faSkuId: '9511446', faErpCode: 'KFU330',
    tenantId: TENANT_ID, name: 'KF Ultra 330 ml',
    brand: 'Kingfisher Ultra', category: 'Beer', unit: 'Bottle',
    widthCm: 5, heightCm: 16, depthCm: 5,
    minFacings: 2, maxFacings: 10, defaultFacings: 4,
    mrp: 110, isNewProduct: false, isTopSelling: true,
    isFocused: false, tier: 'MANDATORY', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_003', faSkuId: '9511447', faErpCode: 'KFU500',
    tenantId: TENANT_ID, name: 'KF Ultra 500 ml Can',
    brand: 'Kingfisher Ultra', category: 'Beer', unit: 'Can',
    widthCm: 6, heightCm: 13, depthCm: 6,
    minFacings: 1, maxFacings: 6, defaultFacings: 2,
    mrp: 150, isNewProduct: false, isTopSelling: false,
    isFocused: true, tier: 'PRIORITY', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_004', faSkuId: '9511448', faErpCode: 'KFUM650',
    tenantId: TENANT_ID, name: 'KF Ultra Max 650ml',
    brand: 'Kingfisher Ultra Max', category: 'Beer', unit: 'Bottle',
    widthCm: 7, heightCm: 22, depthCm: 7,
    minFacings: 1, maxFacings: 6, defaultFacings: 2,
    mrp: 200, isNewProduct: false, isTopSelling: false,
    isFocused: false, tier: 'STANDARD', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_005', faSkuId: '9511449', faErpCode: 'KFUM330',
    tenantId: TENANT_ID, name: 'KF Ultra Max 330ml',
    brand: 'Kingfisher Ultra Max', category: 'Beer', unit: 'Bottle',
    widthCm: 5, heightCm: 16, depthCm: 5,
    minFacings: 1, maxFacings: 8, defaultFacings: 3,
    mrp: 130, isNewProduct: false, isTopSelling: false,
    isFocused: false, tier: 'STANDARD', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_006', faSkuId: '9511451', faErpCode: 'HKN650',
    tenantId: TENANT_ID, name: 'Heineken 650 ml',
    brand: 'Heineken', category: 'Premium Beer', unit: 'Bottle',
    widthCm: 7, heightCm: 22, depthCm: 7,
    minFacings: 2, maxFacings: 6, defaultFacings: 3,
    mrp: 220, isNewProduct: false, isTopSelling: true,
    isFocused: true, tier: 'EYE_LEVEL_HERO', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_007', faSkuId: '9511452', faErpCode: 'HKN330',
    tenantId: TENANT_ID, name: 'Heineken 330 ml',
    brand: 'Heineken', category: 'Premium Beer', unit: 'Bottle',
    widthCm: 5, heightCm: 16, depthCm: 5,
    minFacings: 1, maxFacings: 8, defaultFacings: 3,
    mrp: 140, isNewProduct: false, isTopSelling: false,
    isFocused: true, tier: 'PRIORITY', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_008', faSkuId: '9511453', faErpCode: 'HKN500',
    tenantId: TENANT_ID, name: 'Heineken 500 ml Can',
    brand: 'Heineken', category: 'Premium Beer', unit: 'Can',
    widthCm: 6, heightCm: 13, depthCm: 6,
    minFacings: 1, maxFacings: 4, defaultFacings: 2,
    mrp: 170, isNewProduct: false, isTopSelling: false,
    isFocused: false, tier: 'STANDARD', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_009', faSkuId: '9636663', faErpCode: 'AG330',
    tenantId: TENANT_ID, name: 'Amstel Grande 330ml',
    brand: 'Amstel', category: 'Premium Beer', unit: 'Bottle',
    widthCm: 5, heightCm: 16, depthCm: 5,
    minFacings: 1, maxFacings: 6, defaultFacings: 2,
    mrp: 130, isNewProduct: true, isTopSelling: false,
    isFocused: false, tier: 'NEW_LAUNCH', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_010', faSkuId: '9636664', faErpCode: 'AG500',
    tenantId: TENANT_ID, name: 'Amstel Grande 500ml',
    brand: 'Amstel', category: 'Premium Beer', unit: 'Bottle',
    widthCm: 6, heightCm: 13, depthCm: 6,
    minFacings: 1, maxFacings: 4, defaultFacings: 2,
    mrp: 160, isNewProduct: true, isTopSelling: false,
    isFocused: false, tier: 'NEW_LAUNCH', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_011', faSkuId: '9636665', faErpCode: 'AG650',
    tenantId: TENANT_ID, name: 'Amstel Grande 650ml',
    brand: 'Amstel', category: 'Premium Beer', unit: 'Bottle',
    widthCm: 7, heightCm: 22, depthCm: 7,
    minFacings: 1, maxFacings: 4, defaultFacings: 2,
    mrp: 200, isNewProduct: true, isTopSelling: false,
    isFocused: false, tier: 'NEW_LAUNCH', packshotUrl: null, isActive: true
  },
  {
    id: 'sku_012', faSkuId: '9511454', faErpCode: 'KFS600',
    tenantId: TENANT_ID, name: 'KFS 650 ml',
    brand: 'Kingfisher Strong', category: 'Beer', unit: 'Bottle',
    widthCm: 7, heightCm: 22, depthCm: 7,
    minFacings: 2, maxFacings: 8, defaultFacings: 3,
    mrp: 160, isNewProduct: false, isTopSelling: false,
    isFocused: true, tier: 'MANDATORY', packshotUrl: null, isActive: true
  }
]

export const PLANOGRAMS = [
  {
    id: 'pg_001', tenantId: TENANT_ID, assetId: 'asset_001',
    name: 'Q2 Single Door — Location 124',
    status: 'ACTIVE', outletType: 'DMart', region: 'North',
    quarter: 'Q2-2025', createdByFaId: 'fa_user_001',
    approvalStage: 3, complianceScore: 94, utilizationPct: 87,
    sosScore: 67, revenueIndex: 1.24, idealImageUrl: null,
    createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-15')
  },
  {
    id: 'pg_002', tenantId: TENANT_ID, assetId: 'asset_002',
    name: 'Q2 Single Door — Location 255',
    status: 'DRAFT', outletType: 'Reliance Smart', region: 'North',
    quarter: 'Q2-2025', createdByFaId: 'fa_user_001',
    approvalStage: 0, complianceScore: 78, utilizationPct: 72,
    sosScore: 54, revenueIndex: 1.1, idealImageUrl: null,
    createdAt: new Date('2025-03-10'), updatedAt: new Date('2025-03-10')
  },
  {
    id: 'pg_003', tenantId: TENANT_ID, assetId: 'asset_003',
    name: 'Q2 Double Door — Location 291',
    status: 'PENDING', outletType: "Spencer's", region: 'West',
    quarter: 'Q2-2025', createdByFaId: 'fa_user_002',
    approvalStage: 1, complianceScore: 88, utilizationPct: 91,
    sosScore: 71, revenueIndex: 1.18, idealImageUrl: null,
    createdAt: new Date('2025-03-12'), updatedAt: new Date('2025-03-14')
  },
  {
    id: 'pg_004', tenantId: TENANT_ID, assetId: 'asset_004',
    name: 'Q2 Single Door — Location 382',
    status: 'DRAFT', outletType: 'DMart', region: 'West',
    quarter: 'Q2-2025', createdByFaId: 'fa_user_001',
    approvalStage: 0, complianceScore: 82, utilizationPct: 76,
    sosScore: 58, revenueIndex: 1.05, idealImageUrl: null,
    createdAt: new Date('2025-04-01'), updatedAt: new Date('2025-04-01')
  },
  {
    id: 'pg_005', tenantId: TENANT_ID, assetId: 'asset_005',
    name: 'Q2 Double Door — Location 330',
    status: 'ACTIVE', outletType: 'Big Bazaar', region: 'West',
    quarter: 'Q2-2025', createdByFaId: 'fa_user_002',
    approvalStage: 3, complianceScore: 91, utilizationPct: 88,
    sosScore: 72, revenueIndex: 1.31, idealImageUrl: null,
    createdAt: new Date('2025-02-15'), updatedAt: new Date('2025-03-01')
  }
]

export const ANALYTICS_SUMMARY = {
  tenantId: TENANT_ID,
  totalPlanograms: 5,
  activePlanograms: 2,
  draftPlanograms: 2,
  pendingPlanograms: 1,
  avgComplianceScore: 86.8,
  avgSosScore: 64.4,
  avgRevenueIndex: 1.18,
  avgUtilizationPct: 82.8,
  byRegion: [
    { region: 'North', planograms: 2, avgCompliance: 86, avgSos: 60 },
    { region: 'West', planograms: 3, avgCompliance: 87, avgSos: 67 }
  ],
  trends: [
    { month: 'Jan', compliance: 81, sos: 58, utilization: 74 },
    { month: 'Feb', compliance: 84, sos: 61, utilization: 78 },
    { month: 'Mar', compliance: 87, sos: 64, utilization: 82 },
    { month: 'Apr', compliance: 85, sos: 62, utilization: 80 },
    { month: 'May', compliance: 87, sos: 65, utilization: 83 }
  ]
}
