import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.identify": "Identify Breed",
      "nav.explore": "Explore Breeds",
      "nav.compare": "Compare",
      "nav.map": "Breed Map",
      "nav.schemes": "Govt Schemes",
      
      // Home page
      "home.title": "Indian Cattle & Buffalo",
      "home.titleHighlight": "Breed Recognition",
      "home.subtitle": "AI-powered identification system for indigenous Indian cattle and buffalo breeds. Upload an image and get instant breed identification with detailed information.",
      "home.cta": "Identify Breed Now",
      "home.exploreCta": "Explore All Breeds",
      
      // Features
      "features.ai.title": "AI-Powered Recognition",
      "features.ai.desc": "Advanced deep learning model trained on 50+ indigenous breeds",
      "features.explainable.title": "Explainable AI",
      "features.explainable.desc": "Grad-CAM visualization shows what the AI focuses on",
      "features.sustainability.title": "Sustainability Score",
      "features.sustainability.desc": "Carbon footprint and environmental impact metrics",
      "features.advisory.title": "Farmer Advisory",
      "features.advisory.desc": "Government schemes and best practices for each breed",
      
      // Upload
      "upload.title": "Upload Image",
      "upload.dragDrop": "Drag & drop your image here",
      "upload.or": "or",
      "upload.browse": "Browse Files",
      "upload.formats": "Supports: JPG, PNG, WebP (max 10MB)",
      "upload.analyzing": "Analyzing image...",
      
      // Results
      "result.title": "Prediction Result",
      "result.animalType": "Animal Type",
      "result.breed": "Breed",
      "result.confidence": "Confidence",
      "result.topPredictions": "Top Predictions",
      "result.showGradcam": "Show AI Focus",
      "result.hideGradcam": "Hide AI Focus",
      "result.speakResult": "Speak Result",
      
      // Breed info
      "breed.nativeRegion": "Native Region",
      "breed.characteristics": "Characteristics",
      "breed.productivity": "Productivity",
      "breed.sustainability": "Sustainability",
      "breed.economic": "Economic Value",
      "breed.conservation": "Conservation Status",
      "breed.bestFor": "Best For",
      "breed.funFact": "Fun Fact",
      "breed.schemes": "Government Schemes",
      
      // Comparison
      "compare.title": "Compare Breeds",
      "compare.select": "Select breeds to compare",
      "compare.addBreed": "Add Breed",
      "compare.milkYield": "Milk Yield",
      "compare.carbonScore": "Carbon Score",
      "compare.cost": "Purchase Cost",
      
      // Map
      "map.title": "Breed Distribution Map",
      "map.subtitle": "Explore native breeds across Indian states",
      "map.clickState": "Click on a state to see native breeds",
      
      // Sustainability
      "sustainability.title": "Sustainability Metrics",
      "sustainability.carbonFootprint": "Carbon Footprint",
      "sustainability.heatTolerance": "Heat Tolerance",
      "sustainability.diseaseResistance": "Disease Resistance",
      "sustainability.feedEfficiency": "Feed Efficiency",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Something went wrong",
      "common.retry": "Try Again",
      "common.learnMore": "Learn More",
      "common.viewAll": "View All",
      "common.back": "Back",
      "common.close": "Close",
      
      // Language
      "language.en": "English",
      "language.hi": "हिंदी"
    }
  },
  hi: {
    translation: {
      // Navigation
      "nav.home": "होम",
      "nav.identify": "नस्ल पहचानें",
      "nav.explore": "नस्लें देखें",
      "nav.compare": "तुलना करें",
      "nav.map": "नस्ल मानचित्र",
      "nav.schemes": "सरकारी योजनाएं",
      
      // Home page
      "home.title": "भारतीय गाय और भैंस",
      "home.titleHighlight": "नस्ल पहचान",
      "home.subtitle": "भारतीय देशी गाय और भैंस की नस्लों की AI-संचालित पहचान प्रणाली। एक तस्वीर अपलोड करें और तुरंत नस्ल की पहचान पाएं।",
      "home.cta": "अभी नस्ल पहचानें",
      "home.exploreCta": "सभी नस्लें देखें",
      
      // Features
      "features.ai.title": "AI-संचालित पहचान",
      "features.ai.desc": "50+ देशी नस्लों पर प्रशिक्षित उन्नत डीप लर्निंग मॉडल",
      "features.explainable.title": "व्याख्या योग्य AI",
      "features.explainable.desc": "Grad-CAM दिखाता है कि AI किस पर ध्यान देता है",
      "features.sustainability.title": "स्थिरता स्कोर",
      "features.sustainability.desc": "कार्बन फुटप्रिंट और पर्यावरणीय प्रभाव मेट्रिक्स",
      "features.advisory.title": "किसान सलाह",
      "features.advisory.desc": "प्रत्येक नस्ल के लिए सरकारी योजनाएं और सर्वोत्तम अभ्यास",
      
      // Upload
      "upload.title": "तस्वीर अपलोड करें",
      "upload.dragDrop": "अपनी तस्वीर यहां खींचें और छोड़ें",
      "upload.or": "या",
      "upload.browse": "फ़ाइलें ब्राउज़ करें",
      "upload.formats": "समर्थित: JPG, PNG, WebP (अधिकतम 10MB)",
      "upload.analyzing": "तस्वीर का विश्लेषण हो रहा है...",
      
      // Results
      "result.title": "भविष्यवाणी परिणाम",
      "result.animalType": "पशु प्रकार",
      "result.breed": "नस्ल",
      "result.confidence": "विश्वास",
      "result.topPredictions": "शीर्ष भविष्यवाणियां",
      "result.showGradcam": "AI फोकस दिखाएं",
      "result.hideGradcam": "AI फोकस छुपाएं",
      "result.speakResult": "परिणाम सुनें",
      
      // Breed info
      "breed.nativeRegion": "मूल क्षेत्र",
      "breed.characteristics": "विशेषताएं",
      "breed.productivity": "उत्पादकता",
      "breed.sustainability": "स्थिरता",
      "breed.economic": "आर्थिक मूल्य",
      "breed.conservation": "संरक्षण स्थिति",
      "breed.bestFor": "के लिए सर्वश्रेष्ठ",
      "breed.funFact": "रोचक तथ्य",
      "breed.schemes": "सरकारी योजनाएं",
      
      // Comparison
      "compare.title": "नस्लों की तुलना करें",
      "compare.select": "तुलना के लिए नस्लें चुनें",
      "compare.addBreed": "नस्ल जोड़ें",
      "compare.milkYield": "दूध उत्पादन",
      "compare.carbonScore": "कार्बन स्कोर",
      "compare.cost": "खरीद लागत",
      
      // Map
      "map.title": "नस्ल वितरण मानचित्र",
      "map.subtitle": "भारतीय राज्यों में देशी नस्लों का अन्वेषण करें",
      "map.clickState": "देशी नस्लें देखने के लिए राज्य पर क्लिक करें",
      
      // Sustainability
      "sustainability.title": "स्थिरता मेट्रिक्स",
      "sustainability.carbonFootprint": "कार्बन फुटप्रिंट",
      "sustainability.heatTolerance": "गर्मी सहनशीलता",
      "sustainability.diseaseResistance": "रोग प्रतिरोधक क्षमता",
      "sustainability.feedEfficiency": "चारा दक्षता",
      
      // Common
      "common.loading": "लोड हो रहा है...",
      "common.error": "कुछ गलत हो गया",
      "common.retry": "पुनः प्रयास करें",
      "common.learnMore": "और जानें",
      "common.viewAll": "सभी देखें",
      "common.back": "वापस",
      "common.close": "बंद करें",
      
      // Language
      "language.en": "English",
      "language.hi": "हिंदी"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
