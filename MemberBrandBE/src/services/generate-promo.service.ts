export const generateOfferCodes = (offerName: string, userLimit: number) => {
  const prefix = offerName.slice(0, 3).toLowerCase();
  const uniqueTimestamp = Date.now().toString(36);
  
  const currentTime = new Date();
  const minuteSeconds = `${currentTime
    .getMinutes()
    .toString()
    .padStart(2, "0")}${currentTime
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

  const offerSerial = `${prefix}-${uniqueTimestamp}`;
  
  let promoCodes: string[] = [];
  let generatedCodes: Set<string> = new Set(); // To track unique codes
  
  for (let i = 0; i < (userLimit || 1); i++) {
    let isUnique = false;
    let attempts = 0;
    let potentialCode: string;

    while (!isUnique && attempts < 5) {
      const randomCode = Math.random().toString(36).substr(2, 7);
      potentialCode = `${prefix}-${randomCode}-${minuteSeconds}`;
      
      // Check if the potential code is unique
      if (!generatedCodes.has(potentialCode)) {
        isUnique = true;
        promoCodes.push(potentialCode);
        generatedCodes.add(potentialCode); // Mark this code as used
      }
      
      attempts++;
    }

    if (attempts >= 5 && !isUnique) {
      // If we can't generate a unique code after 5 attempts, we exit
      throw new Error(`Unable to generate a unique promo code after 5 attempts for offer: ${offerName}`);
    }
  }

  return { offerSerial, promoCodes };
};
