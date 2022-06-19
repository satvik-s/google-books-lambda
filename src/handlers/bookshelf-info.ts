import { auth, books, books_v1 } from '@googleapis/books';

const GOOGLE_BOOKS_SHELF_IDS = {
    HAVE_READ: '4',
    READING_NOW: '3',
};
const MAX_RESULTS = 10;
const RESPONSE_RESULTS = 3;

const authClient = new auth.GoogleAuth({
    credentials: {
        client_email: process.env.EMAIL,
        private_key: process.env.PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/books'],
});

const booksClient = books('v1');

async function getHaveReadBooks() {
    try {
        return (
            (
                await booksClient.bookshelves.volumes.list({
                    auth: authClient,
                    userId: process.env.USER_ID,
                    shelf: GOOGLE_BOOKS_SHELF_IDS.HAVE_READ,
                    maxResults: MAX_RESULTS,
                })
            ).data.items ?? []
        );
    } catch (error) {
        const err = error as any;
        console.error(err.message ?? 'error while retrieving have read books');
        return [];
    }
}

async function getReadingNowBooks() {
    try {
        return (
            (
                await booksClient.bookshelves.volumes.list({
                    auth: authClient,
                    userId: process.env.USER_ID,
                    shelf: GOOGLE_BOOKS_SHELF_IDS.READING_NOW,
                    maxResults: MAX_RESULTS,
                })
            ).data.items ?? []
        );
    } catch (error) {
        const err = error as any;
        console.error(
            err.message ?? 'error while retrieving books currently reading',
        );
        return [];
    }
}

async function getBookInfo() {
    try {
        const [readingNowResp, haveReadResp] = [
            await getReadingNowBooks(),
            await getHaveReadBooks(),
        ];

        console.log(readingNowResp, haveReadResp);

        return {
            readingNow: readingNowResp
                .map(normalizeInfo)
                .sort((x, y) =>
                    (x.lastUpdatedAt ?? '') < (y.lastUpdatedAt ?? '') ? 1 : -1,
                )
                .slice(0, RESPONSE_RESULTS),
            haveRead: haveReadResp
                .map(normalizeInfo)
                .sort((x, y) =>
                    (x.lastUpdatedAt ?? '') < (y.lastUpdatedAt ?? '') ? 1 : -1,
                )
                .slice(0, RESPONSE_RESULTS),
        };
    } catch (error) {
        const err = error as any;
        console.error(err.message ?? 'error while retrieving book info');
        return {};
    }
}

function normalizeInfo(book: books_v1.Schema$Volume) {
    return {
        id: book.id,
        link: 'https://www.google.com/books/edition/_/' + book.id,
        title: book.volumeInfo?.title,
        authors: book.volumeInfo?.authors,
        publishedDate: book.volumeInfo?.publishedDate,
        pageCount: book.volumeInfo?.pageCount,
        imageLinks: book.volumeInfo?.imageLinks,
        categories: book.volumeInfo?.categories,
        lastUpdatedAt: book.userInfo?.updated,
        description: book.volumeInfo?.description,
    };
}

export async function main() {
    return {
        body: JSON.stringify(await getBookInfo()),
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
