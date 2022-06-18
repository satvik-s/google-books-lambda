import axios, { AxiosError } from 'axios';

const DEFAULT_BOOK = 'da vinci code';
const DEFAULT_QUERY_PARAMS = { langRestrict: 'en', maxResults: 1 };
const GOOGLE_BOOKS_SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes';

async function getBookInfo(book: string) {
    try {
        const resp = await axios.get(GOOGLE_BOOKS_SEARCH_URL, {
            params: { ...DEFAULT_QUERY_PARAMS, q: book },
        });

        console.log(resp.data);

        const topBook = resp.data.items?.[0] ?? {};

        console.log(topBook);

        return topBook;
    } catch (error) {
        const err = error as AxiosError;
        console.error(err.message ?? 'error while retrieving book info');
        return {};
    }
}

export async function main(event: {
    queryStringParameters?: Record<string, string>;
}) {
    const book = event.queryStringParameters?.book ?? DEFAULT_BOOK;

    return {
        body: JSON.stringify(await getBookInfo(book)),
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
