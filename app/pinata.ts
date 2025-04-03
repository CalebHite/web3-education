import axios from 'axios';

// Define the Lesson interface
export interface Lesson {
  id?: string;
  title: string;
  content: string;
  author: string;
  icon?: string; // Icon name from lucide-react
  notionUrl?: string; // URL to the Notion page
  createdAt?: Date;
  updatedAt?: Date;
  ipfsHash?: string;
}

// Pinata API configuration
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT || '';

// Axios instance with Pinata authentication
const pinataApi = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    'Authorization': `Bearer ${PINATA_JWT}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a lesson object to Pinata
 * @param lesson The lesson object to upload
 * @returns The uploaded lesson with IPFS hash
 */
export async function uploadLesson(lesson: Lesson): Promise<Lesson> {
  try {
    // Add timestamps if not provided
    const lessonToUpload = {
      ...lesson,
      createdAt: lesson.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Upload to Pinata
    const response = await pinataApi.post('/pinning/pinJSONToIPFS', {
      pinataContent: lessonToUpload,
      pinataOptions: {
        cidVersion: 0,
      },
    });

    // Return the lesson with the IPFS hash
    return {
      ...lessonToUpload,
      ipfsHash: response.data.IpfsHash,
    };
  } catch (error) {
    console.error('Error uploading lesson to Pinata:', error);
    throw new Error('Failed to upload lesson to Pinata');
  }
}

/**
 * Retrieve a lesson object from Pinata by IPFS hash
 * @param ipfsHash The IPFS hash of the lesson
 * @returns The retrieved lesson object
 */
export async function getLesson(ipfsHash: string): Promise<Lesson> {
  try {
    console.log(`Attempting to retrieve lesson with hash: ${ipfsHash}`);
    // Use the public gateway to retrieve the content
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving lesson with hash ${ipfsHash}:`, error);
    throw new Error('Failed to retrieve lesson from Pinata');
  }
}

/**
 * Retrieve all lesson objects from Pinata
 * @returns Array of lesson objects with their IPFS hashes
 */
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    console.log("Fetching lessons from Pinata...");
    // Get all pinned items from Pinata
    const response = await pinataApi.get('/data/pinList', {
      params: {
        status: 'pinned',
        pageLimit: 1000, // Adjust as needed
      },
    });

    console.log("Pinata API response:", response.data);
    console.log("Total pins found:", response.data.rows.length);

    // Log all pins for debugging
    response.data.rows.forEach((pin: any, index: number) => {
      console.log(`Pin ${index}:`, {
        hash: pin.ipfs_pin_hash,
        name: pin.metadata?.name,
        keyvalues: pin.metadata?.keyvalues,
        size: pin.size,
        timestamp: pin.timestamp
      });
    });

    // More lenient filtering - include all pins for now
    const lessonPins = response.data.rows;
    console.log("Using all pins as lessons:", lessonPins.length);

    // Retrieve each lesson's content
    const lessons: Lesson[] = [];
    for (const pin of lessonPins) {
      try {
        console.log("Fetching lesson content for hash:", pin.ipfs_pin_hash);
        const lesson = await getLesson(pin.ipfs_pin_hash);
        console.log("Retrieved lesson:", lesson);
        lessons.push({
          ...lesson,
          ipfsHash: pin.ipfs_pin_hash,
        });
      } catch (error) {
        console.error(`Error retrieving lesson with hash ${pin.ipfs_pin_hash}:`, error);
        // Continue with other lessons even if one fails
      }
    }

    console.log("Total lessons retrieved:", lessons.length);
    return lessons;
  } catch (error) {
    console.error('Error retrieving all lessons from Pinata:', error);
    throw new Error('Failed to retrieve lessons from Pinata');
  }
}
