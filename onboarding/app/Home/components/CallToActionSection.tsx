import React from "react";

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-16 bg-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="bg-[#ff3951] text-white p-8 sm:p-12 rounded-[25px] w-full max-w-[1600px] h-auto sm:h-[300px] mx-auto text-center flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-3xl 2xl:text-4xl font-bold mb-6">
            Getting Started is
            <span className="relative">
              {" "}
              Easy
              <div className="absolute bottom-0 left-0 flex justify-center w-full">
                <img
                  src="/vector-61.svg"
                  alt="Line pattern"
                  className="w-full max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]"
                />
              </div>
            </span>
          </h2>
          <a
            href="/Waitlist"
            className="inline-block bg-black text-white text-base sm:text-lg font-semibold py-3 px-6 rounded hover:bg-white hover:text-black transition"
          >
            Join the Waitlist!
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
