import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const CACHE_DIR = path.resolve(__dirname, '../cache'); 

const MAX_CACHE_SIZE = 1000;

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
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
