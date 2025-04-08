const getUserIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error(`Failed to fetch IP: ${response.status}`);
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
};

export default getUserIp;