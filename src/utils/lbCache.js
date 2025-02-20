import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '../cache');

const MAX_CACHE_SIZE = process.env.CACHE_SIZE || 1000;

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const getFilePath = (lbPair) => path.join(CACHE_DIR, lbPair.toString());

const isInCache = (lbPair) => {
    const filePath = getFilePath(lbPair);
    return fs.existsSync(filePath);
};

const addToCache = (lbPair) => {
    const filePath = getFilePath(lbPair);
    if (fs.existsSync(filePath)) {
        return;
    }

    fs.writeFileSync(filePath, '');
};

const removeFromCache = () => {
    const files = fs.readdirSync(CACHE_DIR);
    if (files.length > MAX_CACHE_SIZE) {
        const oldestFile = files[0];
        fs.unlinkSync(path.join(CACHE_DIR, oldestFile));
    }
};

export default { isInCache, addToCache, removeFromCache };
