import { RLP } from '@ethereumjs/rlp';

export function decodeRlpTransactionHashes(rlpHex: string): string[] {
    try {
        const cleanHex = rlpHex.startsWith('0x') ? rlpHex.slice(2) : rlpHex;
        const buffer = Buffer.from(cleanHex, 'hex');
        const decoded = RLP.decode(buffer) as Buffer[];
        
        return decoded.map(item => {
            const hex = item.toString('utf8'); // Changed to utf8 since the RLP encoded data contains the full hex string
            return hex.startsWith('0x') ? hex : '0x' + hex;
        });
    } catch (error) {
        console.error('RLP Decoding Error:', error);
        throw new Error('Invalid RLP encoded data');
    }
}