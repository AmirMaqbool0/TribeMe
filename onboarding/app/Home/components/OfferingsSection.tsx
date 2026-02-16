import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa";

type ContentType = {
  title: string;
  description: string;
};

const OfferingsSection: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<string>(
    "Free Reach"
  );

  const content: Record<string, ContentType> = {
    "Free Reach": {
      title: "Free Reach",
      description:
        "Gain exposure to a new audience at no cost.  Your brand is presented to users for their Liking at no cost; enabling you to then send offers and provide cash back.",
    },
    "Free Learning": {
      title: "Free Learning",
      description:
        "Access free information about your users.  Top Tribes, Other Likes, Dislikes, Age, Gender, Location, etc.",
    },
    "Cost Per Click (CPC) Model": {
      title: "Cost Per Click (CPC) Model",
      description:
        "A performance-based model where you pay only a low CPC for users who click to Redeem any offers that you choose to send.",
    },
    "Build Awareness": {
      title: "Build Awareness",
      description:
        "Deliver ads and informational videos to Tribe members who are unaware of your product or service and are interested in learning about it.",
    },
    "Cash Back Gamification": {
      title: "Cash Back Gamification",
      description:
        "A simple, easy and fun way for you to provide Cash Back to Tribe members via our Tribe Me Coin marketplace.",
    },
  };

  return (
    <section className="py-16 bg-white z-0 relative p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto text-center">
        <h2 className="text-xs sm:text-sm font-semibold mb-2" style={{ color: "#ff3951" }}>
          OUR OFFERINGS
        </h2>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl xl:text-3xl 2xl:text-3xl font-bold mb-4">
          Maximizing Brand Engagement <br/>with Cost-Effective Solutions
        </h1>
        {/* <h3 className="text-black text-lg sm:text-xl md:text-2xl font-medium mb-6">
          with Cost-Effective Solutions
        </h3> */}

        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          <div className="flex-1 p-4 sm:p-6">
            {Object.keys(content).map((key) => (
              <div key={key} onClick={() => setSelectedContent(key)}>
                <div className="mb-4 flex items-center justify-between cursor-pointer">
                  <span className="text-base sm:text-lg text-gray-600">{key}</span>
                  <FaAngleRight style={{ color: "#ff3951" }} />
                </div>
                <hr className="border-t-2 border-[#ff3951] mb-4" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 sm:p-6 text-left my-auto">
            <h4 className="text-3xl sm:text-4xl md:text-5xl xl:text-3xl 2xl:text-4xl font-semibold mb-4 text-black">
              {content[selectedContent].title}
            </h4>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-xl 2xl:text-xl text-gray-600">
              {content[selectedContent].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;