// Database of plant diseases, diagnostics, treatments, and leaf drawing instructions for simulation
const diseasesData = {
  "healthy": {
    name: "Healthy Leaf",
    scientificName: "N/A",
    crop: "General / Multi-crop",
    severity: "Low",
    severityColor: "#10b981", // Emerald
    confidenceRange: [92, 98],
    description: "The leaf shows no signs of active pathogens, nutrient deficiencies, or pest damage. Photosynthetic activity is optimal, and cellular structure is intact.",
    symptoms: [
      "Uniform green pigmentation across the entire blade.",
      "Intact margin and leaf veins without discoloration.",
      "Absence of lesions, spots, wilt, or powdery coating."
    ],
    causes: [
      "Proper soil nutrition and watering balance.",
      "Adequate air circulation and spacing.",
      "Good hygiene practices and disease-resistant cultivars."
    ],
    treatments: {
      organic: "Maintain existing watering and composting schedule. Apply neem oil as a preventive measure every 2-3 weeks.",
      chemical: "No chemical fungicide or bactericide treatment required."
    },
    prevention: [
      "Prune lower leaves to avoid ground splash.",
      "Rotate crops annually to break pathogen life cycles.",
      "Ensure soil drainage is excellent to prevent root rot."
    ],
    // Visualization features for canvas generator
    visuals: {
      leafColor: "#2e7d32",
      spotColor: "none",
      spotsCount: 0,
      spotRadius: 0,
      wiltDegree: 0
    }
  },
  "apple_scab": {
    name: "Apple Scab",
    scientificName: "Venturia inaequalis",
    crop: "Apple (Malus domestica)",
    severity: "Medium",
    severityColor: "#f59e0b", // Amber
    confidenceRange: [85, 94],
    description: "A fungal disease causing olive-green to brown velvety spots on leaves and fruit. It can lead to early defoliation and severe cosmetic/yield damage to apple orchards.",
    symptoms: [
      "Velvety, dark olive-green spots with fuzzy borders on the leaf underside.",
      "Spots turn metallic brown-black and puckered over time.",
      "Leaves may yellow, curl, and drop prematurely."
    ],
    causes: [
      "Pathogen overwintering on fallen leaves in orchard soil.",
      "Prolonged leaf wetness during warm spring temperatures (15-25°C).",
      "Splashing rain or wind dispersing fungal spores (ascospores)."
    ],
    treatments: {
      organic: "Apply copper-based fungicides or sulfur sprays at green tip stage. Spray liquid kelp or compost tea to build leaf microbiology.",
      chemical: "Utilize systemic fungicides like Myclobutanil or Fenbuconazole during early bud break to petal fall."
    },
    prevention: [
      "Rake and destroy all fallen apple leaves in autumn.",
      "Prune the tree canopy extensively to maximize sunlight penetration and air movement.",
      "Select scab-resistant apple cultivars (e.g., Liberty, Prima, Enterprise)."
    ],
    visuals: {
      leafColor: "#689f38",
      spotColor: "rgba(62, 39, 35, 0.8)", // Olive dark brown
      spotsCount: 15,
      spotRadius: 6,
      wiltDegree: 0.1
    }
  },
  "tomato_late_blight": {
    name: "Tomato Late Blight",
    scientificName: "Phytophthora infestans",
    crop: "Tomato (Solanum lycopersicum)",
    severity: "High",
    severityColor: "#ef4444", // Red
    confidenceRange: [89, 97],
    description: "A devastating oomycete pathogen that can kill mature tomato plants within days under humid conditions. Famously responsible for the Irish Potato Famine.",
    symptoms: [
      "Large, irregular water-soaked pale green spots near leaf margins.",
      "Spots rapidly enlarge and turn dark brown to purplish-black.",
      "White downy fungal growth appears on leaf undersides in humid weather."
    ],
    causes: [
      "Spores carried long distances by wind or rain splash.",
      "High humidity (>90%) combined with cool-to-warm temperatures (15-20°C).",
      "Overwintering in infected potato tubers or plant debris left in the field."
    ],
    treatments: {
      organic: "Apply copper octanoate or copper hydroxide sprays immediately at the first sign. Remove and burn heavily infected foliage.",
      chemical: "Apply chlorothalonil, mancozeb, or metalaxyl-based fungicides weekly during high-humidity windows."
    },
    prevention: [
      "Water crops at the base using drip irrigation; keep leaves completely dry.",
      "Space tomato plants at least 3 feet apart for airflow.",
      "Avoid planting tomatoes near potatoes to reduce cross-infection risk."
    ],
    visuals: {
      leafColor: "#4caf50",
      spotColor: "rgba(33, 33, 33, 0.9)", // Dark purplish-black large spots
      spotsCount: 8,
      spotRadius: 16,
      wiltDegree: 0.35
    }
  },
  "potato_early_blight": {
    name: "Potato Early Blight",
    scientificName: "Alternaria solani",
    crop: "Potato (Solanum tuberosum)",
    severity: "Medium",
    severityColor: "#f59e0b", // Amber
    confidenceRange: [82, 91],
    description: "A common fungal disease characterized by brown spots with concentric 'target board' patterns. It reduces tuber yields and affects lower, older leaves first.",
    symptoms: [
      "Dark brown to black spots with concentric rings resembling targets.",
      "Yellowing (chlorosis) of leaf tissue surrounding the spots.",
      "Leads to dry, papery leaf collapse, but leaves usually hang on the stem."
    ],
    causes: [
      "Fungus surviving in crop residue or solanaceous weeds.",
      "Alternating dry and wet periods favoring spore formation and release.",
      "Nutrient-deficient or stressed plants are far more susceptible."
    ],
    treatments: {
      organic: "Spray Bacillus subtilis biological fungicides. Ensure balanced organic nitrogen-potassium feeding.",
      chemical: "Foliar application of Mancozeb, Azoxystrobin, or Chlorothalonil starting in early summer."
    },
    prevention: [
      "Implement a 3-4 year crop rotation plan excluding potatoes, tomatoes, and eggplants.",
      "Apply thick straw mulch to prevent soil spores from splashing onto lower leaves.",
      "Aerate soils and avoid overhead sprinklers."
    ],
    visuals: {
      leafColor: "#8d6e63", // Yellowish olive-brown leaf
      spotColor: "rgba(43, 24, 16, 0.95)", // Concentric target ring center
      spotsCount: 12,
      spotRadius: 10,
      wiltDegree: 0.2
    }
  },
  "corn_rust": {
    name: "Corn Common Rust",
    scientificName: "Puccinia sorghi",
    crop: "Corn (Zea mays)",
    severity: "Medium",
    severityColor: "#f59e0b", // Amber
    confidenceRange: [88, 95],
    description: "A fungal infection causing reddish-brown powdery pustules on leaf surfaces. Severe infections reduce corn leaf surface area, stunt growth, and lower grain yield.",
    symptoms: [
      "Elongated, powdery orange-brown pustules on both upper and lower leaf surfaces.",
      "Pustules rupture, releasing dusty rust-colored spores that easily wipe off.",
      "Leaves may yellow, wither, and dry up under heavy infestation."
    ],
    causes: [
      "Fungal spores blown north from southern regions on wind currents.",
      "Cool temperatures (16-23°C) and high relative humidity (>95%).",
      "Prolonged dew formation on leaves overnight."
    ],
    treatments: {
      organic: "Foliar spray with compost tea or liquid sulfur. Plant rust-resistant corn hybrids.",
      chemical: "Apply strobilurin or triazole fungicides if pustules appear on lower leaves before silking."
    },
    prevention: [
      "Select hybrids with genetic resistance to Puccinia sorghi.",
      "Manage crop residues to speed up breakdown (tillage/incorporation).",
      "Plant early in the season to avoid the peak spore flight windows."
    ],
    visuals: {
      leafColor: "#81c784", // Lighter green corn leaf
      spotColor: "rgba(191, 54, 12, 0.9)", // Rust orange-red spots
      spotsCount: 30,
      spotRadius: 4,
      wiltDegree: 0.15
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = diseasesData;
}
