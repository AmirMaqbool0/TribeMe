// // // Home.tsx
"use client";

// // import React, { useState, useEffect } from "react";
// // import { useSearchParams } from "next/navigation";
// // import Navbar from "./components/Navbar";
// // import BusinessHeroSection from "./components/BusinessHeroSection";
// // import MemberHeroSection from "./components/MemberHeroSection";
// // import OfferingsSection from "./components/OfferingsSection";
// // import TestimonialsSection from "./components/TestimonialsSection";
// // import CallToActionSection from "./components/CallToActionSection";
// // import Footer from "./components/Footer";

// // const Home: React.FC = () => {
// //   const searchParams = useSearchParams();
// //   const [activeSection, setActiveSection] = useState<'business' | 'member'>('business');

// //   useEffect(() => {
// //     const section = searchParams.get('section');
// //     if (section === 'business' || section === 'member') {
// //       setActiveSection(section);
// //     }
// //   }, [searchParams]);

// //   return (
// //     <div>
// //       <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />
// //       {activeSection === 'business' ? <BusinessHeroSection /> : <MemberHeroSection />}
// //       <OfferingsSection />
// //       <TestimonialsSection />
// //       <CallToActionSection />
// //       <Footer />
// //     </div>
// //   );
// // };

// // export default Home;
// // Home.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import Navbar from "./components/Navbar";
// import BusinessHeroSection from "./components/BusinessHeroSection";
// import MemberHeroSection from "./components/MemberHeroSection";
// import OfferingsSection from "./components/OfferingsSection";
// import TestimonialsSection from "./components/TestimonialsSection";
// import CallToActionSection from "./components/CallToActionSection";
// import Footer from "./components/Footer";

// const Home: React.FC = () => {
//   const searchParams = useSearchParams();
//   const [activeSection, setActiveSection] = useState<'business' | 'member'>('business');

//   useEffect(() => {
//     const section = searchParams.get('section');
//     if (section === 'business' || section === 'member') {
//       setActiveSection(section as 'business' | 'member'); // Ensuring correct type
//     }
//   }, [searchParams]);

//   // Return null or a loading indicator during the initial render if necessary
//   if (!searchParams) return null;

//   return (
//     <>
//       <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />
//       {activeSection === 'business' ? <BusinessHeroSection /> : <MemberHeroSection />}
//       <OfferingsSection />
//       <TestimonialsSection />
//       <CallToActionSection />
//       <Footer />
//     </>
//   );
// };

// export default Home;
import React from "react";
import Navbar from "./components/Navbar";
import BusinessHeroSection from "./components/BusinessHeroSection";
import OfferingsSection from "./components/OfferingsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CallToActionSection from "./components/CallToActionSection";
import Footer from "./components/Footer";
import FAQS from "./components/FAQs";

const Home: React.FC = () => {
  return (
    <>
      <Navbar />
      <BusinessHeroSection />
      <OfferingsSection />
      <TestimonialsSection />
      <FAQS/>
      <CallToActionSection />
      <Footer />
    </>
  );
};

export default Home;