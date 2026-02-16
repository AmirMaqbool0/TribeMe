import React from "react";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleSwipe = (direction: string) => {
    if (direction === "left") {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    } else if (direction === "right") {
      setActiveIndex((prevIndex) => (prevIndex - 1 + 3) % 3);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    trackMouse: true,
  });

  const cardContent = [
    {
      text: "Emails and texts cost a lot to design and manage. Tribe Me has no email or text platform charges and I don't need a designer!",
      name: "Packed with Life",
    },
    {
      text: "Where else can I get Free exposure to potential new customers and only pay for redemptions?",
      name: "Bedder Bedding",
    },
    {
      text: "Our emails and texts aren't cheap and they aren't even seen by ¾ of the people we send them to.",
      name: "Honest Hemp",
    },
  ];

  return (
    <section className="relative py-16 bg-white p-4 sm:p-6 lg:p-8">

      <div className="absolute top-0 left-0 hidden md:flex justify-start w-full mb-10">
        <img src="/vector-75-1.svg" alt="Line pattern" className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]" />
      </div>

      <div className="container mx-auto">
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-3xl 2xl:text-3xl font-bold mb-6 mt-10 text-black">
            What do Brands say about
            <br />
            <span className="relative inline-block">Tribe Me?</span>
          </h2>

          <div {...handlers} className="flex flex-col md:flex-row md:justify-between gap-6">
            {cardContent.map((content, index) => (
             
             <div key={index} className={`bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between border border-gray-200 transition-transform transform w-full ${index === activeIndex ? "block" : "hidden"} md:block`} style={{ minHeight: "300px", width: "100%", }}>
                <div className="flex flex-col h-full">

                  <div className="mb-4">
                    <Image src="/quoteup.png" alt="Quote" width={40} height={40} style={{ filter: 'invert(36%) sepia(74%) saturate(2848%) hue-rotate(333deg) brightness(100%) contrast(100%)' }} />
                  </div>

                  <p className="text-base sm:text-lg text-gray-600 flex-grow">
                    {content.text}
                  </p>

                  <span className="text-[#FF3951] text-xl font-medium mt-4">
                    {content.name}
                  </span>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;