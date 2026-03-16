import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/**
 * Returns true if Pinata credentials are configured in .env.
 */
export const isPinataConfigured = () =>
  Boolean(PINATA_API_KEY && PINATA_SECRET_API_KEY);

/**
 * Upload a File/Blob to IPFS via Pinata.
 * @param {File} file
 * @returns {Promise<string>} IPFS CID (without ipfs:// prefix)
 */
export const uploadImageToPinata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', options);

  const response = await axios.post(PINATA_FILE_URL, formData, {
    maxBodyLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return response.data.IpfsHash; // CID string
};

/**
 * Upload a JSON object to IPFS via Pinata.
 * @param {object} json
 * @returns {Promise<string>} IPFS CID (without ipfs:// prefix)
 */
export const uploadMetadataToPinata = async (json) => {
  const response = await axios.post(
    PINATA_JSON_URL,
    {
      pinataContent: json,
      pinataOptions: { cidVersion: 1 },
    },
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  return response.data.IpfsHash; // CID string
};
