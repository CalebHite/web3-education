import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import { CreatePageResponse } from '@notionhq/client/build/src/api-endpoints';

// Initialize the Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Initialize the Notion API for client-side operations
const notionApi = new NotionAPI();

// Define the Lesson interface
export interface Lesson {
  id?: string;
  title: string;
  content: string;
  author: string;
  icon?: string;
  notionPageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ipfsHash?: string;
}

/**
 * Get a Notion page by ID
 * @param pageId The Notion page ID
 * @returns The page record map
 */
export async function getNotionPage(pageId: string): Promise<ExtendedRecordMap> {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    const recordMap = await notionApi.getPage(pageId);
    return recordMap;
  } catch (error) {
    console.error('Error retrieving Notion page:', error);
    throw new Error('Failed to retrieve Notion page');
  }
}

/**
 * Get all lessons from Notion database
 * @returns Array of lesson objects
 */
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID is not defined');
    }

    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const lessons: Lesson[] = response.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Title?.title[0]?.plain_text || '',
      content: page.properties.Content?.rich_text[0]?.plain_text || '',
      author: page.properties.Author?.rich_text[0]?.plain_text || '',
      icon: page.properties.Icon?.select?.name || 'BookOpen',
      notionPageId: page.id,
      createdAt: new Date(page.created_time),
      updatedAt: new Date(page.last_edited_time),
    }));

    return lessons;
  } catch (error) {
    console.error('Error retrieving lessons from Notion:', error);
    throw new Error('Failed to retrieve lessons from Notion');
  }
}

/**
 * Create a new lesson in Notion
 * @param lesson The lesson object to create
 * @returns The created lesson object
 */
export async function createLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID is not defined');
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: lesson.title,
              },
            },
          ],
        },
        Content: {
          rich_text: [
            {
              text: {
                content: lesson.content,
              },
            },
          ],
        },
        Author: {
          rich_text: [
            {
              text: {
                content: lesson.author,
              },
            },
          ],
        },
        Icon: {
          select: {
            name: lesson.icon || 'BookOpen',
          },
        },
      },
    }) as CreatePageResponse;

    return {
      id: response.id,
      title: lesson.title,
      content: lesson.content,
      author: lesson.author,
      icon: lesson.icon,
      notionPageId: response.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating lesson in Notion:', error);
    throw new Error('Failed to create lesson in Notion');
  }
} 