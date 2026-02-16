import React, { useState } from "react";

const FAQS = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "WHAT IS TRIBE ME?",
      answer: (
        <>
          TRIBE ME is a Movement that is changing the world in terms of data and
          privacy. Everywhere you go online or in an app, someone else is
          profiting from your data, known as “3rd Party Data.” TRIBE ME is
          Different. TRIBE ME{" "}
          <u>shares 50% of all 3rd Party Data profits with members</u>!<br />
          <br />
          The TRIBE ME Movement is about taking charge of your personal data for
          your own profit and along the way easily getting cash back and deals
          on stuff you truly like - vs. searching through an inbox or text queue
          that is full of irrelevant offers.
          <br />
          <br />
          The TRIBE ME Movement occurs via a mobile app and community that for
          members has been described as “Ibotta meets Tinder.” By scrolling and
          Liking Businesses, Members discover new brands and opt-in to receive
          cash back, deals and special offers from liked businesses. All of your
          TRIBE ME usage information increases the value of our 3rd party data.
          <br />
          <br />
          For Businesses, the TRIBE ME Movement grossly simplifies new customer
          acquisition, loyalty and learning while eliminating the costs
          associated with designing and delivering email/text messages that get
          lost in inboxes and text queues of the wrong people.
          <br />
          <br />
          TRIBE ME is FREE for Businesses while also providing FREE Reach and
          only charges for successful redemptions and advanced features.
        </>
      ),
    },
    {
      question: "WHERE IS TRIBE ME AVAILABLE?",
      answer: `Our Beta product launch is limited to Boulder, Colorado. Since our platform matches
      (mostly) local businesses with local users, we are launching in one city to kickstart 
      momentum.  We are actively seeking investment to fund the databases and technology 
      necessary for TRIBE ME to be expanded to a National and Global audience.`,
    },

    {
      question: "HOW MUCH MONEY CAN I MAKE?",
      answer: (
        <>
          You (Members) will be making money by saving money by getting cash
          back and deals on stuff you like every time you use TRIBE ME!
          <br />
          <br />
          In terms of additional money to be made from the anonymized
          monetization of your 3rd party data, truthfully we don’t know how much
          it will be or how long it will take. We just know that if we build it
          (together), the 3rd party data buyers will come!
          <br />
          <br />
          You see, apps and online sites only make pennies off of each
          individual user’s 3rd party data, but those pennies add up for them to
          make $ millions -{" "}
          <u>
            once they have millions of users with lots of information about each
            user
          </u>
          .<br />
          <br />
          Maybe it will be enough to cover a Netflix subscription? Maybe it will
          be much more? We DO know that it will take us a long time for the 3rd
          party data money that we are making for you to become a meaningful
          amount.
          <br />
          <br />
          However, again. Once we build it together, the 3rd party data buyers
          will come! To help us all get there quickly, we need YOU to be active
          in the Movement by:
          <ul className="list-disc list-inside pl-3">
            <li>
              Scrolling, Liking Brands, Enjoying the cash back and deals on
              things you Liked, thus providing more information making our 3rd
              party data most valuable!
            </li>
            <li>
              Sharing and Referring TRIBE ME to all of your friends, thus
              providing more users and value to data buyers! (and earning you
              TRIBE ME POINTS and TRIBE ME COINS via your special referral
              link).
            </li>
          </ul>
          <br />
          We promise to be completely transparent in reporting our growth
          progress along the way and we will feature a Leaderboard showing those
          who have earned the most TRIBE ME POINTS and are thus providing the
          most quantified impact on TRIBE ME’s growth.
        </>
      ),
    },

    {
      question: "WHAT ARE TRIBE ME COINS AND TRIBE ME POINTS?",
      answer: (
        <>
          In exchange for help by sharing TRIBE ME redemptions and for referring
          members who then make redemptions, Members will receive:
          <ul className="list-disc list-inside pl-3">
            <li>
              TRIBE ME POINTS, which are used for Member status and to determine
              profit allocation as those with higher points will get a higher
              share of data profits once distributed
            </li>
            <li>
              TRIBE ME COINS, which can be used for purchases inside of TRIBE ME
              or cashed out as cash to your bank account. Current cash value is
              $0.05 per coin.
            </li>
          </ul>
          <br />
          TRIBE ME referral rewards go 2-deep. That is, Member A who refers
          Member B receives TRIBE ME POINTS upon Member B joining and qualifies
          for TRIBE ME COINS which are earned upon Member B’s first offer
          redemption.
          <br />
          <br />
          Once Member B then refers Member C, Member A will receive TRIBE ME
          POINTS upon Member C joining (in a future release, we plan to also
          qualify Member A to earn TRIBE ME COINS upon Member C’s first offer
          redemption).
          <br />
          <br />
          TRIBE ME POINTS accumulate over one’s lifetime usage, so all members
          of our Boulder, Colorado Beta launch program will be treated as
          “Founding Members” and thus will enjoy a lifetime of SPECIAL STATUS
          advantages within TRIBE ME (TBD: Special Offers, Unique Experiences,
          Contest Advantages, Bonus Profit Sharing, etc.)
        </>
      ),
    },

    {
      question: "HOW DO I GET PAID?",
      answer: (
        <>
          A corresponding number of TRIBE ME COINS are earned for each CASH BACK
          offer redemption inside of TRIBE ME and can be cashed out on a monthly
          basis.
          <br />
          <br />
          All 3rd party data revenue sharing will occur in the form of a deposit
          of TRIBE ME COINS into each Member’s account based on the member’s
          relative standing in terms of TRIBE ME POINTS.
          <br />
          <br />
          Members link their bank accounts so as to receive cash from TRIBE ME
          after converting their TRIBE ME COINS into cash within the app.
        </>
      ),
    },

    {
      question: "WHY JOIN TRIBE ME?",
      answer: (
        <>
          Because you’re tired of others making money off of your 3rd party
          usage data
          <br />
          Because you want to be a part of changing the world’s paradigm by
          building something different
          <br />
          Because you want SPECIAL DEALS and UNIQUE EXPERIENCES
          <br />
          Because you like to get CASH BACK and SAVE MONEY on stuff you like
          <br />
          Because you want to MAKE MONEY off of your own 3rd party data
          <br />
          Because you want to have deals available when you need them and in one
          central location
          <br />
          <br />
          Because you’re a Business that’s:
          <br />
          <ul className="list-disc list-inside pl-3">
            <li>
              Tired of spending so much money on creative design for email and
              text messages.
            </li>
            <li>
              Tired of spending too much money on email and text message
              platforms.
            </li>
            <li>
              Tired of low response rates since messages are rarely seen by the
              right people at the right time.
            </li>
            <li>
              Looking to deliver FREE REACH to a universe of potential new
              buyers.
            </li>
            <li>
              Moving to simplify promotional communications, lower customer
              acquisition costs and maximize long-term customer value.
            </li>
          </ul>
        </>
      ),
    },
  ];

  const toggleFAQ = (index: any) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="bg-[#FEFEFE]">
      <div className="max-w-3xl mx-auto">
        {/* HEADINGS */}
        <div className="">
          <h1 className="font-semibold leading-8 text-center text-md font-outfit text-pink mb-2">
            FAQs
          </h1>
          <h2 className="text-center text-[#000000] text-3xl leading-[45px] font-bold font-outfit mb-6">
            TRIBE ME FREQUENTLY <br /> ASKED QUESTIONS
          </h2>
        </div>

        {/* ALL FAQS */}
        <div className="border-t border-pink text-black">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border-b border-pink ${
                index === activeIndex ? "" : ""
              }`}
            >
              <button
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                {/* QUESTION */}
                <span className="text-lg font-semibold">{faq.question}</span>

                {/* ARROWS */}
                <span
                  className={`text-2xl transform transition-transform ${
                    index === activeIndex
                      ? "text-center text-pink w-9 h-9 rotate-90"
                      : "text-center text-black w-9 h-9 rotate-90"
                  }`}
                >
                  {index === activeIndex ? "<" : ">"}
                </span>
              </button>

              {/* ANSWER */}
              {index === activeIndex && (
                <div className="p-5 mb-5 bg-[#F9F9F9] font-outfit text-gray-700 text-sm drop-shadow-md rounded-md leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQS;
