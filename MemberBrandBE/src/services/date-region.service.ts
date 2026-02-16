const axios = require("axios");

const ipinfoToken = "ebc25cd5d6718b";

async function currentRegionDate(userIP: string | number) {
  try {
    const response = await axios.get(
      `https://ipinfo.io/${userIP}?token=${ipinfoToken}`
    );
    const data = response.data;

    const userCity = data.city;
    const userTimeZone = data.timezone;

    const currentDateTime = new Date().toLocaleString("sv", {
      timeZone: userTimeZone,
    });

    return {
      city: userCity,
      timezone: userTimeZone,
      localDateTime: currentDateTime,
    };
  } catch (error) {
    console.error("Error fetching location data");
    throw new Error("Failed to fetch user data");
  }
}

export default currentRegionDate;
