import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(POCKETBASE_URL);
    pbInstance.autoCancellation(false);
  }
  return pbInstance;
}

export default getPocketBase;
