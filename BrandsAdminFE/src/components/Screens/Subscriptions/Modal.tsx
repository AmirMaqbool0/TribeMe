import React from "react";

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
}) => {
    const subscriptionData = [
        { feature: "% Who Ignored & Switched to Liking", tier1: "Ever", tier2: "Ever, Past 12 Months", tier3: "Ever, Past 12 Months, Past 90 Days, Past 30 Days" },
        { feature: "% Who Disliked & Switched to Liking", tier1: "Ever", tier2: "Ever, Past 12 Months", tier3: "Ever, Past 12 Months, Past 90 Days, Past 30 Days" },
        { feature: "Age View", tier1: "Y", tier2: "Y", tier3: "Y" },
        { feature: "Gender View", tier1: "Y", tier2: "Y", tier3: "Y" },
        { feature: "Sort Views by Likes", tier1: "Y", tier2: "Y", tier3: "Y" },
        { feature: "Sort Views by Redemptions", tier1: "Y", tier2: "Y", tier3: "Y" },
        { feature: "Sort Views by Dislikes", tier1: "NO", tier2: "NO", tier3: "Y" },
        { feature: "Top Tribe View", tier1: "1", tier2: "3", tier3: "5" },
        { feature: "Top City View", tier1: "1", tier2: "5", tier3: "10" },
        { feature: "People Who Like, Also Like & Dislike", tier1: "NO", tier2: "NO", tier3: "Top 10 Brands All Categories" },
        { feature: "People Who Dislike, Also Like & Dislike", tier1: "NO", tier2: "NO", tier3: "Top 10 Brands All Categories" },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 h-full flex items-center justify-center bg-black !bg-opacity-50 z-50 "  aria-labelledby="modal-title" aria-hidden="true">
            {/* Modal Content */}
            <div className="bg-primary w-full sm:w-[80%] max-w-[95%] relative rounded-xl shadow-lg p-6 transform transition-transform scale-100">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-bold font-outfit text-gray-800">Subscription Plans</h2>
                    <button
                        onClick={onClose}
                        className="text-Red text-2xl font-bold focus:outline-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Modal Table */}
                <div className="mt-5 overflow-x-auto max-h-[65vh] sm:max-h-[70vh]">
                    <table className="table-auto full border-collapse text-center">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 font-proxima">
                                <th className="px-4 py-2 border">Feature</th>
                                <th className="px-4 py-2 border">Tier 1 (Free)</th>
                                <th className="px-4 py-2 border">Tier 2</th>
                                <th className="px-4 py-2 border">Tier 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionData.map((row, index) => (
                                <tr
                                    key={index}
                                    className={`text-gray-700 text-sm font-outfit ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                >
                                    <td className="px-4 py-2 border">{row.feature}</td>
                                    <td className="px-4 py-2 border">{row.tier1}</td>
                                    <td className="px-4 py-2 border">{row.tier2}</td>
                                    <td className="px-4 py-2 border">{row.tier3}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-7 py-3 bg-gray-300 text-Blackish rounded-lg font-medium font-inter hover:bg-gray-300 hover:text-gray-600">Close</button>
                    <button onClick={() => console.log("Subscribe button clicked")} className="px-5 py-3 bg-Red text-primary rounded-lg font-medium font-inter hover:bg-red-400">Subscribe</button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
