// K-Anonymity Password Checker using Have I Been Pwned API
export async function checkPasswordCompromise(password) {
  // 1. Hash the password using SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  // 2. Split the hash for K-Anonymity
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  try {
    // 3. Fetch all hashes starting with the prefix
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error(`HIBP API Error: ${response.status}`);
    }
    
    // The response is a plain text list of suffixes and their leak counts
    // e.g., "0018A45C4D1DEF81644B54AB7F969B88D65:1"
    const text = await response.text();
    
    // 4. Find our suffix in the list
    const lines = text.split('\n');
    let leakCount = 0;
    
    for (const line of lines) {
      const [lineSuffix, count] = line.split(':');
      if (lineSuffix.trim() === suffix) {
        leakCount = parseInt(count, 10);
        break;
      }
    }

    return leakCount;
  } catch (error) {
    console.error('Error checking password:', error);
    return -1; // Indicate error
  }
}
