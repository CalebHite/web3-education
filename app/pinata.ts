import axios from 'axios';

// Define the Lesson interface
export interface Lesson {
  id?: string;
  title: string;
  content: string;
  author: string;
  icon?: string; // Icon name from lucide-react
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
    // Get all pinned items from Pinata
    const response = await pinataApi.get('/data/pinList', {
      params: {
        status: 'pinned',
        pageLimit: 1000, // Adjust as needed
      },
    });

    // Filter for JSON files (assuming lessons are stored as JSON)
    const lessonPins = response.data.rows.filter((pin: any) => {
      // Safely check if metadata and name exist
      const hasJsonName = pin.metadata?.name?.endsWith('.json');
      const isLessonType = pin.metadata?.keyvalues?.type === 'lesson';
      return hasJsonName || isLessonType;
    });

    // Retrieve each lesson's content
    const lessons: Lesson[] = [];
    for (const pin of lessonPins) {
      try {
        const lesson = await getLesson(pin.ipfs_pin_hash);
        lessons.push({
          ...lesson,
          ipfsHash: pin.ipfs_pin_hash,
        });
      } catch (error) {
        console.error(`Error retrieving lesson with hash ${pin.ipfs_pin_hash}:`, error);
        // Continue with other lessons even if one fails
      }
    }

    return lessons;
  } catch (error) {
    console.error('Error retrieving all lessons from Pinata:', error);
    throw new Error('Failed to retrieve lessons from Pinata');
  }
}
