// Local copy of breed data for frontend use
// This mirrors the backend data/breed_info.json

const breedData = {
  cattle: {
    gir: {
      id: "gir",
      name: "Gir",
      nameHindi: "गिर",
      type: "cattle",
      nativeState: ["Gujarat"],
      nativeRegion: "Gir forests of Gujarat",
      characteristics: {
        bodyColor: "Red to spotted red and white",
        hornShape: "Curved backwards",
        earType: "Long and pendulous",
        bodySize: "Large",
        humpSize: "Well-developed",
        dewlap: "Large"
      },
      productivity: {
        milkYieldPerDay: "6-12 liters",
        lactationYield: "1800-2200 liters",
        fatContent: "4.5-5.0%",
        lactationPeriod: "300 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "14-16 months"
      },
      sustainability: {
        carbonScore: 85,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "High",
        feedEfficiency: "High (thrives on low-quality fodder)",
        climateAdaptability: "Hot and humid"
      },
      economicValue: {
        purchaseCost: "₹80,000 - ₹2,00,000",
        maintenanceCost: "Low",
        marketDemand: "Very High"
      },
      bestFor: ["Dairy farming", "Crossbreeding programs", "Organic farming"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "National Programme for Bovine Breeding"
      ],
      funFact: "Gir cattle were exported to Brazil in the 1960s and developed into the famous Gir Leiteiro dairy breed."
    },
    sahiwal: {
      id: "sahiwal",
      name: "Sahiwal",
      nameHindi: "साहीवाल",
      type: "cattle",
      nativeState: ["Punjab", "Haryana", "Rajasthan"],
      nativeRegion: "Montgomery district (now in Pakistan)",
      characteristics: {
        bodyColor: "Reddish brown to dun",
        hornShape: "Short and stumpy",
        earType: "Medium, slightly drooping",
        bodySize: "Medium to large",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "8-14 liters",
        lactationYield: "2000-2500 liters",
        fatContent: "4.3-4.8%",
        lactationPeriod: "305 days",
        ageAtFirstCalving: "32-36 months",
        calvingInterval: "13-15 months"
      },
      sustainability: {
        carbonScore: 82,
        carbonFootprint: "Low",
        heatTolerance: "Very Good",
        diseaseResistance: "High",
        feedEfficiency: "High",
        climateAdaptability: "Hot and semi-arid"
      },
      economicValue: {
        purchaseCost: "₹70,000 - ₹1,50,000",
        maintenanceCost: "Low to Medium",
        marketDemand: "High"
      },
      bestFor: ["Dairy farming", "Dual purpose (milk + draft)", "Tropical regions"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "National Kamdhenu Breeding Centre"
      ],
      funFact: "Sahiwal is known as the 'Montgomery' cattle and is the best dairy breed among Zebu cattle."
    },
    redSindhi: {
      id: "redSindhi",
      name: "Red Sindhi",
      nameHindi: "लाल सिंधी",
      type: "cattle",
      nativeState: ["Karnataka", "Tamil Nadu", "Kerala"],
      nativeRegion: "Sindh province (now in Pakistan)",
      characteristics: {
        bodyColor: "Deep red to dark brown",
        hornShape: "Medium, curved upward",
        earType: "Medium",
        bodySize: "Medium",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "6-10 liters",
        lactationYield: "1600-2000 liters",
        fatContent: "4.5-5.0%",
        lactationPeriod: "290 days",
        ageAtFirstCalving: "36-40 months",
        calvingInterval: "14-16 months"
      },
      sustainability: {
        carbonScore: 80,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "High",
        feedEfficiency: "High",
        climateAdaptability: "Hot and tropical"
      },
      economicValue: {
        purchaseCost: "₹50,000 - ₹1,20,000",
        maintenanceCost: "Low",
        marketDemand: "Medium to High"
      },
      bestFor: ["Dairy farming", "Crossbreeding", "Heat-stressed regions"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Indigenous Breed Conservation Programme"
      ],
      funFact: "Red Sindhi cattle have been exported to over 30 countries for improving local breeds."
    },
    tharparkar: {
      id: "tharparkar",
      name: "Tharparkar",
      nameHindi: "थारपारकर",
      type: "cattle",
      nativeState: ["Rajasthan", "Gujarat"],
      nativeRegion: "Thar desert region",
      characteristics: {
        bodyColor: "White to grey",
        hornShape: "Medium, lyre-shaped",
        earType: "Medium, alert",
        bodySize: "Medium to large",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "6-10 liters",
        lactationYield: "1800-2200 liters",
        fatContent: "4.3-4.8%",
        lactationPeriod: "300 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "14-16 months"
      },
      sustainability: {
        carbonScore: 88,
        carbonFootprint: "Very Low",
        heatTolerance: "Exceptional",
        diseaseResistance: "Very High",
        feedEfficiency: "Exceptional (desert adapted)",
        climateAdaptability: "Arid and semi-arid"
      },
      economicValue: {
        purchaseCost: "₹60,000 - ₹1,30,000",
        maintenanceCost: "Very Low",
        marketDemand: "High"
      },
      bestFor: ["Dual purpose", "Drought-prone areas", "Organic farming"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "ICAR Breed Conservation"
      ],
      funFact: "Tharparkar cattle can survive on minimal water and thorny shrubs in the harsh Thar desert."
    },
    kankrej: {
      id: "kankrej",
      name: "Kankrej",
      nameHindi: "कांकरेज",
      type: "cattle",
      nativeState: ["Gujarat", "Rajasthan"],
      nativeRegion: "Banaskantha district",
      characteristics: {
        bodyColor: "Silver-grey to iron-grey",
        hornShape: "Large, lyre-shaped",
        earType: "Large, pendulous",
        bodySize: "Very large",
        humpSize: "Well-developed",
        dewlap: "Large"
      },
      productivity: {
        milkYieldPerDay: "5-8 liters",
        lactationYield: "1500-2000 liters",
        fatContent: "4.2-4.6%",
        lactationPeriod: "280 days",
        ageAtFirstCalving: "40-48 months",
        calvingInterval: "16-18 months"
      },
      sustainability: {
        carbonScore: 78,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Hot and semi-arid"
      },
      economicValue: {
        purchaseCost: "₹80,000 - ₹2,00,000",
        maintenanceCost: "Medium",
        marketDemand: "High"
      },
      bestFor: ["Draft work", "Dairy", "Agricultural operations"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "State Breeding Programmes"
      ],
      funFact: "Kankrej bulls are famous for their fast, elegant trot and are used in traditional bullock races."
    },
    ongole: {
      id: "ongole",
      name: "Ongole",
      nameHindi: "ओंगोल",
      type: "cattle",
      nativeState: ["Andhra Pradesh"],
      nativeRegion: "Ongole district",
      characteristics: {
        bodyColor: "White to grey",
        hornShape: "Short and stumpy",
        earType: "Medium, drooping",
        bodySize: "Very large",
        humpSize: "Very large",
        dewlap: "Very large"
      },
      productivity: {
        milkYieldPerDay: "4-6 liters",
        lactationYield: "1200-1600 liters",
        fatContent: "4.0-4.5%",
        lactationPeriod: "270 days",
        ageAtFirstCalving: "42-48 months",
        calvingInterval: "16-20 months"
      },
      sustainability: {
        carbonScore: 75,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "Very High",
        feedEfficiency: "Good",
        climateAdaptability: "Hot and humid"
      },
      economicValue: {
        purchaseCost: "₹70,000 - ₹1,80,000",
        maintenanceCost: "Medium",
        marketDemand: "High"
      },
      bestFor: ["Draft work", "Meat production", "Crossbreeding"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Andhra Pradesh State Breeding Programme"
      ],
      funFact: "Ongole cattle genetic material was used to develop the American Brahman breed."
    },
    hariana: {
      id: "hariana",
      name: "Hariana",
      nameHindi: "हरियाणा",
      type: "cattle",
      nativeState: ["Haryana", "Delhi", "Uttar Pradesh"],
      nativeRegion: "Rohtak, Hisar districts",
      characteristics: {
        bodyColor: "White to grey",
        hornShape: "Short, blunt",
        earType: "Small, horizontal",
        bodySize: "Large",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "4-8 liters",
        lactationYield: "1200-1800 liters",
        fatContent: "4.0-4.5%",
        lactationPeriod: "280 days",
        ageAtFirstCalving: "38-44 months",
        calvingInterval: "15-17 months"
      },
      sustainability: {
        carbonScore: 76,
        carbonFootprint: "Low",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Semi-arid to subtropical"
      },
      economicValue: {
        purchaseCost: "₹50,000 - ₹1,20,000",
        maintenanceCost: "Low",
        marketDemand: "Medium"
      },
      bestFor: ["Dual purpose", "Draft work", "Dairy"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Haryana State Breed Conservation"
      ],
      funFact: "Hariana breed is known for its excellent walking ability and can cover long distances."
    },
    rathi: {
      id: "rathi",
      name: "Rathi",
      nameHindi: "राठी",
      type: "cattle",
      nativeState: ["Rajasthan"],
      nativeRegion: "Bikaner, Ganganagar districts",
      characteristics: {
        bodyColor: "Brown with white patches",
        hornShape: "Medium, curved",
        earType: "Medium",
        bodySize: "Medium",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "6-10 liters",
        lactationYield: "1600-2200 liters",
        fatContent: "4.3-4.8%",
        lactationPeriod: "290 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "14-16 months"
      },
      sustainability: {
        carbonScore: 84,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "High",
        feedEfficiency: "High",
        climateAdaptability: "Hot and arid"
      },
      economicValue: {
        purchaseCost: "₹60,000 - ₹1,40,000",
        maintenanceCost: "Low",
        marketDemand: "High"
      },
      bestFor: ["Dairy farming", "Arid regions", "Dual purpose"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Rajasthan State Dairy Programme"
      ],
      funFact: "Rathi cattle are considered a cross between Sahiwal and local cattle, combining the best traits."
    },
    deoni: {
      id: "deoni",
      name: "Deoni",
      nameHindi: "देवणी",
      type: "cattle",
      nativeState: ["Maharashtra", "Karnataka"],
      nativeRegion: "Latur, Nanded districts",
      characteristics: {
        bodyColor: "White with black markings",
        hornShape: "Small, curved",
        earType: "Medium",
        bodySize: "Medium to large",
        humpSize: "Medium",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "4-6 liters",
        lactationYield: "1200-1600 liters",
        fatContent: "4.2-4.6%",
        lactationPeriod: "270 days",
        ageAtFirstCalving: "40-46 months",
        calvingInterval: "15-18 months"
      },
      sustainability: {
        carbonScore: 74,
        carbonFootprint: "Low",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Semi-arid"
      },
      economicValue: {
        purchaseCost: "₹45,000 - ₹1,00,000",
        maintenanceCost: "Low",
        marketDemand: "Medium"
      },
      bestFor: ["Dual purpose", "Draft work", "Small farms"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Endangered Breed Conservation Programme"
      ],
      funFact: "Deoni is believed to be a cross between Gir and Dangi cattle, unique to the Deccan region."
    },
    khillari: {
      id: "khillari",
      name: "Khillari",
      nameHindi: "खिल्लारी",
      type: "cattle",
      nativeState: ["Maharashtra", "Karnataka"],
      nativeRegion: "Satara, Kolhapur districts",
      characteristics: {
        bodyColor: "Grey-white",
        hornShape: "Medium, pointed",
        earType: "Small, erect",
        bodySize: "Medium",
        humpSize: "Small to medium",
        dewlap: "Small"
      },
      productivity: {
        milkYieldPerDay: "2-4 liters",
        lactationYield: "600-1000 liters",
        fatContent: "4.0-4.5%",
        lactationPeriod: "240 days",
        ageAtFirstCalving: "42-48 months",
        calvingInterval: "16-20 months"
      },
      sustainability: {
        carbonScore: 72,
        carbonFootprint: "Low",
        heatTolerance: "Good",
        diseaseResistance: "Very High",
        feedEfficiency: "Good",
        climateAdaptability: "Hilly and semi-arid"
      },
      economicValue: {
        purchaseCost: "₹40,000 - ₹90,000",
        maintenanceCost: "Low",
        marketDemand: "Medium"
      },
      bestFor: ["Draft work", "Hilly terrain", "Traditional farming"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Maharashtra State Conservation"
      ],
      funFact: "Khillari cattle are known for their speed and stamina, traditionally used in bullock cart races."
    },
    kangayam: {
      id: "kangayam",
      name: "Kangayam",
      nameHindi: "कंगयम",
      type: "cattle",
      nativeState: ["Tamil Nadu"],
      nativeRegion: "Coimbatore, Erode districts",
      characteristics: {
        bodyColor: "Grey to white",
        hornShape: "Long, spreading",
        earType: "Small, erect",
        bodySize: "Medium to large",
        humpSize: "Well-developed",
        dewlap: "Medium"
      },
      productivity: {
        milkYieldPerDay: "2-4 liters",
        lactationYield: "600-900 liters",
        fatContent: "4.0-4.4%",
        lactationPeriod: "240 days",
        ageAtFirstCalving: "44-50 months",
        calvingInterval: "17-20 months"
      },
      sustainability: {
        carbonScore: 73,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "Very High",
        feedEfficiency: "High",
        climateAdaptability: "Hot and tropical"
      },
      economicValue: {
        purchaseCost: "₹50,000 - ₹1,20,000",
        maintenanceCost: "Low",
        marketDemand: "Medium to High"
      },
      bestFor: ["Draft work", "Agricultural operations", "Traditional farming"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Tamil Nadu State Conservation"
      ],
      funFact: "Kangayam bulls are prized for Jallikattu, the traditional bull-taming sport of Tamil Nadu."
    },
    hallikar: {
      id: "hallikar",
      name: "Hallikar",
      nameHindi: "हल्लीकर",
      type: "cattle",
      nativeState: ["Karnataka"],
      nativeRegion: "Mysore, Tumkur districts",
      characteristics: {
        bodyColor: "Grey to dark grey",
        hornShape: "Long, backward curving",
        earType: "Small, erect",
        bodySize: "Medium",
        humpSize: "Medium",
        dewlap: "Small"
      },
      productivity: {
        milkYieldPerDay: "2-3 liters",
        lactationYield: "500-800 liters",
        fatContent: "4.0-4.3%",
        lactationPeriod: "220 days",
        ageAtFirstCalving: "44-50 months",
        calvingInterval: "18-22 months"
      },
      sustainability: {
        carbonScore: 70,
        carbonFootprint: "Very Low",
        heatTolerance: "Good",
        diseaseResistance: "Very High",
        feedEfficiency: "High",
        climateAdaptability: "Semi-arid"
      },
      economicValue: {
        purchaseCost: "₹35,000 - ₹80,000",
        maintenanceCost: "Very Low",
        marketDemand: "Low to Medium"
      },
      bestFor: ["Draft work", "Traditional agriculture", "Hilly terrain"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Karnataka State Conservation"
      ],
      funFact: "Hallikar cattle are one of the best draft breeds in India, known for their endurance."
    },
    amritmahal: {
      id: "amritmahal",
      name: "Amritmahal",
      nameHindi: "अमृतमहल",
      type: "cattle",
      nativeState: ["Karnataka"],
      nativeRegion: "Chitradurga, Davangere districts",
      characteristics: {
        bodyColor: "Grey to steel grey",
        hornShape: "Long, pointed",
        earType: "Small, erect",
        bodySize: "Medium",
        humpSize: "Medium to large",
        dewlap: "Small"
      },
      productivity: {
        milkYieldPerDay: "1-2 liters",
        lactationYield: "400-600 liters",
        fatContent: "4.0-4.3%",
        lactationPeriod: "200 days",
        ageAtFirstCalving: "46-52 months",
        calvingInterval: "18-24 months"
      },
      sustainability: {
        carbonScore: 68,
        carbonFootprint: "Very Low",
        heatTolerance: "Good",
        diseaseResistance: "Very High",
        feedEfficiency: "Very High",
        climateAdaptability: "Semi-arid"
      },
      economicValue: {
        purchaseCost: "₹40,000 - ₹90,000",
        maintenanceCost: "Very Low",
        marketDemand: "Low"
      },
      bestFor: ["Draft work", "Military transport (historical)", "Conservation"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Heritage Breed Conservation"
      ],
      funFact: "Amritmahal cattle were bred by Mysore rulers specifically for military transport and are known for their fiery temperament."
    },
    punganur: {
      id: "punganur",
      name: "Punganur",
      nameHindi: "पुंगनूर",
      type: "cattle",
      nativeState: ["Andhra Pradesh"],
      nativeRegion: "Chittoor district",
      characteristics: {
        bodyColor: "White to light brown",
        hornShape: "Small, crescent-shaped",
        earType: "Small",
        bodySize: "Very small (miniature)",
        humpSize: "Small",
        dewlap: "Small"
      },
      productivity: {
        milkYieldPerDay: "1-3 liters",
        lactationYield: "300-500 liters",
        fatContent: "5.0-8.0%",
        lactationPeriod: "180 days",
        ageAtFirstCalving: "30-36 months",
        calvingInterval: "12-14 months"
      },
      sustainability: {
        carbonScore: 92,
        carbonFootprint: "Extremely Low",
        heatTolerance: "Excellent",
        diseaseResistance: "Very High",
        feedEfficiency: "Exceptional",
        climateAdaptability: "All climates"
      },
      economicValue: {
        purchaseCost: "₹1,50,000 - ₹5,00,000",
        maintenanceCost: "Very Low",
        marketDemand: "Very High (rare)"
      },
      bestFor: ["Small holdings", "Urban dairy", "Conservation breeding"],
      population: {
        status: "critically endangered",
        trend: "negative",
        conservationStatus: "Critically Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Critical Breed Conservation"
      ],
      funFact: "Punganur is the world's smallest humped cattle breed at just 70-90 cm height, with extremely rich milk."
    },
    vechur: {
      id: "vechur",
      name: "Vechur",
      nameHindi: "वेचूर",
      type: "cattle",
      nativeState: ["Kerala"],
      nativeRegion: "Kottayam district",
      characteristics: {
        bodyColor: "Black, brown, or red",
        hornShape: "Very small or absent",
        earType: "Small",
        bodySize: "Very small (dwarf)",
        humpSize: "Small",
        dewlap: "Small"
      },
      productivity: {
        milkYieldPerDay: "2-3 liters",
        lactationYield: "500-700 liters",
        fatContent: "5.0-6.0%",
        lactationPeriod: "210 days",
        ageAtFirstCalving: "28-34 months",
        calvingInterval: "12-14 months"
      },
      sustainability: {
        carbonScore: 90,
        carbonFootprint: "Extremely Low",
        heatTolerance: "Excellent",
        diseaseResistance: "Exceptional",
        feedEfficiency: "Exceptional",
        climateAdaptability: "Tropical wet"
      },
      economicValue: {
        purchaseCost: "₹1,00,000 - ₹3,00,000",
        maintenanceCost: "Very Low",
        marketDemand: "High (rare)"
      },
      bestFor: ["Organic farming", "Small holdings", "Ayurvedic products"],
      population: {
        status: "recovering",
        trend: "positive",
        conservationStatus: "Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Kerala State Conservation"
      ],
      funFact: "Vechur milk is believed to have medicinal properties and was near extinction until conservation efforts in the 1990s."
    }
  },
  buffalo: {
    murrah: {
      id: "murrah",
      name: "Murrah",
      nameHindi: "मुर्रा",
      type: "buffalo",
      nativeState: ["Haryana", "Punjab", "Delhi"],
      nativeRegion: "Hisar, Rohtak districts",
      characteristics: {
        bodyColor: "Jet black",
        hornShape: "Tight curled (jalebi-shaped)",
        earType: "Small, alert",
        bodySize: "Large",
        bodyType: "Wedge-shaped"
      },
      productivity: {
        milkYieldPerDay: "10-16 liters",
        lactationYield: "2500-3500 liters",
        fatContent: "7.0-8.0%",
        lactationPeriod: "310 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "15-17 months"
      },
      sustainability: {
        carbonScore: 65,
        carbonFootprint: "Medium",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Subtropical"
      },
      economicValue: {
        purchaseCost: "₹1,00,000 - ₹3,00,000",
        maintenanceCost: "Medium",
        marketDemand: "Very High"
      },
      bestFor: ["Commercial dairy", "Milk fat production", "Breeding programs"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "National Dairy Plan"
      ],
      funFact: "Murrah is called the 'Black Gold' of India and produces the highest milk fat content among buffalo breeds."
    },
    mehsana: {
      id: "mehsana",
      name: "Mehsana",
      nameHindi: "मेहसाणा",
      type: "buffalo",
      nativeState: ["Gujarat"],
      nativeRegion: "Mehsana, Sabarkantha districts",
      characteristics: {
        bodyColor: "Black to brown",
        hornShape: "Sickle-shaped, curved upward",
        earType: "Medium",
        bodySize: "Large",
        bodyType: "Rectangular"
      },
      productivity: {
        milkYieldPerDay: "8-12 liters",
        lactationYield: "2000-2800 liters",
        fatContent: "6.5-7.5%",
        lactationPeriod: "300 days",
        ageAtFirstCalving: "38-44 months",
        calvingInterval: "16-18 months"
      },
      sustainability: {
        carbonScore: 62,
        carbonFootprint: "Medium",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Semi-arid to subtropical"
      },
      economicValue: {
        purchaseCost: "₹80,000 - ₹2,00,000",
        maintenanceCost: "Medium",
        marketDemand: "High"
      },
      bestFor: ["Dairy farming", "Cooperative dairies", "Small farmers"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Gujarat State Dairy Programme"
      ],
      funFact: "Mehsana buffaloes are the backbone of Gujarat's famous cooperative dairy movement (Amul)."
    },
    jaffarabadi: {
      id: "jaffarabadi",
      name: "Jaffarabadi",
      nameHindi: "जाफराबादी",
      type: "buffalo",
      nativeState: ["Gujarat"],
      nativeRegion: "Junagadh, Jamnagar districts",
      characteristics: {
        bodyColor: "Black",
        hornShape: "Large, heavy, drooping",
        earType: "Large, drooping",
        bodySize: "Very large (heaviest)",
        bodyType: "Massive"
      },
      productivity: {
        milkYieldPerDay: "10-16 liters",
        lactationYield: "2500-3500 liters",
        fatContent: "8.0-10.0%",
        lactationPeriod: "305 days",
        ageAtFirstCalving: "42-48 months",
        calvingInterval: "17-20 months"
      },
      sustainability: {
        carbonScore: 58,
        carbonFootprint: "Medium to High",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Medium",
        climateAdaptability: "Coastal and humid"
      },
      economicValue: {
        purchaseCost: "₹1,20,000 - ₹3,50,000",
        maintenanceCost: "High",
        marketDemand: "High"
      },
      bestFor: ["High-fat dairy", "Mozzarella production", "Breeding"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Gujarat Buffalo Conservation"
      ],
      funFact: "Jaffarabadi is the heaviest buffalo breed in the world, with males weighing up to 1500 kg."
    },
    surti: {
      id: "surti",
      name: "Surti",
      nameHindi: "सूरती",
      type: "buffalo",
      nativeState: ["Gujarat"],
      nativeRegion: "Surat, Vadodara districts",
      characteristics: {
        bodyColor: "Brown to silver-grey",
        hornShape: "Sickle-shaped, medium",
        earType: "Medium",
        bodySize: "Medium",
        bodyType: "Compact"
      },
      productivity: {
        milkYieldPerDay: "6-10 liters",
        lactationYield: "1600-2200 liters",
        fatContent: "7.0-8.5%",
        lactationPeriod: "290 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "15-17 months"
      },
      sustainability: {
        carbonScore: 68,
        carbonFootprint: "Low to Medium",
        heatTolerance: "Excellent",
        diseaseResistance: "High",
        feedEfficiency: "High",
        climateAdaptability: "Humid tropical"
      },
      economicValue: {
        purchaseCost: "₹60,000 - ₹1,40,000",
        maintenanceCost: "Low to Medium",
        marketDemand: "Medium to High"
      },
      bestFor: ["Small farms", "Low-input systems", "Humid regions"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Indigenous Breed Conservation"
      ],
      funFact: "Surti buffaloes are known as 'Charotar' buffaloes and are popular for their docile temperament."
    },
    bhadawari: {
      id: "bhadawari",
      name: "Bhadawari",
      nameHindi: "भदावरी",
      type: "buffalo",
      nativeState: ["Uttar Pradesh", "Madhya Pradesh"],
      nativeRegion: "Agra, Etawah districts",
      characteristics: {
        bodyColor: "Copper to light brown",
        hornShape: "Medium, curved backward",
        earType: "Medium",
        bodySize: "Medium",
        bodyType: "Compact"
      },
      productivity: {
        milkYieldPerDay: "5-8 liters",
        lactationYield: "1200-1800 liters",
        fatContent: "8.0-14.0%",
        lactationPeriod: "270 days",
        ageAtFirstCalving: "38-44 months",
        calvingInterval: "16-18 months"
      },
      sustainability: {
        carbonScore: 72,
        carbonFootprint: "Low",
        heatTolerance: "Excellent",
        diseaseResistance: "Very High",
        feedEfficiency: "Exceptional",
        climateAdaptability: "Ravine and semi-arid"
      },
      economicValue: {
        purchaseCost: "₹50,000 - ₹1,20,000",
        maintenanceCost: "Low",
        marketDemand: "Medium"
      },
      bestFor: ["Ghee production", "Low-input farming", "Harsh conditions"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Critical Breed Conservation"
      ],
      funFact: "Bhadawari buffalo milk has the highest fat content (up to 14%) among all buffalo breeds."
    },
    niliRavi: {
      id: "niliRavi",
      name: "Nili-Ravi",
      nameHindi: "नीली-रावी",
      type: "buffalo",
      nativeState: ["Punjab"],
      nativeRegion: "Ferozpur, Amritsar districts",
      characteristics: {
        bodyColor: "Black with white markings",
        hornShape: "Small, tightly curled",
        earType: "Small",
        bodySize: "Large",
        bodyType: "Wedge-shaped"
      },
      productivity: {
        milkYieldPerDay: "8-14 liters",
        lactationYield: "2000-3000 liters",
        fatContent: "6.5-7.5%",
        lactationPeriod: "300 days",
        ageAtFirstCalving: "36-42 months",
        calvingInterval: "15-17 months"
      },
      sustainability: {
        carbonScore: 64,
        carbonFootprint: "Medium",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Subtropical"
      },
      economicValue: {
        purchaseCost: "₹90,000 - ₹2,50,000",
        maintenanceCost: "Medium",
        marketDemand: "High"
      },
      bestFor: ["Commercial dairy", "Punjab dairy industry", "Breeding"],
      population: {
        status: "stable",
        trend: "positive",
        conservationStatus: "Not at risk"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Punjab State Dairy Programme"
      ],
      funFact: "Nili-Ravi is named after two rivers (Ravi and Sutlej) and has distinctive white markings on face and legs."
    },
    nagpuri: {
      id: "nagpuri",
      name: "Nagpuri",
      nameHindi: "नागपुरी",
      type: "buffalo",
      nativeState: ["Maharashtra"],
      nativeRegion: "Nagpur, Wardha districts",
      characteristics: {
        bodyColor: "Black",
        hornShape: "Long, flat, curved backward",
        earType: "Medium, drooping",
        bodySize: "Medium to large",
        bodyType: "Long-bodied"
      },
      productivity: {
        milkYieldPerDay: "4-8 liters",
        lactationYield: "1200-1800 liters",
        fatContent: "7.0-8.0%",
        lactationPeriod: "280 days",
        ageAtFirstCalving: "40-46 months",
        calvingInterval: "16-18 months"
      },
      sustainability: {
        carbonScore: 66,
        carbonFootprint: "Low to Medium",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Good",
        climateAdaptability: "Semi-arid"
      },
      economicValue: {
        purchaseCost: "₹50,000 - ₹1,20,000",
        maintenanceCost: "Low to Medium",
        marketDemand: "Medium"
      },
      bestFor: ["Dual purpose (milk + draft)", "Traditional farming", "Small farms"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Maharashtra State Conservation"
      ],
      funFact: "Nagpuri buffaloes have the longest horns among Indian buffalo breeds, sometimes reaching 2 meters tip to tip."
    },
    pandharpuri: {
      id: "pandharpuri",
      name: "Pandharpuri",
      nameHindi: "पंढरपुरी",
      type: "buffalo",
      nativeState: ["Maharashtra"],
      nativeRegion: "Solapur, Kolhapur districts",
      characteristics: {
        bodyColor: "Black",
        hornShape: "Long, sword-shaped",
        earType: "Long, drooping",
        bodySize: "Large",
        bodyType: "Massive"
      },
      productivity: {
        milkYieldPerDay: "6-10 liters",
        lactationYield: "1500-2200 liters",
        fatContent: "7.0-8.5%",
        lactationPeriod: "290 days",
        ageAtFirstCalving: "42-48 months",
        calvingInterval: "17-19 months"
      },
      sustainability: {
        carbonScore: 60,
        carbonFootprint: "Medium",
        heatTolerance: "Good",
        diseaseResistance: "High",
        feedEfficiency: "Medium",
        climateAdaptability: "Semi-arid"
      },
      economicValue: {
        purchaseCost: "₹70,000 - ₹1,60,000",
        maintenanceCost: "Medium",
        marketDemand: "Medium"
      },
      bestFor: ["Draft work", "Dairy", "Traditional farming"],
      population: {
        status: "declining",
        trend: "negative",
        conservationStatus: "Vulnerable"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Maharashtra Buffalo Conservation"
      ],
      funFact: "Pandharpuri buffaloes are known for their massive build and were traditionally used for pulling heavy loads."
    },
    toda: {
      id: "toda",
      name: "Toda",
      nameHindi: "टोडा",
      type: "buffalo",
      nativeState: ["Tamil Nadu"],
      nativeRegion: "Nilgiri hills",
      characteristics: {
        bodyColor: "Light brown to ash grey",
        hornShape: "Crescent-shaped, spreading",
        earType: "Small",
        bodySize: "Medium",
        bodyType: "Compact, hill-adapted"
      },
      productivity: {
        milkYieldPerDay: "2-4 liters",
        lactationYield: "500-800 liters",
        fatContent: "8.0-10.0%",
        lactationPeriod: "240 days",
        ageAtFirstCalving: "44-50 months",
        calvingInterval: "18-22 months"
      },
      sustainability: {
        carbonScore: 75,
        carbonFootprint: "Very Low",
        heatTolerance: "Low (hill adapted)",
        diseaseResistance: "Very High",
        feedEfficiency: "High",
        climateAdaptability: "Cool montane"
      },
      economicValue: {
        purchaseCost: "₹40,000 - ₹80,000",
        maintenanceCost: "Low",
        marketDemand: "Low (culturally important)"
      },
      bestFor: ["Hill farming", "Conservation", "Cultural preservation"],
      population: {
        status: "critically endangered",
        trend: "negative",
        conservationStatus: "Critically Endangered"
      },
      governmentSchemes: [
        "Rashtriya Gokul Mission",
        "Scheduled Tribe Heritage Conservation"
      ],
      funFact: "Toda buffaloes are sacred to the Toda tribe and play a central role in their religious ceremonies."
    }
  },
  stateToBreeds: {
    "Gujarat": ["gir", "tharparkar", "kankrej", "mehsana", "jaffarabadi", "surti"],
    "Rajasthan": ["sahiwal", "tharparkar", "kankrej", "rathi"],
    "Punjab": ["sahiwal", "murrah", "niliRavi"],
    "Haryana": ["sahiwal", "hariana", "murrah"],
    "Maharashtra": ["deoni", "khillari", "nagpuri", "pandharpuri"],
    "Karnataka": ["redSindhi", "deoni", "khillari", "hallikar", "amritmahal"],
    "Tamil Nadu": ["kangayam", "toda"],
    "Kerala": ["vechur"],
    "Andhra Pradesh": ["ongole", "punganur"],
    "Uttar Pradesh": ["hariana", "bhadawari"],
    "Madhya Pradesh": ["bhadawari"],
    "Delhi": ["hariana", "murrah"]
  },
  governmentSchemes: [
    {
      id: "rgm",
      name: "Rashtriya Gokul Mission",
      nameHindi: "राष्ट्रीय गोकुल मिशन",
      description: "National programme for conservation and development of indigenous bovine breeds",
      benefits: [
        "Financial assistance for breed conservation",
        "Establishment of Gokul Grams",
        "Genetic improvement programmes",
        "Training and capacity building"
      ],
      eligibility: "Farmers, dairy cooperatives, and NGOs",
      website: "https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission"
    },
    {
      id: "ndp",
      name: "National Dairy Plan",
      nameHindi: "राष्ट्रीय डेयरी योजना",
      description: "Multi-state initiative to increase productivity of milch animals",
      benefits: [
        "Subsidized artificial insemination",
        "Veterinary services",
        "Fodder development",
        "Infrastructure support"
      ],
      eligibility: "Dairy farmers and cooperatives",
      website: "https://www.nddb.coop/ndpi"
    },
    {
      id: "npbb",
      name: "National Programme for Bovine Breeding",
      nameHindi: "राष्ट्रीय गोवंश प्रजनन कार्यक्रम",
      description: "Programme focusing on genetic improvement through AI and natural service",
      benefits: [
        "Free AI services",
        "Breeding bull distribution",
        "Semen production support"
      ],
      eligibility: "All dairy farmers",
      website: "https://dahd.nic.in"
    },
    {
      id: "nkbc",
      name: "National Kamdhenu Breeding Centre",
      nameHindi: "राष्ट्रीय कामधेनु प्रजनन केंद्र",
      description: "Centre of excellence for indigenous breed conservation",
      benefits: [
        "Elite germplasm preservation",
        "Research and development",
        "Training programmes"
      ],
      eligibility: "Research institutions and breeding farms",
      website: "https://dahd.nic.in"
    }
  ]
};

// Helper function to get all breeds as array
export const getAllBreeds = () => {
  const cattleBreeds = Object.values(breedData.cattle).map(b => ({ ...b, type: 'cattle' }));
  const buffaloBreeds = Object.values(breedData.buffalo).map(b => ({ ...b, type: 'buffalo' }));
  return [...cattleBreeds, ...buffaloBreeds];
};

// Helper function to get breed by ID
export const getBreedById = (id) => {
  return breedData.cattle[id] || breedData.buffalo[id] || null;
};

// Helper function to get breeds by state
export const getBreedsByState = (state) => {
  const breedIds = breedData.stateToBreeds[state] || [];
  return breedIds.map(id => getBreedById(id)).filter(Boolean);
};

// Helper function to get conservation endangered breeds
export const getEndangeredBreeds = () => {
  return getAllBreeds().filter(b => 
    b.population?.conservationStatus?.toLowerCase().includes('endangered') ||
    b.population?.conservationStatus?.toLowerCase().includes('vulnerable')
  );
};

export default breedData;
